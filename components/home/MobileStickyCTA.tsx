import Link from "next/link";
import { CTA_PRIMARY } from "@/components/home/ctaStyles";

/**
 * 手機底部固定轉換 CTA（桌機隱藏）
 */
export function MobileStickyCTA() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white p-3 shadow-[0_-8px_24px_-4px_rgba(15,23,42,0.08)] md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto w-full max-w-5xl px-1">
        <Link
          href="/register"
          className={`${CTA_PRIMARY} w-full shadow-md`}
        >
          👉 立即開始免費診斷
        </Link>
      </div>
    </div>
  );
}
