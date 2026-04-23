"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Video, Youtube } from "lucide-react";
import type { ReportRecommendedVideoItem, ReportVideoItem } from "@/types/api";
import { RecommendedVideoCard } from "@/components/report/RecommendedVideoCard";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** 依本次作答 + question_videos 規則推薦（優先顯示） */
  answerBasedVideos: ReportRecommendedVideoItem[];
  /** 依模組弱點自 video_recommendations 補充（無前者或需補滿時） */
  moduleVideos: ReportVideoItem[];
};

function SectionHeader({ personalized }: { personalized: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/40 p-4 shadow-sm ring-1 ring-emerald-900/5 sm:p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="relative flex gap-3 sm:gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-md shadow-emerald-900/10 sm:h-14 sm:w-14"
          aria-hidden
        >
          <Video className="h-6 w-6 text-emerald-700 sm:h-7 sm:w-7" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">推薦補強影片</h2>
            <span className="hidden rounded-full border border-emerald-200/80 bg-emerald-100/80 px-2 py-0.5 text-xs font-semibold text-emerald-900 sm:inline-flex sm:items-center sm:gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              個人化
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">
            {personalized
              ? "根據本次測驗結果，系統已自動整理出最值得優先補強的影片內容，建議依序觀看，協助孩子對症複習。"
              : "根據本次診斷的弱點模組，以下為建議一併參考的補充內容，可搭配上方分析依序觀看。"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ModuleVideoCard({ v, index }: { v: ReportVideoItem; index: number }) {
  const isFirst = index === 0;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileHover={{ y: -1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md",
        isFirst && "border-emerald-200/80 ring-1 ring-emerald-200/30",
      )}
    >
      {isFirst && (
        <div className="border-b border-amber-100/80 bg-amber-50/50 px-4 py-2 text-center text-xs font-bold text-amber-900 sm:text-left">
          ★ 建議先看
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/60 bg-emerald-50/90 px-2 py-0.5 text-xs font-bold text-emerald-900">
              <BookOpen className="h-3.5 w-3.5" />
              {v.module}
            </span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
              {index + 1}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">{v.title}</h3>
          {v.description && <p className="text-sm leading-relaxed text-slate-600">{v.description}</p>}
        </div>
        <div className="flex shrink-0 border-t border-slate-100 bg-slate-50/40 p-4 sm:w-48 sm:border-l sm:border-t-0 sm:items-stretch sm:p-4">
          <a
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 text-sm font-bold text-white shadow-sm transition hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md active:scale-[0.99]"
          >
            <Youtube className="h-5 w-5 shrink-0 opacity-90" />
            開始補強
          </a>
        </div>
      </div>
    </motion.li>
  );
}

export function VideoRecommendationSection({ answerBasedVideos, moduleVideos }: Props) {
  const useAnswer = answerBasedVideos.length > 0;
  const useModule = !useAnswer && moduleVideos.length > 0;

  return (
    <section
      className="relative rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 p-4 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/40 sm:p-6"
      aria-labelledby="section-recommended-videos-title"
    >
      <h2 id="section-recommended-videos-title" className="sr-only">
        推薦補強影片
      </h2>
      <SectionHeader personalized={useAnswer} />

      {useAnswer && (
        <ul className="mt-5 flex flex-col gap-4 sm:mt-6 sm:gap-5">
          {answerBasedVideos.map((v, i) => (
            <RecommendedVideoCard
              key={`${v.questionId}-${v.questionVideoId}`}
              item={v}
              index={i}
              isPriority={i === 0}
            />
          ))}
        </ul>
      )}

      {useModule && (
        <ul className="mt-5 flex flex-col gap-4 sm:mt-6 sm:gap-5">
          {moduleVideos.map((v, i) => (
            <ModuleVideoCard key={v.id} v={v} index={i} />
          ))}
        </ul>
      )}

      {!useAnswer && !useModule && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200/90 bg-slate-50/50 p-4 text-center text-sm text-slate-600 sm:mt-5">
          尚無可推薦的影片。建議至後台「題庫」為題目連結 YouTube，完成後即可依孩子作答產生個人化建議；或執行{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 shadow-sm">npm run seed:videos</code>{" "}
          建立模組影片庫。
        </p>
      )}
    </section>
  );
}
