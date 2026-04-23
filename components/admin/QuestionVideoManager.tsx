"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminQuestionVideoDto, AdminQuestionVideosApiResponse } from "@/types/api";

type Props = {
  questionId: string;
};

export function QuestionVideoManager({ questionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [question, setQuestion] = useState<AdminQuestionVideosApiResponse["question"]>(null);
  const [videos, setVideos] = useState<AdminQuestionVideoDto[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/videos`, {
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as AdminQuestionVideosApiResponse;
      if (!res.ok || j.success === false) {
        setErr(j.message ?? "讀取失敗");
        setQuestion(null);
        setVideos([]);
        return;
      }
      setQuestion(j.question);
      setVideos(j.videos);
    } catch {
      setErr("網路錯誤");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFlash = useCallback((msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 4000);
  }, []);

  async function handleAdd() {
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/videos`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ youtube_url: urlInput }),
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean; video?: AdminQuestionVideoDto; message?: string };
      if (!res.ok || j.success === false) {
        setErr(j.message ?? "新增失敗");
        return;
      }
      if (j.video) {
        setVideos((prev) => [...prev, j.video!].sort((a, b) => a.priority - b.priority || a.createdAt.localeCompare(b.createdAt)));
      } else {
        await load();
      }
      setUrlInput("");
      setFlash("已新增影片");
    } catch {
      setErr("網路錯誤");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(v: AdminQuestionVideoDto) {
    if (!window.confirm("確定要刪除這支影片連結嗎？此操作無法復原。")) {
      return;
    }
    setErr(null);
    setDeletingId(v.id);
    try {
      const res = await fetch(`/api/admin/question-videos/${v.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || j.success === false) {
        setErr(j.message ?? "刪除失敗");
        return;
      }
      setVideos((prev) => prev.filter((x) => x.id !== v.id));
      setFlash("已刪除");
    } catch {
      setErr("網路錯誤");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">讀取中…</p>;
  }
  if (err && !question) {
    return <p className="text-sm text-rose-700">{err}</p>;
  }
  if (!question) {
    return <p className="text-sm text-rose-700">找不到題目</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">題目內容</h2>
        <p className="mt-1 text-xs text-slate-500">
          {question.module} · {question.difficulty}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{question.prompt}</p>
      </div>

      {hint && (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {hint}
        </p>
      )}
      {err && <p className="text-sm text-rose-700">{err}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">YouTube 影片</h2>
        <p className="mt-1 text-xs text-slate-500">
          一題可連結多支影片；新影片會接在目前順序之後。日後可擴充排序欄位（priority）與推薦規則。
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="yt-url" className="text-xs font-medium text-slate-600">
              YouTube 網址
            </label>
            <input
              id="yt-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="mt-1 w-full min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              void handleAdd();
            }}
            disabled={saving || !urlInput.trim()}
            className="min-h-10 shrink-0 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "新增中…" : "新增"}
          </button>
        </div>

        {videos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">尚未新增影片</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">
            {videos.map((v) => (
              <li key={v.id} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {v.title && <p className="text-sm font-medium text-slate-800">{v.title}</p>}
                  <a
                    href={v.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-emerald-800 underline"
                  >
                    {v.youtubeUrl}
                  </a>
                  <p className="mt-0.5 text-xs text-slate-400">順序 {v.priority}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete(v);
                  }}
                  disabled={deletingId === v.id}
                  className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-900 hover:bg-rose-100 disabled:opacity-50"
                >
                  {deletingId === v.id ? "刪除中…" : "刪除"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
