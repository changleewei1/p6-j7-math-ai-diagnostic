import { cardBase, sectionShell } from "@/components/home/ctaStyles";

const CARDS = [
  {
    emoji: "1️⃣",
    title: "快速診斷",
    lines: ["15 題精選題目", "3～5 分鐘完成"],
  },
  {
    emoji: "2️⃣",
    title: "精準分析",
    lines: ["分析弱點與學習習慣"],
  },
  {
    emoji: "3️⃣",
    title: "銜接規劃",
    lines: ["提供補強與銜接建議"],
  },
] as const;

export function ValueSection() {
  return (
    <section
      id="test-overview"
      className={`${sectionShell} scroll-mt-20 md:scroll-mt-24`}
      aria-labelledby="value-heading"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <h2
          id="value-heading"
          className="text-center text-xl font-bold text-slate-900 md:text-2xl"
        >
          三大價值
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {CARDS.map((c) => (
            <article
              key={c.title}
              className={`${cardBase} flex flex-col border-emerald-100/80`}
            >
              <p className="text-2xl" aria-hidden>
                {c.emoji}
              </p>
              <h3 className="mt-3 text-base font-semibold text-slate-900 md:text-lg">{c.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-600">
                {c.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
