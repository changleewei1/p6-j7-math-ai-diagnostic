import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { bookingBodySchema } from "@/lib/validations/booking";

/**
 * 預約試聽表單送出：寫入 `bookings`
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

  const parsed = bookingBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, message: first?.message ?? "參數驗證失敗" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const noteParts: string[] = [];
  if (d.willingToBeContacted === false) {
    noteParts.push("【聯絡意願】目前不願接受補習班主動電話聯繫；僅依本次預約或官方管道聯繫。");
  }
  if (d.note?.trim()) {
    noteParts.push(d.note.trim());
  }
  const noteHas = noteParts.length > 0 ? noteParts.join("\n\n") : null;

  try {
    const supabase = createAdminSupabaseClient();

    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        student_name: d.studentName,
        parent_name: d.parentName,
        phone: d.phone,
        interested_course: d.interestedCourse,
        note: noteHas,
        session_id: d.sessionId ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("api/booking: insert", error);
      return NextResponse.json(
        { success: false, message: "寫入預約失敗，請稍後再試" },
        { status: 500 },
      );
    }
    if (!row) {
      return NextResponse.json(
        { success: false, message: "寫入預約失敗" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: row.id,
    });
  } catch (err) {
    console.error("api/booking: unexpected", err);
    const msg = err instanceof Error ? err.message : "";
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
