import { assertAdminOr401 } from "@/lib/admin/assertAdminApi";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseUuidParam } from "@/lib/validations/ids";
import type { AdminQuestionVideoDeleteApiResponse } from "@/types/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RouteParams = { videoId: string };

/**
 * 後台：刪除單一題目影片
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<RouteParams> },
) {
  const c = (await cookies()).get("admin_gate")?.value;
  const unauth = await assertAdminOr401(c);
  if (unauth) return unauth;

  let videoId: string;
  try {
    videoId = parseUuidParam((await context.params).videoId, "無效的影片編號");
  } catch (e) {
    const m = e instanceof Error ? e.message : "參數錯誤";
    return NextResponse.json({ success: false, message: m } satisfies AdminQuestionVideoDeleteApiResponse, {
      status: 400,
    });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("question_videos")
    .delete()
    .eq("id", videoId)
    .select("id");

  if (error) {
    console.error("admin/question-videos delete", error);
    return NextResponse.json(
      { success: false, message: "刪除失敗" } satisfies AdminQuestionVideoDeleteApiResponse,
      { status: 500 },
    );
  }
  if (!data?.length) {
    return NextResponse.json(
      { success: false, message: "找不到此影片" } satisfies AdminQuestionVideoDeleteApiResponse,
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true } satisfies AdminQuestionVideoDeleteApiResponse);
}
