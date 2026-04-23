import { ADMIN_GATE_COOKIE, getAdminSecret } from "@/lib/admin/auth";
import { getAdminCookieToken, verifyAdminCookie } from "@/lib/admin/adminCookieToken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // 登入／登出 API 由 route handler 處理 cookie，不在此攔
  if (
    (path === "/api/admin/login" && request.method === "POST") ||
    (path === "/api/admin/logout" && request.method === "POST")
  ) {
    return NextResponse.next();
  }

  const secret = getAdminSecret();
  if (!secret) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "未設定 ADMIN_DASHBOARD_SECRET" },
        { status: 503 },
      );
    }
    return new NextResponse("未設定 ADMIN_DASHBOARD_SECRET，無法使用後台。", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const qs = request.nextUrl.searchParams.get("secret");
  if (qs && qs === secret) {
    const target = new URL(path, request.url);
    target.searchParams.delete("secret");
    const res = NextResponse.redirect(target);
    res.cookies.set(ADMIN_GATE_COOKIE, await getAdminCookieToken(secret), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  }

  const token = request.cookies.get(ADMIN_GATE_COOKIE)?.value;
  if (await verifyAdminCookie(secret, token)) {
    return NextResponse.next();
  }
  if (path.startsWith("/api/")) {
    return NextResponse.json({ success: false, message: "未授權" }, { status: 401 });
  }
  return new NextResponse(
    "需要管理權限。請至前台點擊「管理入口」在管理員登入頁輸入密碼，或造訪 /admin?secret=（.env 的 ADMIN_DASHBOARD_SECRET）以寫入 Cookie。",
    { status: 401, headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
