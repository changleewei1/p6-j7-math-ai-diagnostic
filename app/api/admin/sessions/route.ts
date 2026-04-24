import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { FOLLOW_UP_STATUSES } from "@/lib/constants/quiz";
import type { AdminSessionsListApiResponse } from "@/types/api";
import type { FollowUpStatus } from "@/types/quiz";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PAGE_SIZE = 30;

/**
 * 後台：測驗工作階段列表
 */
export async function GET(request: NextRequest) {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const followUp = searchParams.get("followUp") as FollowUpStatus | "all" | null;
  const st = (searchParams.get("status") ?? "all") as "all" | "completed" | "pending" | "in_progress";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const followOk =
    !followUp || followUp === "all" || (FOLLOW_UP_STATUSES as readonly string[]).includes(followUp);

  if (!followOk) {
    return NextResponse.json({ success: false, message: "followUp 參數不正確" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data: raw, error } = await supabase
      .from("test_sessions")
      .select("id, status, created_at, overall_level, overall_score, follow_up_status, student_id, parent_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("admin/sessions", error);
      return NextResponse.json({ success: false, message: "讀取測驗清單失敗" }, { status: 500 });
    }

    const rows = raw ?? [];
    const sids = Array.from(new Set(rows.map((r) => r.student_id)));
    const pids = Array.from(new Set(rows.map((r) => r.parent_id)));
    const { data: stuData } = await supabase
      .from("students")
      .select("id, name, referrer_name, referrer_contact")
      .in("id", sids);
    const { data: parData } = await supabase
      .from("parents")
      .select("id, name, phone, marketing_opt_in")
      .in("id", pids);
    const stuMap = new Map(
      (stuData ?? []).map((s) => [
        s.id,
        {
          name: s.name,
          referrer_name: s.referrer_name as string | null,
          referrer_contact: s.referrer_contact as string | null,
        },
      ]),
    );
    const parMap = new Map(
      (parData ?? []).map((p) => [p.id, { name: p.name, phone: p.phone, marketing_opt_in: p.marketing_opt_in }]),
    );

    const enriched = rows.map((r) => {
      const stu = stuMap.get(r.student_id);
      const sn = stu?.name ?? "";
      const p = parMap.get(r.parent_id);
      return {
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        studentName: sn,
        parentName: p?.name ?? "",
        parentPhone: p?.phone ?? "",
        referrerName: stu?.referrer_name ?? null,
        referrerContact: stu?.referrer_contact ?? null,
        marketingOptIn: p?.marketing_opt_in ?? false,
        overallLevel: r.overall_level,
        overallScore: r.overall_score != null ? String(r.overall_score) : null,
        followUpStatus: r.follow_up_status as FollowUpStatus,
      };
    });

    const matchesStatus = (r: (typeof enriched)[0]) => {
      if (st === "all") return true;
      if (st === "completed") return r.status === "completed";
      if (st === "pending") return r.status === "pending" || r.status === "in_progress";
      if (st === "in_progress") return r.status === "in_progress";
      return true;
    };

    const matchesFollow = (r: (typeof enriched)[0]) => {
      if (!followUp || followUp === "all") return true;
      return r.followUpStatus === followUp;
    };

    const matchesQ = (r: (typeof enriched)[0]) => {
      if (!q) return true;
      const refN = (r.referrerName ?? "").toLowerCase();
      const refC = (r.referrerContact ?? "").toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.parentName.toLowerCase().includes(q) ||
        r.parentPhone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        refN.includes(q) ||
        refC.includes(q)
      );
    };

    const filtered = enriched.filter((r) => matchesStatus(r) && matchesFollow(r) && matchesQ(r));
    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = filtered.slice(start, start + PAGE_SIZE);

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      pageSize: PAGE_SIZE,
    } satisfies AdminSessionsListApiResponse);
  } catch (e) {
    console.error("admin/sessions", e);
    return NextResponse.json({ success: false, message: "系統暫時無法處理請求" }, { status: 500 });
  }
}
