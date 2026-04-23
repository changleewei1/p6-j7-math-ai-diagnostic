"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OFFICIAL_LINE_URL, CONTACT_PHONE_DISPLAY } from "@/lib/constants/contact";
import { getReportAbsoluteUrl, getReportPath } from "@/lib/report/getReportUrl";

type Props = {
  sessionId: string;
};

function buildShareMessage(reportUrl: string): string {
  return `您好，這是孩子本次數學診斷報告：
${reportUrl}

可先查看整體分析、弱點與建議方向。
如需安排試聽或進一步說明，歡迎與我們聯絡。

- 名貫補習班
- 官方 LINE：${OFFICIAL_LINE_URL}
- 聯絡電話：${CONTACT_PHONE_DISPLAY}
`;
}

export function SessionReportActions({ sessionId }: Props) {
  const [hint, setHint] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [displayUrl, setDisplayUrl] = useState("");

  useEffect(() => {
    setDisplayUrl(getReportAbsoluteUrl(sessionId));
  }, [sessionId]);

  const shareBody = useMemo(
    () => (displayUrl ? buildShareMessage(displayUrl) : ""),
    [displayUrl],
  );

  const setFlash = useCallback((msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 4000);
  }, []);

  const resolveClientReportUrl = useCallback((): string => {
    if (typeof window === "undefined") {
      return "";
    }
    const raw = getReportAbsoluteUrl(sessionId);
    if (raw.startsWith("/") && !raw.startsWith("//")) {
      return new URL(getReportPath(sessionId), window.location.origin).toString();
    }
    return raw;
  }, [sessionId]);

  const openReport = useCallback(() => {
    const href = resolveClientReportUrl();
    if (!href) {
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }, [resolveClientReportUrl]);

  const copyReportLink = useCallback(async () => {
    const forClipboard = resolveClientReportUrl();
    if (!forClipboard) {
      setFlash("無法取得報告網址。");
      return;
    }
    try {
      await navigator.clipboard.writeText(forClipboard);
      setFlash("已複製報告連結");
    } catch {
      setFlash("無法寫入剪貼簿，請改用手動複製或檢查瀏覽器權限。");
    }
  }, [resolveClientReportUrl, setFlash]);

  const copyShareMessage = useCallback(async () => {
    const u = resolveClientReportUrl();
    if (!u) {
      setFlash("無法產生訊息內容（網址未就緒）。");
      return;
    }
    const text = buildShareMessage(u);
    if (!text) {
      setFlash("無法產生訊息內容。");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setFlash("已複製分享訊息");
    } catch {
      setFlash("無法寫入剪貼簿，請改用手動複製或檢查瀏覽器權限。");
    }
  }, [resolveClientReportUrl, setFlash, sessionId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">報告操作</h2>
      {hint && (
        <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-900" role="status">
          {hint}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">報告頁路徑：<span className="font-mono text-slate-600">/report/{sessionId}</span></p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={openReport}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          開啟學生報告
        </button>
        <button
          type="button"
          onClick={() => {
            void copyReportLink();
          }}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          複製報告連結
        </button>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          產生分享訊息
        </button>
        <button
          type="button"
          onClick={() => {
            void copyShareMessage();
          }}
          className="min-h-10 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 text-sm font-medium text-emerald-900 shadow-sm hover:bg-emerald-100/80"
        >
          複製分享訊息
        </button>
      </div>
      {shareOpen && (
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">分享訊息（可手動再編修）</label>
          <textarea
            readOnly
            rows={12}
            value={displayUrl ? shareBody : "讀取中…"}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs leading-relaxed text-slate-800"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
