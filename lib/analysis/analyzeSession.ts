import { QUIZ_MODULES } from "@/lib/constants/quiz";
import type {
  ConfidenceSummary,
  DifficultyBreakdown,
  ModuleAnalysisRow,
  ModuleStatusLabel,
  SessionSummaryJsonV1,
  TimingSummary,
} from "@/types/sessionAnalysis";
import type { ConfidenceLevel, DifficultyLevel, QuizModule } from "@/types/quiz";

export type AnswerRowInput = {
  question_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
  confidence_level: ConfidenceLevel;
};

export type SessionQuestionInput = {
  question_id: string;
  module: QuizModule;
  difficulty: DifficultyLevel;
};

export type QuestionMetaInput = {
  question_id: string;
  estimated_time_seconds: number;
};

export type AnalyzeSessionInput = {
  sessionQuestionRows: SessionQuestionInput[];
  questionMetaById: Map<string, QuestionMetaInput>;
  answerRows: AnswerRowInput[];
  totalQuestions: number;
};

function levelFromRate(rate: number): "A" | "B" | "C" | "D" {
  if (rate >= 85) return "A";
  if (rate >= 70) return "B";
  if (rate >= 50) return "C";
  return "D";
}

function moduleStatus(
  correctRate: number,
  averageTimeSpent: number,
  averageEstimatedTime: number,
): ModuleStatusLabel {
  const hasEst = averageEstimatedTime > 0;
  if (correctRate >= 85) {
    if (hasEst && averageTimeSpent <= averageEstimatedTime) return "高潛力";
    if (!hasEst) return "高潛力";
  }
  if (correctRate >= 70) return "基礎穩定";
  if (correctRate >= 50) return "需要加強";
  return "弱點明顯";
}

/**
 * 規則式分析：產生摘要 JSON 與模組／難度／時間／信心／風險指標
 */
