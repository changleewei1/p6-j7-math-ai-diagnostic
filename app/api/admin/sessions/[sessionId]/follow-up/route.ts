import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AdminFollowUpApiResponse } from "@/types/api";
import type { FollowUpStatus } from "@/types/quiz";
import { parseSessionIdParam } from "@/lib/validations/quiz";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

const followUpValues = ["未追蹤", "已聯絡", "已預約", "已報名"] as const;
const bodySchema = z.object({
  followUpStatus: z.enum(followUpValues),
});

type RouteParams = { sessionId: string };

/**
 * 後台：更新 follow_up_status
 */
export async function PATCH(
  request: NextRequest,
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
    return NextResponse.json({ success: false, message: m } satisfies AdminFollowUpApiResponse, {
      status: 400,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "無法解析 JSON" } satisfies AdminFollowUpApiResponse,
      { status: 400 },
    );
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "參數驗證失敗" } satisfies AdminFollowUpApiResponse,
      { status: 400 },
    );
  }
  const followUpStatus = parsed.data.followUpStatus;

  try {
    const supabase = createAdminSupabaseClient();
    const { error, data } = await supabase
      .from("test_sessions")
      .update({ follow_up_status: followUpStatus })
      .eq("id", sessionId)
      .select("id, follow_up_status")
      .maybeSingle();

    if (error) {
      console.error("admin/follow-up", error);
      return NextResponse.json(
        { success: false, message: "更新失敗" } satisfies AdminFollowUpApiResponse,
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { success: false, message: "找不到此筆測驗" } satisfies AdminFollowUpApiResponse,
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      followUpStatus: data.follow_up_status as FollowUpStatus,
    } satisfies AdminFollowUpApiResponse);
  } catch (e) {
    console.error("admin/follow-up", e);
    return NextResponse.json(
      { success: false, message: "系統暫時無法處理請求" } satisfies AdminFollowUpApiResponse,
      { status: 500 },
    );
  }
}
