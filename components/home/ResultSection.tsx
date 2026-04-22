import { cardBase, sectionShell } from "@/components/home/ctaStyles";

const ITEMS = [
  "整體等級",
  "五大單元分析",
  "作答速度分析",
  "個人化建議",
];

export function ResultSection() {
  return (
    <section className={sectionShell} aria-labelledby="result-heading">
      <div className="mx-auto max-w-3xl space-y-6">
        <h2
          id="result-heading"
          className="text-center text-xl font-bold text-slate-900 md:text-2xl"
        >
          完成後你會得到
        </h2>
        <ul className={`${cardBase} border-slate-200/80 space-y-3`}>
          {ITEMS.map((t) => (
            <li key={t} className="flex gap-3 text-sm text-slate-800 md:text-base">
              <span className="shrink-0 text-emerald-600" aria-hidden>
                ✔
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
