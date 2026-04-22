import { OFFICIAL_LINE_URL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/lib/constants/contact";

type Props = {
  className?: string;
  /** 較緊湊的單行／少留白（報告 CTA 下方用） */
  compact?: boolean;
  /** 點擊官方 LINE 連結前（不阻擋導向） */
  onLineClick?: () => void;
};

/**
 * 補習班官方 LINE 與聯絡電話；與 `lib/constants/contact.ts` 同步。
 */
export function ContactInfoCard({ className = "", compact = false, onLineClick }: Props) {
  return (
    <div
      className={`rounded-xl border border-emerald-100/80 bg-white/80 px-3 py-2.5 text-left shadow-sm ${
        compact ? "text-xs" : "px-4 py-3.5 text-sm"
      } ${className}`}
    >
      <p className="font-medium text-slate-800">聯絡我們</p>
      <ul className={`mt-2 space-y-1.5 text-slate-600 ${compact ? "" : "sm:mt-2.5"}`}>
        <li>
          <span className="text-slate-500">LINE 諮詢：</span>
          <a
            href={OFFICIAL_LINE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
            onClick={onLineClick}
          >
            官方 LINE
          </a>
        </li>
        <li>
          <span className="text-slate-500">服務電話：</span>
          <a
            href={`tel:${CONTACT_PHONE}`}
            className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </li>
      </ul>
    </div>
  );
}
