import { getAdminCookieToken } from "@/lib/admin/adminCookieToken";
import { NextResponse } from "next/server";

/** 與 proxy.ts 的 gate cookie 名稱一致，勿任意更改 */
export const ADMIN_GATE_COOKIE = "admin_gate";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 日，與 proxy 一致

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_DASHBOARD_SECRET?.trim() || undefined;
}

export function getAdminCookieName(): string {
  return ADMIN_GATE_COOKIE;
}

export function isValidAdminSecret(input: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  return input.trim() === secret;
}

export function getAdminCookieBaseOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: isProd,
  };
}

/**
 * 寫入與 /admin?secret= 流程相同的管理員 Cookie
 */
export async function applyAdminAuthCookie(
  res: NextResponse,
  adminSecret: string,
): Promise<void> {
  const value = await getAdminCookieToken(adminSecret);
  res.cookies.set(ADMIN_GATE_COOKIE, value, getAdminCookieBaseOptions());
}

/**
 * 清除管理員 Cookie（登出）
 */
export function clearAdminAuthCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_GATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
