"use client";

import type { ConfidenceSummary } from "@/types/sessionAnalysis";
import type { ModuleAnalysisRow } from "@/types/sessionAnalysis";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#059669", "#0d9488", "#f59e0b", "#e11d48", "#64748b"];

type Props = {
  moduleResults: ModuleAnalysisRow[];
  confidenceSummary: ConfidenceSummary;
};

/**
 * 三張獨立圖表：模組正答率、用時、信心交叉
 */
export function ReportCharts({ moduleResults, confidenceSummary }: Props) {
  const rateData = moduleResults.map((m) => ({
    name: m.module.length > 8 ? m.module.slice(0, 7) + "…" : m.module,
    fullName: m.module,
    rate: m.correctRate,
  }));
  const timeData = moduleResults.map((m) => ({
    name: m.module.length > 8 ? m.module.slice(0, 7) + "…" : m.module,
    實測: m.averageTimeSpent,
    參考: m.averageEstimatedTime,
  }));
  const confData = [
    { name: "高信心·答對", value: confidenceSummary.highConfidenceCorrectCount },
    { name: "高信心·答錯", value: confidenceSummary.highConfidenceWrongCount },
    { name: "低信心·答對", value: confidenceSummary.lowConfidenceCorrectCount },
    { name: "低信心·答錯", value: confidenceSummary.lowConfidenceWrongCount },
    { name: "中信心", value: confidenceSummary.mediumConfidenceCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-slate-900">各模組正答率</h2>
        <div className="mt-2 h-72 w-full min-w-0 rounded-xl border border-slate-100 bg-white p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rateData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
                label={{ value: "%", position: "insideTop", offset: -2, fontSize: 10 }}
              />
              <Tooltip
                labelFormatter={(_, p) => {
                  const p0 = p?.[0] as { payload?: { fullName?: string } } | undefined;
                  return p0?.payload?.fullName ?? "";
                }}
                formatter={(v) => [`${v}%`, "正答率"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="rate" name="正答率" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">各模組平均用時</h2>
        <p className="mt-0.5 text-xs text-slate-500">實測與題庫參考用時（秒）對照</p>
        <div className="mt-2 h-72 w-full min-w-0 rounded-xl border border-slate-100 bg-white p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: "秒", position: "insideTop", offset: -2, fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="實測" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
              <Bar dataKey="參考" fill="#94a3b8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900">信心與正誤</h2>
        <div className="mt-2 h-64 w-full min-w-0 rounded-xl border border-slate-100 bg-white p-2 sm:p-3">
          {confData.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">尚無可視覺化之信心分佈</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie
                  data={confData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {confData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]!} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
