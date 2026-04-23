import { applyAdminAuthCookie, getAdminSecret, isValidAdminSecret } from "@/lib/admin/auth";
import { NextResponse } from "next/server";

type Body = { secret?: string };

export async function POST(request: Request) {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return NextResponse.json(
      { success: false, message: "系統設定異常，請稍後再試。" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { success: false, message: "管理員密碼錯誤，請重新輸入。" },
      { status: 400 },
    );
  }

  const input = body.secret;
  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json(
      { success: false, message: "管理員密碼錯誤，請重新輸入。" },
      { status: 400 },
    );
  }

  if (!isValidAdminSecret(input)) {
    return NextResponse.json(
      { success: false, message: "管理員密碼錯誤，請重新輸入。" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ success: true });
  await applyAdminAuthCookie(res, adminSecret);
  return res;
}
