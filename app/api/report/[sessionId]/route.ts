import { NextResponse, type NextRequest } from "next/server";
import {
  inferReadinessStatus,
  inferWeakestModulesFromSummary,
} from "@/lib/analysis/enrichSessionReport";
import { selectVideoRecommendations } from "@/lib/analysis/selectVideoRecommendations";
import { getRecommendedVideosForSession } from "@/lib/report/getRecommendedVideosForSession";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
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
 * 取得診斷報告彙整（讀自 test_sessions 與 recommendations；summary 在 summary_json）
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
    return NextResponse.json({ success: false, message: m }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: session, error: se } = await supabase
      .from("test_sessions")
      .select(
        "id, status, student_id, total_questions, overall_score, overall_level, summary_json, completed_at",
      )
      .eq("id", sessionId)
      .maybeSingle();

    if (se) {
      return NextResponse.json(
        { success: false, message: "讀取測驗失敗" },
        { status: 500 },
      );
    }
    if (!session) {
      return NextResponse.json(
        { success: false, message: "找不到此測驗" },
        { status: 404 },
      );
    }

    const { data: stu, error: stue } = await supabase
      .from("students")
      .select("name")
      .eq("id", session.student_id)
      .maybeSingle();
    if (stue) {
      return NextResponse.json(
        { success: false, message: "讀取學生失敗" },
        { status: 500 },
      );
    }
    const studentName = stu?.name ?? "學生";

    const { data: recs, error: re } = await supabase
      .from("recommendations")
      .select("recommendation_type, title, description, url, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (re) {
      return NextResponse.json(
        { success: false, message: "讀取建議失敗" },
        { status: 500 },
      );
    }

    const summaryV1 = isSummaryV1(session.summary_json) ? session.summary_json : null;
    const rawJson = (session.summary_json ?? null) as Json;

    let videos: {
      id: string;
      module: string;
      title: string;
      url: string;
      description: string | null;
    }[] = [];
    if (summaryV1) {
      const { data: vrows, error: ve } = await supabase
        .from("video_recommendations")
        .select("id, module, title, url, description, is_active, created_at");
      if (ve) {
        console.error("report GET: video_recommendations", ve);
      } else {
        const pick = selectVideoRecommendations(
          inferWeakestModulesFromSummary(summaryV1),
          vrows ?? [],
        );
        videos = pick.map((v) => ({
          id: v.id,
          module: v.module,
          title: v.title,
          url: v.url,
          description: v.description,
        }));
      }
    }

    let recommendedVideos: {
      questionId: string;
      questionVideoId: string;
      youtubeUrl: string;
      title: string | null;
      reasonType: "wrong_answer" | "low_confidence" | "slow_response";
      reasonText: string;
    }[] = [];
    try {
      const picked = await getRecommendedVideosForSession(supabase, sessionId, 5);
      recommendedVideos = picked.map((p) => ({
        questionId: p.questionId,
        questionVideoId: p.questionVideoId,
        youtubeUrl: p.youtubeUrl,
        title: p.title,
        reasonType: p.reasonType,
        reasonText: p.reasonText,
      }));
    } catch (e) {
      console.error("report GET: recommended videos", e);
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      reportReady: session.status === "completed" && summaryV1 != null,
      studentName,
      status: session.status,
      overallScore: session.overall_score,
      overallLevel: session.overall_level,
      moduleResults: summaryV1?.moduleResults ?? null,
      timingSummary: summaryV1?.timingSummary ?? null,
      confidenceSummary: summaryV1?.confidenceSummary ?? null,
      riskTags: summaryV1?.riskTags ?? [],
      readinessStatus: summaryV1
        ? (summaryV1.readinessStatus ?? inferReadinessStatus(summaryV1))
        : null,
      narrativeSummary: summaryV1?.narrativeSummary ?? null,
      strongestModules: summaryV1?.strongestModules ?? null,
      weakestModules: summaryV1?.weakestModules ?? null,
      recommendationHighlights: summaryV1?.recommendationHighlights ?? null,
      recommendations: recs ?? [],
      summary: rawJson,
      videos,
      recommendedVideos,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "伺服器錯誤";
    console.error("report GET: unexpected", err);
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
