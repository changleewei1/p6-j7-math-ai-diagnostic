import Link from "next/link";
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY, OFFICIAL_LINE_URL } from "@/lib/constants/contact";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/80 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-4 text-center text-sm leading-relaxed text-slate-600">
        <p className="font-semibold text-slate-800">名貫補習班</p>
        <p className="leading-relaxed">
          LINE：
          <a
            href={OFFICIAL_LINE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
          >
            {OFFICIAL_LINE_URL}
          </a>
        </p>
        <p className="leading-relaxed">
          電話：
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="inline-block font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </p>
        <p className="pt-2 text-xs leading-relaxed text-slate-400">小六升國一數學 AI 診斷系統</p>
        <p className="pt-1">
          <Link
            href="/admin"
            className="text-[11px] text-slate-400/80 no-underline transition hover:text-slate-500 hover:underline"
            prefetch={false}
          >
            管理入口
          </Link>
        </p>
      </div>
    </footer>
  );
}
