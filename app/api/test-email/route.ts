import { sendAdminNewLeadEmail } from "@/lib/notifications/sendAdminNewLeadEmail";
import { NextResponse } from "next/server";

/**
 * 僅供本機／非 production 測試 Resend 通知；正式環境關閉。
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  await sendAdminNewLeadEmail({
    sessionId: "00000000-0000-4000-8000-000000000000",
    studentName: "測試學生",
    school: "測試國小",
    parentName: "測試家長",
    parentPhone: "0912000333",
    parentEmail: "parent@example.com",
    lineId: "line_test_id",
    referrerName: null,
  });

  return NextResponse.json({
    success: true,
    message: "已觸發測試通知信；若已設定 RESEND / ADMIN_NOTIFY_EMAIL / EMAIL_FROM 應可收信。",
  });
}
