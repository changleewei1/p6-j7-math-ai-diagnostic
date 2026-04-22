import { NextResponse, type NextRequest } from "next/server";
import { analyzeSession } from "@/lib/analysis/analyzeSession";
import { enrichSessionReportSummary } from "@/lib/analysis/enrichSessionReport";
import { generateBasicRecommendations } from "@/lib/analysis/generateBasicRecommendations";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import type { ConfidenceLevel } from "@/types/quiz";
import type { SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import { parseSessionIdParam } from "@/lib/validations/quiz";

type RouteParams = { sessionId: string };

function isSummaryV1(j: unknown): j is SessionSummaryJsonV1 {
  return (
    typeof j === "object" &&
    j != null &&
    "version" in j &&
    (j as SessionSummaryJsonV1).version === "v1"
  );
}

/**
 * 完成測驗：分析、寫入 summary_json、推薦與 test_sessions 完成狀態
 */
export async function POST(
  _request: NextRequest,
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

  try {
    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { data: session, error: se } = await supabase
      .from("test_sessions")
      .select(
        "id, status, total_questions, student_id, summary_json, overall_score, overall_level, completed_at",
      )
      .eq("id", sessionId)
      .maybeSingle();

    if (se) {
      console.error("quiz/finish: load session", se);
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

    if (session.status === "completed" && session.summary_json && isSummaryV1(session.summary_json)) {
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        overallScore: session.overall_score,
        overallLevel: session.overall_level,
        summary: session.summary_json,
      });
    }

    const { data: srows, error: sre } = await supabase
      .from("session_questions")
      .select("question_id, module, difficulty, question_order")
      .eq("session_id", sessionId);
    if (sre) {
      return NextResponse.json(
        { success: false, message: "讀取測驗題目清單失敗" },
        { status: 500 },
      );
    }
    const { data: arows, error: are } = await supabase
      .from("answers")
      .select("question_id, is_correct, time_spent_seconds, confidence_level")
      .eq("session_id", sessionId);
    if (are) {
      return NextResponse.json(
        { success: false, message: "讀取答案失敗" },
        { status: 500 },
      );
    }

    /**
     * 以 test_sessions.total_questions 與「相異已答 question_id 數」為完卷條件。
     * session_questions 可能因併發重送而列數變多（例：15 題變 30 列），不可再用列數當作「應作題數」。
     */
    const totalQ = session.total_questions;
    const uniqueAnswered = new Set((arows ?? []).map((r) => r.question_id)).size;
    if ((srows?.length ?? 0) === 0) {
      return NextResponse.json(
        { success: false, message: "尚未建立測驗題目" },
        { status: 400 },
      );
    }
    if (uniqueAnswered < totalQ) {
      return NextResponse.json(
        { success: false, message: `仍有題目未作答（${uniqueAnswered}/${totalQ}）` },
        { status: 400 },
      );
    }

    // 出題表若重複同一題，只保留 question_order 較小者，避免分析時模組配分被放大
    const sSorted = [...(srows ?? [])].sort((a, b) => a.question_order - b.question_order);
    const seenQid = new Set<string>();
    const sessionQuestionRows = sSorted
      .filter((r) => {
        if (seenQid.has(r.question_id)) return false;
        seenQid.add(r.question_id);
        return true;
      })
      .map((r) => ({ question_id: r.question_id, module: r.module, difficulty: r.difficulty }));

    // 與依 question_id 彙整的答案（同一題多筆時取最後一筆，與 analyzeSession 內 Map 行為一致）
    const byQuestionId = new Map<
      string,
      { question_id: string; is_correct: boolean; time_spent_seconds: number; confidence_level: string }
    >();
    for (const r of arows ?? []) {
      byQuestionId.set(r.question_id, r);
    }
    const answerRows = Array.from(byQuestionId.values());

    const qids = Array.from(
      new Set(sessionQuestionRows.map((r) => r.question_id)),
    );
    const { data: qbanks, error: qe } = await supabase
      .from("question_bank")
      .select("id, estimated_time_seconds")
      .in("id", qids);
    if (qe || !qbanks) {
      return NextResponse.json(
        { success: false, message: "讀取題庫詮釋用時失敗" },
        { status: 500 },
      );
    }
    const meta = new Map(
      qbanks.map((q) => [q.id, { question_id: q.id, estimated_time_seconds: q.estimated_time_seconds }]),
    );

    const base = analyzeSession({
      sessionQuestionRows,
      questionMetaById: meta,
      answerRows: answerRows.map((r) => ({
        question_id: r.question_id,
        is_correct: r.is_correct,
        time_spent_seconds: Number(r.time_spent_seconds),
        confidence_level: r.confidence_level as ConfidenceLevel,
      })),
      totalQuestions: totalQ,
    });

    const { data: stu, error: stuE } = await supabase
      .from("students")
      .select("name")
      .eq("id", session.student_id)
      .maybeSingle();
    if (stuE) {
      console.error("quiz/finish: load student", stuE);
    }
    const studentName = stu?.name?.trim() || "學生";

    const recs = generateBasicRecommendations(base);
    const summary: SessionSummaryJsonV1 = enrichSessionReportSummary(base, {
      studentName,
      recommendations: recs,
    });

    const { error: delR } = await supabase
      .from("recommendations")
      .delete()
      .eq("session_id", sessionId);
    if (delR) {
      console.error("quiz/finish: delete old recommendations", delR);
    }

    if (recs.length > 0) {
      const { error: insR } = await supabase.from("recommendations").insert(
        recs.map((r) => ({
          session_id: sessionId,
          recommendation_type: r.recommendation_type,
          title: r.title,
          description: r.description,
          url: r.url,
        })),
      );
      if (insR) {
        console.error("quiz/finish: insert recommendations", insR);
        return NextResponse.json(
          { success: false, message: "寫入學習建議失敗" },
          { status: 500 },
        );
      }
    }

    const { error: up } = await supabase
      .from("test_sessions")
      .update({
        status: "completed",
        completed_at: now,
        overall_score: summary.overallScore,
        overall_level: summary.overallLevel,
        summary_json: summary as unknown as Json,
      })
      .eq("id", sessionId);

    if (up) {
      console.error("quiz/finish: update session", up);
      return NextResponse.json(
        { success: false, message: "更新測驗完成狀態失敗" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      overallScore: summary.overallScore,
      overallLevel: summary.overallLevel,
      summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    console.error("quiz/finish: unexpected", err);
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
