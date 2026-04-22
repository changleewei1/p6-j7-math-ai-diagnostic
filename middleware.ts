import { getAdminCookieToken, verifyAdminCookie } from "@/lib/admin/adminCookieToken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE = "admin_gate";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_DASHBOARD_SECRET?.trim();
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
    res.cookies.set(COOKIE, await getAdminCookieToken(secret), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (await verifyAdminCookie(secret, token)) {
    return NextResponse.next();
  }
  if (path.startsWith("/api/")) {
    return NextResponse.json({ success: false, message: "未授權" }, { status: 401 });
  }
  return new NextResponse(
    "需要管理權限。請先造訪 /admin?secret=（.env 內的 ADMIN_DASHBOARD_SECRET）以完成 Cookie 設定。",
    { status: 401, headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
