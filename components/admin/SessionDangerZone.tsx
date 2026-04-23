"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSessionDeleteApiResponse } from "@/types/api";

type Props = {
  sessionId: string;
};

export function SessionDangerZone({ sessionId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<"session" | "full" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function runSessionDelete() {
    if (!window.confirm("此操作無法復原，確定要刪除此筆測驗資料嗎？")) {
      return;
    }
    setError(null);
    setInfo(null);
    setDeleting("session");
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as AdminSessionDeleteApiResponse;
      if (!res.ok || j.success === false) {
        setError(typeof j.message === "string" ? j.message : "刪除失敗");
        return;
      }
      setInfo("已刪除此筆測驗，將返回列表…");
      window.setTimeout(() => {
        router.push("/admin/sessions");
      }, 800);
    } catch {
      setError("網路錯誤，請稍後再試。");
    } finally {
      setDeleting(null);
    }
  }

  async function runFullDelete() {
    if (
      !window.confirm(
        "此操作將刪除學生、家長與所有測驗相關資料，且無法復原，確定要繼續嗎？",
      )
    ) {
      return;
    }
    setError(null);
    setInfo(null);
    setDeleting("full");
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/full-delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as AdminSessionDeleteApiResponse;
      if (!res.ok || j.success === false) {
        setError(typeof j.message === "string" ? j.message : "刪除失敗");
        return;
      }
      setInfo("已刪除學生／家長與關聯資料，將返回列表…");
      window.setTimeout(() => {
        router.push("/admin/sessions");
      }, 800);
    } catch {
      setError("網路錯誤，請稍後再試。");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="rounded-xl border border-rose-200/90 bg-rose-50/40 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-rose-900">危險操作</h2>
      <p className="mt-1 text-xs text-rose-800/80">
        刪除後無法復原。僅刪測驗可保留學生／家長名冊；完整刪除會一併移除該配對學生與家長（僅在無其他關聯場次時）。
      </p>
      {error && (
        <p className="mt-2 text-sm text-rose-800" role="alert">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-2 text-sm text-emerald-800" role="status">
          {info}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => {
            void runSessionDelete();
          }}
          disabled={deleting != null}
          className="min-h-10 rounded-lg border border-rose-300 bg-white px-3 text-sm font-medium text-rose-900 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting === "session" ? "刪除中…" : "刪除此筆測驗資料"}
        </button>
        <button
          type="button"
          onClick={() => {
            void runFullDelete();
          }}
          disabled={deleting != null}
          className="min-h-10 rounded-lg border border-rose-500 bg-rose-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting === "full" ? "刪除中…" : "刪除學生與家長全部資料"}
        </button>
      </div>
    </div>
  );
}
