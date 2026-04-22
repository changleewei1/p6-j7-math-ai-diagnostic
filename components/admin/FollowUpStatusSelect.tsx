"use client";

import { FOLLOW_UP_STATUSES } from "@/lib/constants/quiz";
import type { FollowUpStatus } from "@/types/quiz";
import { useState } from "react";

type Props = {
  sessionId: string;
  initial: FollowUpStatus;
};

export function FollowUpStatusSelect({ sessionId, initial }: Props) {
  const [v, setV] = useState<FollowUpStatus>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(next: FollowUpStatus) {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/follow-up`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followUpStatus: next }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || j.success === false) {
        setErr(j.message ?? "更新失敗");
        return;
      }
      setV(next);
      setMsg("已儲存");
    } catch {
      setErr("網路錯誤");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="follow-up" className="text-sm font-medium text-slate-800">
        跟進狀態
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <select
          id="follow-up"
          value={v}
          disabled={saving}
          onChange={(e) => {
            const next = e.target.value as FollowUpStatus;
            void save(next);
          }}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
        >
          {FOLLOW_UP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {saving && <span className="text-xs text-slate-500">儲存中…</span>}
        {msg && !saving && <span className="text-xs text-emerald-700">{msg}</span>}
        {err && <span className="text-xs text-rose-600">{err}</span>}
      </div>
    </div>
  );
}
