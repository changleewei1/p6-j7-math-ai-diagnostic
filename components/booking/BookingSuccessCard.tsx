import Link from "next/link";
import { OFFICIAL_LINE_URL } from "@/lib/constants/contact";

type Props = {
  bookingId: string;
  reportSessionId?: string | null;
};

export function BookingSuccessCard({ bookingId, reportSessionId }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-sm sm:p-7">
      <div className="text-center">
        <p className="text-lg font-semibold text-emerald-900">已收到預約申請</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          感謝填寫！我們將由專人盡快與您聯繫，協助安排試聽與課程說明。若需立即聯絡，歡迎使用官方 LINE 或服務電話。
        </p>
        <p className="mt-3 text-xs text-slate-500">參考編號：{bookingId}</p>
      </div>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
        {reportSessionId ? (
          <Link
            href={`/report/${encodeURIComponent(reportSessionId)}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50 sm:min-w-[9rem] sm:flex-initial"
          >
            回到診斷報告
          </Link>
        ) : null}
        <a
          href={OFFICIAL_LINE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 sm:min-w-[9rem] sm:flex-initial"
        >
          加入官方 LINE
        </a>
        <Link
          href="/"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:min-w-[9rem] sm:flex-initial"
        >
          返回首頁
        </Link>
      </div>
    </div>
  );
}
