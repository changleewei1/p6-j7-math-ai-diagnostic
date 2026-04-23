import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "管理後台",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-800">診斷測驗 · 內部後台</p>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin" className="text-emerald-800 underline">
              總覽
            </Link>
            <Link href="/admin/sessions" className="text-emerald-800 underline">
              測驗列表
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-800">
              前台首頁
            </Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
