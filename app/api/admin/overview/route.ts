import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { QUIZ_MODULES } from "@/lib/constants/quiz";
import type { AdminOverviewApiResponse } from "@/types/api";
import type { FollowUpStatus, QuizModule } from "@/types/quiz";
import type { SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function isSummaryV1(j: unknown): j is SessionSummaryJsonV1 {
  return (
    typeof j === "object" && j != null && "version" in j && (j as SessionSummaryJsonV1).version === "v1"
  );
}

/**
 * 後台總覽統計
 */
export async function GET() {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: list, error } = await supabase
      .from("test_sessions")
      .select(
        "id, status, created_at, overall_level, overall_score, follow_up_status, summary_json, student_id, parent_id",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("admin/overview", error);
      return NextResponse.json({ success: false, message: "讀取測驗清單失敗" }, { status: 500 });
    }

    const rows = list ?? [];
    const totalSessions = rows.length;
    const completed = rows.filter((r) => r.status === "completed");
    const completedCount = completed.length;

    const scores: number[] = [];
    for (const s of completed) {
      if (s.overall_score == null) continue;
      const n = Number(s.overall_score);
      if (!Number.isNaN(n)) scores.push(n);
    }
    const averageScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;

    const levelDistribution = { A: 0, B: 0, C: 0, D: 0 };
    for (const s of completed) {
      const L = s.overall_level;
      if (L === "A" || L === "B" || L === "C" || L === "D") {
        levelDistribution[L as "A" | "B" | "C" | "D"] += 1;
      }
    }

    const weaknessCount = new Map<QuizModule, number>();
    for (const m of QUIZ_MODULES) {
      weaknessCount.set(m, 0);
    }
    for (const s of completed) {
      const j = s.summary_json;
      if (isSummaryV1(j) && j.weakestModules && j.weakestModules[0]) {
        const w = j.weakestModules[0]!;
        weaknessCount.set(w, (weaknessCount.get(w) ?? 0) + 1);
        continue;
      }
      if (isSummaryV1(j) && j.moduleResults?.length) {
        const sorted = [...j.moduleResults].sort((a, b) => a.correctRate - b.correctRate);
        const w = sorted[0]!.module;
        weaknessCount.set(w, (weaknessCount.get(w) ?? 0) + 1);
      }
    }
    const weaknessModuleRank = Array.from(weaknessCount.entries())
      .map(([module, count]) => ({ module, count }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    const followStatuses: FollowUpStatus[] = ["未追蹤", "已聯絡", "已預約", "已報名"];
    const followMap = new Map<FollowUpStatus, number>();
    for (const f of followStatuses) followMap.set(f, 0);
    for (const s of rows) {
      const f = s.follow_up_status as FollowUpStatus;
      if (followMap.has(f)) followMap.set(f, (followMap.get(f) ?? 0) + 1);
    }
    const followUpDistribution = followStatuses.map((status) => ({
      status,
      count: followMap.get(status) ?? 0,
    }));

    const sid = Array.from(new Set(rows.map((r) => r.student_id).filter(Boolean)));
    const pid = Array.from(new Set(rows.map((r) => r.parent_id).filter(Boolean)));
    const { data: stuRows } = await supabase.from("students").select("id, name").in("id", sid);
    const { data: parRows } = await supabase.from("parents").select("id, name").in("id", pid);
    const stuName = new Map((stuRows ?? []).map((x) => [x.id, x.name]));
    const parName = new Map((parRows ?? []).map((x) => [x.id, x.name]));

    const recentSessions = rows.slice(0, 10).map((r) => ({
      id: r.id,
      studentName: stuName.get(r.student_id) ?? "—",
      parentName: parName.get(r.parent_id) ?? "—",
      status: r.status,
      overallLevel: r.overall_level,
      followUpStatus: r.follow_up_status as FollowUpStatus,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      success: true,
      totalSessions,
      completedCount,
      averageScore,
      levelDistribution,
      weaknessModuleRank,
      followUpDistribution,
      recentSessions,
    } satisfies AdminOverviewApiResponse);
  } catch (e) {
    console.error("admin/overview", e);
    return NextResponse.json({ success: false, message: "系統暫時無法處理請求" }, { status: 500 });
  }
}
