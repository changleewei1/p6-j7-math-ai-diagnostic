"use client";

import Link from "next/link";
import { ContactInfoCard } from "@/components/report/ContactInfoCard";
import { OFFICIAL_LINE_URL } from "@/lib/constants/contact";
import { trackEvent } from "@/lib/tracking/client";
import type { QuizModule } from "@/types/quiz";

const BTN =
  "min-h-11 w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-sm transition sm:min-w-[10rem] sm:px-4";

type Props = {
  sessionId: string;
  /** 來自 `summary_json` / 報告 API 之 `weakestModules` */
  weakestModules: QuizModule[] | null;
};

/**
 * 報告頁招生轉換：診斷弱點提示、預約主 CTA、LINE、信任文案；行為追蹤見 `trackEvent`。
 */
export function ReportCtaSection({ sessionId, weakestModules }: Props) {
  const bookingHref = `/booking?sessionId=${encodeURIComponent(sessionId)}`;
  const weak = weakestModules?.filter(Boolean) ?? [];

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 p-4 sm:p-5">
      <div className="rounded-xl border border-amber-100/80 bg-amber-50/50 px-3 py-3 sm:px-4">
        <p className="text-xs font-semibold text-amber-950 sm:text-sm">診斷強化提示</p>
        {weak.length > 0 ? (
          <>
            <p className="mt-1.5 text-xs text-slate-700 sm:text-sm">建議優先加強：</p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-slate-800 sm:text-sm">
              {weak.map((m) => (
                <li key={m} className="flex gap-1.5">
                  <span className="text-emerald-600" aria-hidden>
                    ✔
                  </span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
            整體表現可再與專人討論後鎖定加強重點，或透過試聽了解適合的班別。
          </p>
        )}
        <p className="mt-2.5 border-t border-amber-100/60 pt-2.5 text-xs leading-relaxed text-amber-950/90 sm:text-sm">
          若未提前準備，升國一後容易在<strong>代數</strong>與<strong>應用題</strong>出現落差。
        </p>
      </div>

      <h2 className="mt-4 text-center text-sm font-semibold text-slate-900">與我們一起規劃下一步</h2>
      <p className="mt-1 text-center text-xs leading-relaxed text-slate-600">
        預約免費試聽，取得專屬學習規劃；需要即時溝通歡迎加 LINE 與專人聊聊。
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        <Link
          href={bookingHref}
          className={`${BTN} border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 sm:order-1`}
          onClick={() => {
            trackEvent(sessionId, "click_booking", { from: "report_cta" });
          }}
        >
          👉 預約免費試聽，獲得專屬學習規劃
        </Link>
        <a
          href={OFFICIAL_LINE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={`${BTN} order-2 border border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50 sm:order-2`}
          onClick={() => {
            trackEvent(sessionId, "click_line", { from: "report_cta" });
          }}
        >
          👉 LINE 諮詢孩子學習狀況
        </a>
        <Link
          href="/register"
          className={`${BTN} order-3 border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 sm:order-3`}
        >
          重新測驗
        </Link>
        <Link
          href="/"
          className={`${BTN} order-4 border border-slate-200/80 bg-white text-slate-800 hover:bg-slate-50 sm:order-4`}
        >
          返回首頁
        </Link>
      </div>

      <p className="mt-3 text-center text-xs text-slate-600">
        <span className="text-emerald-600" aria-hidden>
          ✔
        </span>{" "}
        已協助超過 100 位學生順利銜接國一
      </p>

      <div className="mt-4">
        <ContactInfoCard compact />
      </div>
    </div>
  );
}
