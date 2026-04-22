import { NextResponse, type NextRequest } from "next/server";
import { buildInitialSessionQuestions, InsufficientQuestionBankError } from "@/lib/quiz/buildInitialSessionQuestions";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { quizStartBodySchema } from "@/lib/validations/quiz";

/**
 * 為測驗工作階段從題庫抽 15 題寫入 session_questions；若已存在則略過
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "無法解析 JSON" },
      { status: 400 },
    );
  }

  const parsed = quizStartBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, message: first?.message ?? "參數驗證失敗" },
      { status: 400 },
    );
  }
  const { sessionId } = parsed.data;

  try {
    const supabase = createAdminSupabaseClient();

    const { data: session, error: se } = await supabase
      .from("test_sessions")
      .select("id, total_questions, started_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (se) {
      console.error("quiz/start: load session", se);
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

    const { count, error: ce } = await supabase
      .from("session_questions")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (ce) {
      console.error("quiz/start: count session_questions", ce);
      return NextResponse.json(
        { success: false, message: "檢查題目清單失敗" },
        { status: 500 },
      );
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json({
        success: true,
        existing: true,
        totalQuestions: session.total_questions ?? count ?? 0,
      });
    }

    const { data: bankRows, error: be } = await supabase
      .from("question_bank")
      .select(
        "id, module, difficulty, qtype, prompt, choices, correct_choice_index, answer, explain, ability_tags, estimated_time_seconds, is_active, sort_order, created_at, updated_at",
      )
      .eq("is_active", true);

    if (be) {
      console.error("quiz/start: load question_bank", be);
      return NextResponse.json(
        { success: false, message: "讀取題庫失敗" },
        { status: 500 },
      );
    }

    let questions;
    try {
      questions = buildInitialSessionQuestions(bankRows ?? []);
    } catch (e) {
      if (e instanceof InsufficientQuestionBankError) {
        return NextResponse.json(
          {
            success: false,
            message: e.message,
          },
          { status: 422 },
        );
      }
      throw e;
    }

    const inserts = questions.map((q, idx) => ({
      session_id: sessionId,
      question_id: q.id,
      question_order: idx + 1,
      module: q.module,
      difficulty: q.difficulty,
    }));

    const { error: insErr } = await supabase.from("session_questions").insert(inserts);
    if (insErr) {
      console.error("quiz/start: insert session_questions", insErr);
      return NextResponse.json(
        { success: false, message: "寫入測驗題目失敗" },
        { status: 500 },
      );
    }

    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from("test_sessions")
      .update({
        status: "in_progress",
        ...(session.started_at == null ? { started_at: now } : {}),
      })
      .eq("id", sessionId);

    if (upErr) {
      console.error("quiz/start: update test_sessions", upErr);
      return NextResponse.json(
        { success: false, message: "更新測驗狀態失敗" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      existing: false,
      totalQuestions: questions.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    console.error("quiz/start: unexpected", err);
    if (msg.includes("SUPABASE") || msg.includes("環境變數") || msg.includes("SERVICE_ROLE")) {
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
