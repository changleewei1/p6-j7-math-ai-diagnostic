import { sectionShell } from "@/components/home/ctaStyles";

const FAQ = [
  { q: "需要付費嗎？", a: "完全免費" },
  { q: "需要多久？", a: "約 3～5 分鐘" },
  { q: "結果準確嗎？", a: "由教學團隊設計" },
  { q: "一定要報名嗎？", a: "不需要" },
] as const;

export function FaqSection() {
  return (
    <section className={sectionShell} aria-labelledby="faq-heading">
      <div className="mx-auto max-w-2xl space-y-6">
        <h2
          id="faq-heading"
          className="text-center text-xl font-bold text-slate-900 md:text-2xl"
        >
          常見問題
        </h2>
        <div className="space-y-4 md:space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-slate-200/90 bg-white p-1 shadow-sm open:border-emerald-200/90 open:shadow-md md:hover:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-4 text-left sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                <span className="text-sm font-medium leading-snug text-slate-900 sm:text-base">
                  Q：{item.q}
                </span>
                <span
                  className="shrink-0 text-xs text-emerald-600 transition group-open:rotate-180"
                  aria-hidden
                >
                  ▼
                </span>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-600 sm:px-5 sm:pb-5">
                A：{item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
