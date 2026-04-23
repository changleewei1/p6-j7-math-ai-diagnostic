import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ADMIN_GATE_COOKIE, getAdminSecret } from "@/lib/admin/auth";
import { verifyAdminCookie } from "@/lib/admin/adminCookieToken";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "管理員登入",
  robots: "noindex, nofollow" as const,
};

export default async function AdminLoginPage() {
  const secret = getAdminSecret();
  if (secret) {
    const store = await cookies();
    const token = store.get(ADMIN_GATE_COOKIE)?.value;
    if (await verifyAdminCookie(secret, token)) {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-slate-50/80 px-4 py-12 text-slate-900">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">管理員登入</h1>
        <p className="mb-8 text-center text-sm text-slate-600">
          此頁用於內部後台驗證。請輸入與主機上{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">ADMIN_DASHBOARD_SECRET</code> 相同的密碼。
        </p>

        {!secret ? (
          <p className="text-center text-sm text-amber-800">
            系統設定異常：未設定 <code>ADMIN_DASHBOARD_SECRET</code>，請聯絡系統管理員。
          </p>
        ) : (
          <AdminLoginForm />
        )}

        <p className="mt-8 text-sm">
          <Link
            href="/"
            className="text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
          >
            返回首頁
          </Link>
        </p>
      </div>
    </div>
  );
}
