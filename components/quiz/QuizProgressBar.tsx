type Props = {
  /** 已送出作答的題數（相異題目；資料來自 answers，與 session_questions 出題列數不同） */
  answeredCount: number;
  total: number;
  /** 本題在整卷中的序號（1-based，通常 = 已答 + 1） */
  currentOrder: number;
};

export function QuizProgressBar({ answeredCount, total, currentOrder }: Props) {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.min(100, Math.round((answeredCount / safeTotal) * 100));
  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-2 text-xs text-slate-500">
        <span className="pt-0.5 font-medium text-slate-600">測驗進度</span>
        <div className="text-right leading-snug">
          <p className="text-slate-700">
            已答 <span className="font-semibold tabular-nums text-emerald-800">{answeredCount}</span> / {total} 題
          </p>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            本題第 {currentOrder} 題
          </p>
        </div>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/80"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`已作答 ${answeredCount} 題，共 ${total} 題；本題第 ${currentOrder} 題`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
