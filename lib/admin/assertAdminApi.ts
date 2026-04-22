import { verifyAdminCookie } from "@/lib/admin/adminCookieToken";
import { NextResponse } from "next/server";

/**
 * Admin API route handler 內使用；與 proxy 雙重檢查 cookie
 */
export async function assertAdminOr401(
  cookieValue: string | null | undefined,
): Promise<NextResponse | null> {
  const secret = process.env.ADMIN_DASHBOARD_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "未設定 ADMIN_DASHBOARD_SECRET" },
      { status: 503 },
    );
  }
  const ok = await verifyAdminCookie(secret, cookieValue ?? undefined);
  if (!ok) {
    return NextResponse.json({ success: false, message: "未授權" }, { status: 401 });
  }
  return null;
}