export function analyzeSession(input: AnalyzeSessionInput): SessionSummaryJsonV1 {
  const { sessionQuestionRows, questionMetaById, answerRows, totalQuestions } = input;
  const byQ = new Map<string, AnswerRowInput>();
  for (const a of answerRows) {
    byQ.set(a.question_id, a);
  }

  const correctN = answerRows.filter((a) => a.is_correct).length;
  const overallCorrectRate = totalQuestions > 0 ? correctN / totalQuestions : 0;
  const overallScore = Math.round(overallCorrectRate * 1000) / 10; // 0–100 一位小數
  const overallLevel = levelFromRate(overallScore);

  const moduleResults: ModuleAnalysisRow[] = QUIZ_MODULES.map((mod) => {
    const sqs = sessionQuestionRows.filter((sq) => sq.module === mod);
    const list = sqs
      .map((sq) => {
        const a = byQ.get(sq.question_id);
        if (!a) return null;
        const m = questionMetaById.get(sq.question_id);
        return {
          est: m?.estimated_time_seconds ?? 0,
          t: a.time_spent_seconds,
          conf: a.confidence_level,
          ok: a.is_correct,
        };
      })
      .filter(
        (x): x is { est: number; t: number; conf: ConfidenceLevel; ok: boolean } =>
          x != null,
      );
    const total = sqs.length;
    const correct = list.filter((x) => x.ok).length;
    const correctRate = total > 0 ? (correct / total) * 100 : 0;
    const sumT = list.reduce((s, x) => s + x.t, 0);
    const sumE = list.reduce((s, x) => s + x.est, 0);
    const averageTimeSpent = total > 0 ? sumT / total : 0;
    const averageEstimatedTime = total > 0 ? sumE / total : 0;
    const confH = list.filter((x) => x.conf === "high").length;
    const confL = list.filter((x) => x.conf === "low").length;
    const highConfidenceRate = total > 0 ? confH / total : 0;
    const lowConfidenceRate = total > 0 ? confL / total : 0;
    return {
      module: mod,
      total,
      correct,
      correctRate: Math.round(correctRate * 10) / 10,
      averageTimeSpent: Math.round(averageTimeSpent * 10) / 10,
      averageEstimatedTime: Math.round(averageEstimatedTime * 10) / 10,
      highConfidenceRate: Math.round(highConfidenceRate * 1000) / 1000,
      lowConfidenceRate: Math.round(lowConfidenceRate * 1000) / 1000,
      status: moduleStatus(
        correctRate,
        averageTimeSpent,
        averageEstimatedTime,
      ),
    };
  });

  const diff: DifficultyLevel[] = ["easy", "medium", "hard"];
  const difficultyResults: DifficultyBreakdown = {
    easy: { total: 0, correct: 0, correctRate: 0, averageTimeSpent: 0 },
    medium: { total: 0, correct: 0, correctRate: 0, averageTimeSpent: 0 },
    hard: { total: 0, correct: 0, correctRate: 0, averageTimeSpent: 0 },
  };
  for (const d of diff) {
    const part = sessionQuestionRows
      .filter((sq) => sq.difficulty === d)
      .map((sq) => byQ.get(sq.question_id))
      .filter(Boolean) as AnswerRowInput[];
    const t = part.length;
    const c = part.filter((p) => p.is_correct).length;
    const rate = t > 0 ? (c / t) * 100 : 0;
    const avT = t > 0 ? part.reduce((s, p) => s + p.time_spent_seconds, 0) / t : 0;
    difficultyResults[d] = {
      total: t,
      correct: c,
      correctRate: Math.round(rate * 10) / 10,
      averageTimeSpent: Math.round(avT * 10) / 10,
    };
  }

  let fastButInaccurateCount = 0;
  let slowQuestionCount = 0;
  let timeSum = 0;
  for (const a of answerRows) {
    const m = questionMetaById.get(a.question_id);
    const est = m?.estimated_time_seconds ?? 0;
    timeSum += Number(a.time_spent_seconds);
    if (est > 0) {
      const ts = Number(a.time_spent_seconds);
      if (ts < est * 0.6 && !a.is_correct) fastButInaccurateCount += 1;
      if (ts > est * 1.5) slowQuestionCount += 1;
    }
  }
  const averageTimeSpent = answerRows.length > 0 ? timeSum / answerRows.length : 0;
  const timingSummary: TimingSummary = {
    averageTimeSpent: Math.round(averageTimeSpent * 10) / 10,
    fastButInaccurateCount,
    slowQuestionCount,
  };

  let highC = 0;
  let lowC = 0;
  let highW = 0;
  let lowW = 0;
  let medC = 0;
  for (const a of answerRows) {
    if (a.confidence_level === "high") {
      if (a.is_correct) highC += 1;
      else highW += 1;
    } else if (a.confidence_level === "low") {
      if (a.is_correct) lowC += 1;
      else lowW += 1;
    } else {
      medC += 1;
    }
  }
  const confidenceSummary: ConfidenceSummary = {
    highConfidenceCorrectCount: highC,
    lowConfidenceCorrectCount: lowC,
    highConfidenceWrongCount: highW,
    lowConfidenceWrongCount: lowW,
    mediumConfidenceCount: medC,
  };

  const riskTags = buildRiskTags({
    moduleResults,
    overallLevel,
    timingSummary,
    confidenceSummary,
  });

  return {
    version: "v1",
    generatedAt: new Date().toISOString(),
    overallCorrectRate: Math.round(overallCorrectRate * 1000) / 1000,
    overallScore,
    overallLevel,
    moduleResults,
    difficultyResults,
    timingSummary,
    confidenceSummary,
    riskTags,
  };
}

function buildRiskTags(p: {
  moduleResults: ModuleAnalysisRow[];
  overallLevel: "A" | "B" | "C" | "D";
  timingSummary: TimingSummary;
  confidenceSummary: ConfidenceSummary;
}): string[] {
  const tags: string[] = [];
  for (const m of p.moduleResults) {
    if (m.correctRate < 50) {
      if (m.module === "分數/小數/比例") tags.push("分數比例觀念不穩");
      if (m.module === "文字題與閱讀理解") tags.push("文字題列式能力不足");
    }
  }
  if (p.timingSummary.slowQuestionCount >= 2) {
    tags.push("作答速度偏慢");
  }
  if (p.confidenceSummary.lowConfidenceCorrectCount > 0 && p.overallLevel !== "D") {
    tags.push("信心不足但具備基礎");
  }
  if (p.confidenceSummary.highConfidenceWrongCount >= 2) {
    tags.push("容易過度自信導致錯誤");
  }
  if (p.overallLevel === "C" || p.overallLevel === "D") {
    tags.push("多模組可再加強，建議有系統複習");
  }
  return Array.from(new Set(tags));
}
