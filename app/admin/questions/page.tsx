"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { AdminQuestionsListApiResponse } from "@/types/api";

export default function AdminQuestionsPage() {
  const [d, setD] = useState<AdminQuestionsListApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/admin/questions", { credentials: "include" });
        const j = (await res.json().catch(() => ({}))) as AdminQuestionsListApiResponse;
        if (!res.ok || j.success === false) {
          if (a) setErr(j.message ?? "讀取失敗");
        } else if (a) {
          setD(j);
        }
      } catch {
        if (a) setErr("網路錯誤");
      } finally {
        if (a) setLoading(false);
      }
    }
    void run();
    return () => {
      a = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">讀取中…</p>;
  }
  if (err || !d?.success) {
    return (
      <div>
        <AdminPageHeader title="題庫" />
        <p className="text-sm text-rose-700">{err ?? "讀取失敗"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="題庫"
        subtitle="依模組、難度顯示所有題目；可為單題設定相關 YouTube 補充影片"
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">模組</th>
              <th className="px-3 py-2">難度</th>
              <th className="px-3 py-2">題幹</th>
              <th className="px-3 py-2 w-32">狀態</th>
              <th className="px-3 py-2 w-40">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {d.items.map((q) => (
              <tr key={q.id}>
                <td className="px-3 py-2 align-top whitespace-nowrap text-xs sm:text-sm">{q.module}</td>
                <td className="px-3 py-2 align-top whitespace-nowrap text-xs sm:text-sm">{q.difficulty}</td>
                <td className="px-3 py-2 align-top max-w-md">
                  <p className="line-clamp-2 text-sm" title={q.prompt}>
                    {q.prompt}
                  </p>
                </td>
                <td className="px-3 py-2 align-top text-xs sm:text-sm">{q.is_active ? "啟用" : "停用"}</td>
                <td className="px-3 py-2 align-top">
                  <Link
                    href={`/admin/questions/${q.id}/videos`}
                    className="inline-flex rounded-md border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                  >
                    設定影片
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
