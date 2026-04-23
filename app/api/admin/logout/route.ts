import { clearAdminAuthCookie } from "@/lib/admin/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  clearAdminAuthCookie(res);
  return res;
}
