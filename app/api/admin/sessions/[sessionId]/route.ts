import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AdminSessionDetailApiResponse } from "@/types/api";
import type { SessionSummaryJsonV1 } from "@/types/sessionAnalysis";
import { parseSessionIdParam } from "@/lib/validations/quiz";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RouteParams = { sessionId: string };

function isSummaryV1(j: unknown): j is SessionSummaryJsonV1 {
  return (
    typeof j === "object" && j != null && "version" in j && (j as SessionSummaryJsonV1).version === "v1"
  );
}

/**
 * 後台：單一測驗工作階段詳情
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

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
        "id, status, created_at, started_at, completed_at, follow_up_status, overall_level, overall_score, summary_json, student_id, parent_id",
      )
      .eq("id", sessionId)
      .maybeSingle();

    if (se) {
      console.error("admin/session get", se);
      return NextResponse.json({ success: false, message: "讀取測驗失敗" }, { status: 500 });
    }
    if (!session) {
      return NextResponse.json({ success: false, message: "找不到此筆測驗" }, { status: 404 });
    }

    const [{ data: stu }, { data: par }, { data: recs }, { data: squestions }, { data: arows }] =
      await Promise.all([
        supabase
          .from("students")
          .select("id, name, school, grade")
          .eq("id", session.student_id)
          .maybeSingle(),
        supabase
          .from("parents")
          .select("id, name, phone, line_id, email, consent, marketing_opt_in")
          .eq("id", session.parent_id)
          .maybeSingle(),
        supabase
          .from("recommendations")
          .select("recommendation_type, title, description, url, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
        supabase
          .from("session_questions")
          .select("question_id, question_order, module, difficulty")
          .eq("session_id", sessionId)
          .order("question_order", { ascending: true }),
        supabase
          .from("answers")
          .select("question_id, selected_choice_index, is_correct, time_spent_seconds, confidence_level")
          .eq("session_id", sessionId),
      ]);

    const byQ = new Map((arows ?? []).map((a) => [a.question_id, a]));
    const answersList = (squestions ?? [])
      .map((sq) => {
        const a = byQ.get(sq.question_id);
        if (!a) return null;
        return {
          questionOrder: sq.question_order,
          questionId: sq.question_id,
          module: sq.module,
          difficulty: sq.difficulty,
          selectedChoiceIndex: a.selected_choice_index,
          isCorrect: a.is_correct,
          timeSpentSeconds: Number(a.time_spent_seconds),
          confidenceLevel: a.confidence_level,
        };
      })
      .filter(
        (x): x is NonNullable<typeof x> => x != null,
      )
      .sort((a, b) => a.questionOrder - b.questionOrder);

    const sum = isSummaryV1(session.summary_json) ? session.summary_json : null;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        createdAt: session.created_at,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        followUpStatus: session.follow_up_status,
        overallLevel: session.overall_level,
        overallScore: session.overall_score != null ? String(session.overall_score) : null,
      },
      student: stu
        ? {
            id: stu.id,
            name: stu.name,
            school: stu.school,
            grade: stu.grade,
          }
        : {
            id: session.student_id,
            name: "—",
            school: null,
            grade: "—",
          },
      parent: par
        ? {
            id: par.id,
            name: par.name,
            phone: par.phone,
            lineId: par.line_id,
            email: par.email,
            consent: par.consent,
            marketingOptIn: par.marketing_opt_in,
          }
        : {
            id: session.parent_id,
            name: "—",
            phone: "—",
            lineId: null,
            email: null,
            consent: false,
            marketingOptIn: false,
          },
      summary: sum,
      recommendations: recs ?? [],
      answers: answersList,
    } satisfies AdminSessionDetailApiResponse);
  } catch (e) {
    console.error("admin/session get", e);
    return NextResponse.json({ success: false, message: "系統暫時無法處理請求" }, { status: 500 });
  }
}
