import { SectionCard } from "@/components/ui/SectionCard";
import type { ModuleAnalysisRow } from "@/types/sessionAnalysis";

function confHint(high: number, low: number) {
  if (high >= 0.45) return "高信心比例偏高";
  if (low >= 0.4) return "低信心比例偏高，可能較沒把握";
  return "中間信心佔多數";
}

type Props = { rows: ModuleAnalysisRow[] };

export function ModulePerformanceCards({ rows }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">五大模組表現</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((m) => (
          <li key={m.module}>
            <SectionCard className="border-slate-100 bg-white/95 p-3.5 sm:p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-900">{m.module}</h3>
                <span
                  className={`inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-medium ${
                    m.status === "高潛力"
                      ? "bg-emerald-100 text-emerald-900"
                      : m.status === "基礎穩定"
                        ? "bg-sky-100 text-sky-900"
                        : m.status === "需要加強"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
                答對 {m.correct} / {m.total} 題 · 正答率 {m.correctRate}% ·
                平均 {m.averageTimeSpent}s / 參考 {m.averageEstimatedTime}s
              </p>
              <p className="mt-1 text-xs text-slate-500">
                信心觀察：{confHint(m.highConfidenceRate, m.lowConfidenceRate)}（高 {Math.round(
                  m.highConfidenceRate * 100,
                )}% ／ 低 {Math.round(m.lowConfidenceRate * 100)}%）
              </p>
            </SectionCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
