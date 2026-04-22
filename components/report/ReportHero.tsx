import type { ReadinessStatus } from "@/types/sessionAnalysis";

type Props = {
  studentName: string;
  overallLevel: string | null;
  overallScore: number | string | null;
  readinessStatus: ReadinessStatus | null;
  narrativeHeadline: string | null;
};

function badgeClass(level: string) {
  if (level === "A") return "bg-emerald-600 text-white";
  if (level === "B") return "bg-teal-600 text-white";
  if (level === "C") return "bg-amber-500 text-white";
  if (level === "D") return "bg-rose-600 text-white";
  return "bg-slate-500 text-white";
}

export function ReportHero({
  studentName,
  overallLevel,
  overallScore,
  readinessStatus,
  narrativeHeadline,
}: Props) {
  const L = overallLevel ? String(overallLevel) : "—";
  return (
    <header className="relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/40 to-sky-50/50 px-4 py-6 shadow-sm sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />
      <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-800/80">
        診斷結果報告
      </p>
      <h1 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {studentName} 的數學力診斷
      </h1>
      {narrativeHeadline && (
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          {narrativeHeadline}
        </p>
      )}
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-1 flex-col items-center rounded-xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <span className="text-xs text-slate-500">等第</span>
          <span
            className={`mt-1 inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-3 py-1 text-xl font-bold ${badgeClass(L)}`}
          >
            {L}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <span className="text-xs text-slate-500">整體得分</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {overallScore != null ? String(overallScore) : "—"}
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <span className="text-xs text-slate-500">銜接準備</span>
          <p className="mt-1 text-center text-sm font-semibold text-emerald-900">
            {readinessStatus ?? "—"}
          </p>
        </div>
      </div>
    </header>
  );
}
