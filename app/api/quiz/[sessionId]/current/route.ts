import { NextResponse, type NextRequest } from "next/server";
import { getNextUnansweredSessionQuestion } from "@/lib/quiz/getCurrentQuestion";
import { parseChoiceStrings } from "@/lib/quiz/parseQuestionChoices";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseSessionIdParam } from "@/lib/validations/quiz";

type RouteParams = { sessionId: string };

/**
 * 取得測驗當前題目：尚未作答之最小 question_order；若皆已作答則 completed=true
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const { sessionId: raw } = await context.params;
  let sessionId: string;
  try {
    sessionId = parseSessionIdParam(raw);
  } catch (e) {
    const m = e instanceof Error ? e.message : "參數錯誤";
    return NextResponse.json(
      { success: false, message: m },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: session, error: se } = await supabase
      .from("test_sessions")
      .select("id, total_questions, status")
      .eq("id", sessionId)
      .maybeSingle();

    if (se) {
      console.error("quiz/current: load session", se);
      return NextResponse.json(
        { success: false, message: "讀取測驗工作階段失敗" },
        { status: 500 },
      );
    }
    if (!session) {
      return NextResponse.json(
        { success: false, message: "找不到此測驗工作階段" },
        { status: 404 },
      );
    }

    const { data: rows, error: re } = await supabase
      .from("session_questions")
      .select("id, question_id, question_order, module, difficulty")
      .eq("session_id", sessionId);

    if (re) {
      console.error("quiz/current: list session_questions", re);
      return NextResponse.json(
        { success: false, message: "讀取題目清單失敗" },
        { status: 500 },
      );
    }

    if (rows == null || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "測驗尚未初始化題目，請先呼叫測驗開始",
        },
        { status: 404 },
      );
    }

    const { data: ansRows, error: ae } = await supabase
      .from("answers")
      .select("question_id")
      .eq("session_id", sessionId);

    if (ae) {
      console.error("quiz/current: list answers", ae);
      return NextResponse.json(
        { success: false, message: "讀取作答紀錄失敗" },
        { status: 500 },
      );
    }

    const answeredIds = new Set((ansRows ?? []).map((a) => a.question_id));
    const next = getNextUnansweredSessionQuestion(rows, answeredIds);

    /** 與畫面「第幾題」一致：以「相異已答題數 +1」作為顯示序，不沿用 DB 的 question_order，避免與進度條已答題數錯位。 */
    const answeredCount = answeredIds.size;
    const totalQ = session.total_questions;
    /** 以工作階段設定的總題數為準，避免因 session_questions 重複列導致永遠有「下一題」、無法結束。 */
    const allAnsweredByPlan = totalQ > 0 && answeredCount >= totalQ;

    if (session.status === "completed" || allAnsweredByPlan || !next) {
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        totalQuestions: totalQ,
        currentQuestionOrder: totalQ,
        answeredCount: Math.min(answeredCount, totalQ),
        completed: true,
        question: null,
      });
    }

    if (process.env.NODE_ENV === "development" && next.question_order !== answeredCount + 1) {
      console.warn("quiz/current: question_order 與已答筆數不同步，已以顯示序修正", {
        questionOrder: next.question_order,
        answeredCount,
        expectedOrder: answeredCount + 1,
        sessionId,
        rowCount: rows.length,
        total_questions: totalQ,
      });
    }

    const { data: bank, error: be } = await supabase
      .from("question_bank")
      .select(
        "id, module, difficulty, qtype, prompt, choices, estimated_time_seconds",
      )
      .eq("id", next.question_id)
      .maybeSingle();

    if (be) {
      console.error("quiz/current: load question_bank", be);
      return NextResponse.json(
        { success: false, message: "讀取題目內容失敗" },
        { status: 500 },
      );
    }
    if (!bank) {
      return NextResponse.json(
        { success: false, message: "題庫中找不到此題" },
        { status: 404 },
      );
    }

    const displayQuestionOrder = Math.min(answeredCount + 1, totalQ);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      totalQuestions: totalQ,
      currentQuestionOrder: displayQuestionOrder,
      answeredCount,
      completed: false,
      question: {
        id: bank.id,
        module: bank.module,
        difficulty: bank.difficulty,
        qtype: bank.qtype,
        prompt: bank.prompt,
        choices: parseChoiceStrings(bank.choices),
        estimated_time_seconds: bank.estimated_time_seconds,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    console.error("quiz/current: unexpected", err);
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
