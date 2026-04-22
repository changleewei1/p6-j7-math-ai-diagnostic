import Link from "next/link";
import { CTA_PRIMARY } from "@/components/home/ctaStyles";

export function CtaSection() {
  return (
    <section className="px-4 py-10 md:px-8 md:py-12" aria-labelledby="cta-bottom-heading">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/50 p-5 text-center shadow-sm md:p-8 md:hover:shadow-md">
          <h2
            id="cta-bottom-heading"
            className="text-lg font-bold text-slate-900 md:text-xl"
          >
            現在就開始，掌握孩子升國一的關鍵
          </h2>
          <div className="mt-6 flex justify-center">
            <Link href="/register" className={CTA_PRIMARY}>
              立即開始免費診斷
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
