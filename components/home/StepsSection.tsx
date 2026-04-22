import { sectionShell } from "@/components/home/ctaStyles";

const STEPS = [
  { num: "①", title: "填寫資料", desc: "建立學生與家長基本資料" },
  { num: "②", title: "進行測驗", desc: "依序作答與標示信心" },
  { num: "③", title: "取得報告", desc: "檢視分析與銜接建議" },
] as const;

export function StepsSection() {
  return (
    <section className={sectionShell} aria-labelledby="steps-heading">
      <div className="mx-auto max-w-4xl space-y-6">
        <h2
          id="steps-heading"
          className="text-center text-xl font-bold text-slate-900 md:text-2xl"
        >
          只要三個步驟
        </h2>
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition md:p-6 md:hover:border-emerald-200 md:hover:shadow-md"
            >
              <span className="text-2xl font-bold text-emerald-600" aria-hidden>
                {s.num}
              </span>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 md:text-sm">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
