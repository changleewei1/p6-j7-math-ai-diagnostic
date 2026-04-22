"use client";

import type { ConfidenceLevel, DifficultyLevel, QuizModule } from "@/types/quiz";
import { SectionCard } from "@/components/ui/SectionCard";

const difficultyLabel: Record<DifficultyLevel, string> = {
  easy: "基礎",
  medium: "中等",
  hard: "進階",
};

const difficultyColor: Record<DifficultyLevel, string> = {
  easy: "bg-emerald-100 text-emerald-900",
  medium: "bg-amber-100 text-amber-900",
  hard: "bg-rose-100 text-rose-900",
};

const confidenceItems: { key: ConfidenceLevel; label: string }[] = [
  { key: "high", label: "很有把握" },
  { key: "medium", label: "普通" },
  { key: "low", label: "用猜的" },
];

type Props = {
  orderIndex: number;
  totalQuestions: number;
  module: QuizModule;
  difficulty: DifficultyLevel;
  prompt: string;
  choices: string[];
  estimatedSeconds: number;
  selectedChoice: number | null;
  onSelectChoice: (index: number) => void;
  confidence: ConfidenceLevel | null;
  onSelectConfidence: (c: ConfidenceLevel) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  submitLoading: boolean;
  submitError: string | null;
};

/**
 * 單題：選項、信心度、送出（由父層處理 API）
 */
export function QuizQuestionCard({
  orderIndex,
  totalQuestions,
  module,
  difficulty,
  prompt,
  choices,
  estimatedSeconds,
  selectedChoice,
  onSelectChoice,
  confidence,
  onSelectConfidence,
  onSubmit,
  canSubmit,
  submitLoading,
  submitError,
}: Props) {
  return (
    <SectionCard>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor[difficulty]}`}
        >
          {difficultyLabel[difficulty]}
        </span>
        <span className="text-xs text-slate-500">參考用時 約 {estimatedSeconds} 秒</span>
      </div>
      <p className="text-xs font-medium text-emerald-800">{module}</p>
      <h2 className="mt-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
        本題為整卷第 {orderIndex} 題
        <span className="ml-1 text-sm font-normal text-slate-500">（全卷共 {totalQuestions} 題）</span>
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{prompt}</p>
      <ol className="mt-4 space-y-2">
        {choices.map((label, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSel = selectedChoice === idx;
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onSelectChoice(idx)}
                className={`min-h-12 w-full rounded-xl border-2 px-3 py-3 text-left text-sm transition sm:min-h-14 sm:py-3.5 ${
                  isSel
                    ? "border-emerald-500 bg-emerald-50/80 text-emerald-950"
                    : "border-slate-200 bg-white text-slate-800 hover:border-emerald-200"
                }`}
              >
                <span className="font-semibold text-emerald-800">{letter}.</span> {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-800">答題信心</p>
        <p className="mt-0.5 text-xs text-slate-500">請先選答案，再選信心度；送出前兩者皆需完成。</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {confidenceItems.map((c) => {
            const on = confidence === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectConfidence(c.key)}
                disabled={selectedChoice == null}
                className={`min-h-11 rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                  selectedChoice == null
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : on
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-800 hover:border-emerald-200"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {submitError && (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || submitLoading}
          className="min-h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md transition enabled:hover:from-emerald-700 enabled:hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLoading ? "送出中…" : "送出並前往下一題"}
        </button>
      </div>
    </SectionCard>
  );
}
