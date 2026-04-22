import { NextResponse, type NextRequest } from "next/server";
import { getNextUnansweredSessionQuestion } from "@/lib/quiz/getCurrentQuestion";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { answerBodySchema } from "@/lib/validations/answer";
import { parseSessionIdParam } from "@/lib/validations/quiz";

type RouteParams = { sessionId: string };

/**
 * 送出單題答案，寫入 answers，並回傳是否已答完
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const { sessionId: raw } = await context.params;
  let sessionId: string;
  try {
    sessionId = parseSessionIdParam(raw);
  } catch (e) {
    const m = e instanceof Error ? e.message : "參數錯誤";
    return NextResponse.json({ success: false, message: m }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "無法解析 JSON" },
      { status: 400 },
    );
  }

  const parsed = answerBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, message: first?.message ?? "參數驗證失敗" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const {
    questionId,
    selectedChoiceIndex,
    confidenceLevel,
    shownAt,
    answeredAt,
    timeSpentSeconds,
  } = d;

  try {
    const supabase = createAdminSupabaseClient();

    const { data: session, error: se } = await supabase
      .from("test_sessions")
      .select("id, status, total_questions")
      .eq("id", sessionId)
      .maybeSingle();
    if (se || !session) {
      if (!session) {
        return NextResponse.json(
          { success: false, message: "找不到此測驗工作階段" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: false, message: "讀取測驗工作階段失敗" },
        { status: 500 },
      );
    }
    if (session.status === "completed") {
      return NextResponse.json(
        { success: false, message: "測驗已結束，無法再作答" },
        { status: 400 },
      );
    }

    const { data: sq, error: sqe } = await supabase
      .from("session_questions")
      .select("id, question_id, question_order")
      .eq("session_id", sessionId)
      .eq("question_id", questionId)
      .limit(1)
      .maybeSingle();
    if (sqe) {
      console.error("quiz/answer: session_questions 查詢失敗", sqe);
      return NextResponse.json(
        { success: false, message: "驗證題目歸屬失敗" },
        { status: 500 },
      );
    }
    if (!sq) {
      return NextResponse.json(
        { success: false, message: "此題不屬於本場測驗" },
        { status: 400 },
      );
    }

    const { data: existed, error: exErr } = await supabase
      .from("answers")
      .select("id")
      .eq("session_id", sessionId)
      .eq("question_id", questionId)
      .limit(1)
      .maybeSingle();
    if (exErr) {
      console.error("quiz/answer: answers 重複檢查失敗", exErr);
      return NextResponse.json(
        { success: false, message: "檢查作答狀態失敗" },
        { status: 500 },
      );
    }
    if (existed) {
      return NextResponse.json(
        { success: false, message: "此題已作答，請重新整理頁面" },
        { status: 409 },
      );
    }

    const { data: qbank, error: qe } = await supabase
      .from("question_bank")
      .select("correct_choice_index, choices")
      .eq("id", questionId)
      .maybeSingle();
    if (qe || !qbank) {
      return NextResponse.json(
        { success: false, message: "讀取題庫比對答案失敗" },
        { status: 500 },
      );
    }

    const isCorrect = selectedChoiceIndex === qbank.correct_choice_index;

    const { error: ins } = await supabase.from("answers").insert({
      session_id: sessionId,
      question_id: questionId,
      selected_choice_index: selectedChoiceIndex,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      confidence_level: confidenceLevel,
      shown_at: shownAt,
      answered_at: answeredAt,
    });
    if (ins) {
      console.error("quiz/answer: insert", ins);
      return NextResponse.json(
        { success: false, message: "寫入答案失敗" },
        { status: 500 },
      );
    }

    const { data: srowsAfter, error: sre } = await supabase
      .from("session_questions")
      .select("question_id, question_order")
      .eq("session_id", sessionId);
    if (sre) {
      return NextResponse.json(
        { success: false, message: "統計場次題目失敗" },
        { status: 500 },
      );
    }
    const { data: arsAfter, error: are2 } = await supabase
      .from("answers")
      .select("question_id")
      .eq("session_id", sessionId);
    if (are2) {
      return NextResponse.json(
        { success: false, message: "統計作答紀錄失敗" },
        { status: 500 },
      );
    }

    const setAnsAfter = new Set((arsAfter ?? []).map((a) => a.question_id));
    const answeredUnique = setAnsAfter.size;
    const nxtAfter = getNextUnansweredSessionQuestion(srowsAfter ?? [], setAnsAfter);
    const totalQ = session.total_questions;
    /**
     * 僅以 test_sessions.total_questions 與「相異已答題數」為準，避免
     * session_questions 列數 > 總題數時 nxt 永遠不為 null、無法觸發 finish。
     * （不依賴 nxt==null 單獨當作完卷，以免重複 qid 列被少數幾筆答題蓋滿導致誤判。）
     */
    const allDone = totalQ > 0 && answeredUnique >= totalQ;

    /** 與 GET /current 一致：顯示題序 = 相異已答題數 + 1 */
    const nextQuestionOrder =
      allDone || !nxtAfter ? null : Math.min(answeredUnique + 1, totalQ);

    return NextResponse.json({
      success: true,
      isCorrect,
      completed: allDone,
      nextQuestionOrder,
      answeredCount: answeredUnique,
      totalQuestions: totalQ,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    console.error("quiz/answer: unexpected", err);
    if (msg.includes("SUPABASE") || msg.includes("SERVICE_ROLE")) {
      return NextResponse.json(
        { success: false, message: "伺服器未正確設定 Supabase" },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, message: "系統暫時無法處理請求" },
      { status: 500 },
    );
  }
}
