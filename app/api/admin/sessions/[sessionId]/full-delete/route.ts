import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { fullDeletePairForSession } from "@/lib/admin/deleteSessionData";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseSessionIdParam } from "@/lib/validations/quiz";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RouteParams = { sessionId: string };

/**
 * 刪除與本 session 學生／家長同配對之全部測驗資料，再刪學生與家長（若無他場關聯）。
 */
export async function DELETE(
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

  const supabase = createAdminSupabaseClient();
  const r = await fullDeletePairForSession(supabase, sessionId);
  if (!r.ok) {
    if (r.message === "找不到此筆測驗" || r.message === "無可刪除的關聯場次") {
      return NextResponse.json({ success: false, message: r.message }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: r.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
