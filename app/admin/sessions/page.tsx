"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSessionsTable } from "@/components/admin/AdminSessionsTable";
import { FOLLOW_UP_STATUSES } from "@/lib/constants/quiz";
import type { AdminSessionsListApiResponse } from "@/types/api";

export default function AdminSessionsListPage() {
  const [q, setQ] = useState("");
  const [followUp, setFollowUp] = useState("all");
  const [st, setSt] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminSessionsListApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setErr(null);
      try {
        const u = new URL("/api/admin/sessions", window.location.origin);
        u.searchParams.set("page", String(p));
        if (q.trim()) u.searchParams.set("q", q.trim());
        if (followUp !== "all") u.searchParams.set("followUp", followUp);
        if (st !== "all") u.searchParams.set("status", st);
        const res = await fetch(u.toString(), { credentials: "include" });
        const j = (await res.json().catch(() => ({}))) as AdminSessionsListApiResponse;
        if (!res.ok || j.success === false) {
          setErr((j as { message?: string }).message ?? "讀取失敗");
          setData(null);
        } else {
          setData(j);
        }
      } catch {
        setErr("網路錯誤");
      } finally {
        setLoading(false);
      }
    },
    [q, followUp, st],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void load(page);
    });
  }, [load, page, followUp, st]);

  return (
    <div className="space-y-4">
      <AdminPageHeader title="測驗列表" subtitle="搜尋、篩選、前往個別詳情" />
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end sm:flex-wrap">
        <div className="min-w-0 flex-1">
          <label className="text-xs text-slate-500">關鍵字（學生／家長／手機／介紹人）</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-0.5 w-full min-h-9 rounded border border-slate-200 px-2 text-sm"
            placeholder="輸入後按「重新查詢」"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">跟進</label>
          <select
            value={followUp}
            onChange={(e) => {
              setFollowUp(e.target.value);
              setPage(1);
            }}
            className="mt-0.5 block min-h-9 w-full rounded border border-slate-200 px-2 text-sm sm:w-32"
          >
            <option value="all">全部</option>
            {FOLLOW_UP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">測驗狀態</label>
          <select
            value={st}
            onChange={(e) => {
              setSt(e.target.value);
              setPage(1);
            }}
            className="mt-0.5 block min-h-9 w-full rounded border border-slate-200 px-2 text-sm sm:w-32"
          >
            <option value="all">全部</option>
            <option value="pending">未結案</option>
            <option value="completed">已完成</option>
            <option value="in_progress">進行中</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            void load(1);
          }}
          className="min-h-9 rounded-lg bg-slate-900 px-3 text-sm text-white"
        >
          重新查詢
        </button>
      </div>
      {err && <p className="text-sm text-rose-700">{err}</p>}
      {loading && <p className="text-sm text-slate-500">讀取中…</p>}
      {data?.success && (
        <>
          <p className="text-xs text-slate-500">
            第 {data.page} 頁 · 共 {data.total} 筆
          </p>
          <AdminSessionsTable items={data.items} />
          <div className="flex justify-between gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              上一頁
            </button>
            <button
              type="button"
              disabled={data.page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              下一頁
            </button>
          </div>
        </>
      )}
    </div>
  );
}
