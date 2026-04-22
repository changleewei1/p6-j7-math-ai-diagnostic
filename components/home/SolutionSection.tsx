import { sectionShell } from "@/components/home/ctaStyles";

export function SolutionSection() {
  return (
    <section className={sectionShell} aria-labelledby="solution-heading">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-5 shadow-sm md:p-8 md:hover:shadow-md">
          <h2
            id="solution-heading"
            className="text-center text-xl font-bold text-slate-900 md:text-2xl"
          >
            用 AI 幫你看懂孩子真正的數學程度
          </h2>
          <div className="mt-6 space-y-4 text-center text-sm leading-relaxed text-slate-700 md:text-base">
            <p>透過精心設計的診斷測驗</p>
            <p>分析答題結果、作答時間與信心</p>
            <p className="font-semibold text-emerald-900">找出真正的學習盲點</p>
          </div>
        </div>
      </div>
    </section>
  );
}
