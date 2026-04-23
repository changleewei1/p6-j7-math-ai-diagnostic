import { NextResponse } from "next/server";

/**
 * 佈建後可 GET /api/health 驗證是否已到達此 Next 應用
 *（若回 Vercel 平台 404 則為邊界／網域／專案指向問題，非本路由）
 */
export function GET() {
  return NextResponse.json({ success: true, message: "API OK" });
}
