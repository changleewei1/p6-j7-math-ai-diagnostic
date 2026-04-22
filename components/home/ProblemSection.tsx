import { cardBase, sectionShell } from "@/components/home/ctaStyles";

export function ProblemSection() {
  const items = [
    "計算看似沒問題，但應用題常出錯",
    "分數與比例觀念不穩",
    "題目看得懂，卻不會列式",
    "作答速度慢",
  ];

  return (
    <section className={sectionShell} aria-labelledby="problem-heading">
      <div className="mx-auto max-w-3xl space-y-6">
        <h2
          id="problem-heading"
          className="text-center text-xl font-bold text-slate-900 md:text-2xl"
        >
          升國一前，孩子真的準備好了嗎？
        </h2>
        <ul className={`${cardBase} border-slate-200/80 space-y-3`}>
          {items.map((t) => (
            <li key={t} className="flex gap-3 text-sm leading-relaxed text-slate-700 md:text-base">
              <span className="shrink-0 text-emerald-600" aria-hidden>
                ✔
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-center text-sm font-medium text-slate-800 md:text-base">
          這些問題，在升國一後會被放大。
        </p>
      </div>
    </section>
  );
}
