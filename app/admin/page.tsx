"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import type { AdminOverviewApiResponse } from "@/types/api";
import Link from "next/link";

export default function AdminOverviewPage() {
  const [d, setD] = useState<AdminOverviewApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/admin/overview", { credentials: "include" });
        const j = (await res.json().catch(() => ({}))) as AdminOverviewApiResponse;
        if (!res.ok || j.success === false) {
          if (a) setErr((j as { message?: string }).message ?? "讀取失敗");
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
        <AdminPageHeader title="後台總覽" />
        <p className="text-sm text-rose-700">{err ?? "無法讀取"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="營運總覽"
        subtitle="測驗量、體能與轉化相關指標之示意彙整（內部使用）"
      />
      <AdminStatsCards
        items={[
          { label: "測驗筆數（工作階段）", value: String(d.totalSessions) },
          { label: "已完成測驗", value: String(d.completedCount) },
          {
            label: "平均得分（僅已結案）",
            value: d.averageScore != null ? String(d.averageScore) : "—",
          },
          { label: "A 等第人數", value: String(d.levelDistribution.A) },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">等第分佈</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>
              A：{d.levelDistribution.A} · B：{d.levelDistribution.B} · C：{d.levelDistribution.C} · D：
              {d.levelDistribution.D}
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">常見第一弱點模組</h2>
          <ul className="mt-2 list-inside list-decimal text-sm text-slate-600">
            {d.weaknessModuleRank.length === 0 && <li>尚無樣本</li>}
            {d.weaknessModuleRank.map((r) => (
              <li key={r.module}>
                {r.module}（{r.count} 次）
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">跟進狀態分佈</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
          {d.followUpDistribution.map((x) => (
            <li key={x.status} className="rounded-md bg-slate-100 px-2 py-1">
              {x.status}：{x.count}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">最近 10 筆</h2>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          {d.recentSessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2">
              <span>
                {s.studentName} / {s.parentName} — {s.status}（{s.overallLevel ?? "—"}）
              </span>
              <Link href={`/admin/sessions/${s.id}`} className="text-emerald-800 underline">
                檢視
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
