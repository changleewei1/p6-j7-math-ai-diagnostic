import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import { trackBodySchema } from "@/lib/validations/track";

/**
 * 行為／轉換追蹤：寫入 `conversion_events`（僅在 handler 內建立 admin client）
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "無法解析 JSON" }, { status: 400 });
  }

  const parsed = trackBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, message: first?.message ?? "參數驗證失敗" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const meta = (d.meta && typeof d.meta === "object" && !Array.isArray(d.meta) ? d.meta : {}) as Record<
    string,
    unknown
  >;
  const metaJson = meta as Json;

  try {
    const supabase = createAdminSupabaseClient();
    const { data: row, error } = await supabase
      .from("conversion_events")
      .insert({
        session_id: d.sessionId ?? null,
        event_type: d.eventType,
        meta_json: metaJson,
      })
      .select("id")
      .single();

    if (error) {
      console.error("api/track: insert", error);
      return NextResponse.json(
        { success: false, message: "寫入失敗" },
        { status: 500 },
      );
    }
    if (!row) {
      return NextResponse.json({ success: false, message: "寫入失敗" }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: row.id });
  } catch (e) {
    console.error("api/track: unexpected", e);
    return NextResponse.json({ success: false, message: "系統暫時無法處理" }, { status: 500 });
  }
}
