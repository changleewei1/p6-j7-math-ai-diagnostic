"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { ModulePerformanceCards } from "@/components/report/ModulePerformanceCards";
import { NarrativeSummaryCard } from "@/components/report/NarrativeSummaryCard";
import { ReportCharts } from "@/components/report/ReportCharts";
import { ReportCtaSection } from "@/components/report/ReportCtaSection";
import { ReportHero } from "@/components/report/ReportHero";
import { RecommendationSection } from "@/components/report/RecommendationSection";
import { VideoRecommendationSection } from "@/components/report/VideoRecommendationSection";
import { QUIZ_MODULES } from "@/lib/constants/quiz";
import { trackEvent } from "@/lib/tracking/client";
import type { ReportApiResponse } from "@/types/api";
import type { ModuleAnalysisRow } from "@/types/sessionAnalysis";

type Phase = "loading" | "ready" | "error";

export function ReportView({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ReportApiResponse | null>(null);
  const reportViewTracked = useRef(false);

  useEffect(() => {
    let c = false;
    async function run() {
      setPhase("loading");
      setErr(null);
      try {
        const res = await fetch(`/api/report/${sessionId}`);
        const j = (await res.json().catch(() => ({}))) as ReportApiResponse;
        if (!res.ok || j?.success === false) {
          const m =
            typeof (j as { message?: string })?.message === "string"
              ? (j as { message: string }).message
              : `讀取失敗（${res.status}）`;
          if (!c) {
            setErr(m);
            setPhase("error");
          }
          return;
        }
        if (!c) {
          setData(j);
          setPhase("ready");
        }
      } catch {
        if (!c) {
          setErr("網路錯誤");
          setPhase("error");
        }
      }
    }
    void run();
    return () => {
      c = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (phase !== "ready" || !data?.success || !data.reportReady || reportViewTracked.current) return;
    reportViewTracked.current = true;
    trackEvent(sessionId, "report_view", { path: "report" });
  }, [phase, data?.success, data?.reportReady, sessionId]);

  if (phase === "loading") {
    return <div className="px-4 py-16 text-center text-sm text-slate-600">載入報告中…</div>;
  }
  if (phase === "error" && err) {
    return (
      <div className="px-4 py-6">
        <SectionCard>
          <p className="text-sm text-rose-700">{err}</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-800 underline">
            返回首頁
          </Link>
        </SectionCard>
      </div>
    );
  }
  if (!data || !data.success) {
    return null;
  }

  if (!data.reportReady) {
    return (
      <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/80 to-white px-4 py-8">
        <h1 className="text-center text-lg font-bold text-slate-900">診斷結果報告</h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-slate-600">
          報告尚在整理中，或測驗尚未完成。若您剛答完最後一題，請稍候 10 秒再重新整理本頁；或回到測驗頁確認是否已全部送出。
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm"
          >
            返回首頁
          </Link>
          <Link href={`/quiz/${sessionId}`} className="text-sm text-emerald-800 underline">
            回到測驗
          </Link>
        </div>
      </div>
    );
  }

  const modules: ModuleAnalysisRow[] =
    data.moduleResults ??
    QUIZ_MODULES.map((m) => ({
      module: m,
      total: 0,
      correct: 0,
      correctRate: 0,
      averageTimeSpent: 0,
      averageEstimatedTime: 0,
      highConfidenceRate: 0,
      lowConfidenceRate: 0,
      status: "基礎穩定" as const,
    }));

  const conf =
    data.confidenceSummary ?? {
      highConfidenceCorrectCount: 0,
      highConfidenceWrongCount: 0,
      lowConfidenceCorrectCount: 0,
      lowConfidenceWrongCount: 0,
      mediumConfidenceCount: 0,
    };
  const videos = data.videos ?? [];
  const recommendedVideos = data.recommendedVideos ?? [];
  const narrative = data.narrativeSummary;
  const headline = narrative?.headline ?? null;

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/80 via-white to-slate-50/80 pb-10">
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6 sm:py-8">
        <ReportHero
          studentName={data.studentName}
          overallLevel={data.overallLevel}
          overallScore={data.overallScore}
          readinessStatus={data.readinessStatus ?? null}
          narrativeHeadline={headline}
        />

        <NarrativeSummaryCard narrative={narrative} />

        <ModulePerformanceCards rows={modules} />

        {data.timingSummary && (
          <p className="text-xs text-slate-500">
            作題平均用時 {data.timingSummary.averageTimeSpent} 秒 · 偏快但答錯
            {data.timingSummary.fastButInaccurateCount} 題 · 明顯偏慢題
            {data.timingSummary.slowQuestionCount} 題
          </p>
        )}

        <ReportCharts moduleResults={modules} confidenceSummary={conf} />

        {data.riskTags.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-900">學習觀察</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.riskTags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-amber-200/60 bg-amber-50/90 px-3 py-1 text-xs font-medium text-amber-900"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <RecommendationSection items={data.recommendations} highlights={data.recommendationHighlights} />

        <VideoRecommendationSection answerBasedVideos={recommendedVideos} moduleVideos={videos} />

        <ReportCtaSection sessionId={sessionId} weakestModules={data.weakestModules ?? null} />
      </div>
    </div>
  );
}
