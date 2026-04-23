"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Play,
  Sparkles,
  Timer,
} from "lucide-react";
import type { ReportRecommendedVideoItem } from "@/types/api";
import { cn } from "@/lib/utils/cn";

const FALLBACK_TITLES = ["推薦複習影片", "補強觀念影片", "對應弱點複習影片"] as const;

const HINT_FOLLOW: Record<ReportRecommendedVideoItem["reasonType"], string> = {
  wrong_answer: "建議先觀看這支影片，再回頭比對本次錯處、重新建立觀念。",
  low_confidence: "這類題型若能先釐清觀念，後續銜接與變化題會更穩。",
  slow_response: "可先透過影片加快理解步調，再安排下一輪練習。",
};

const BADGE: Record<
  ReportRecommendedVideoItem["reasonType"],
  { label: string; className: string; icon: typeof AlertCircle }
> = {
  wrong_answer: {
    label: "優先補強",
    className: "border-rose-200/90 bg-rose-50/95 text-rose-900 ring-1 ring-rose-100",
    icon: AlertCircle,
  },
  low_confidence: {
    label: "觀念不穩",
    className: "border-amber-200/90 bg-amber-50/95 text-amber-950 ring-1 ring-amber-100",
    icon: Sparkles,
  },
  slow_response: {
    label: "建議熟練",
    className: "border-sky-200/90 bg-sky-50/95 text-sky-950 ring-1 ring-sky-100",
    icon: Timer,
  },
};

function getDisplayTitle(title: string | null, index: number): string {
  if (title?.trim()) {
    return title.trim();
  }
  return FALLBACK_TITLES[index % FALLBACK_TITLES.length] ?? "推薦複習影片";
}

type Props = {
  item: ReportRecommendedVideoItem;
  index: number;
  isPriority: boolean;
};

export function RecommendedVideoCard({ item, index, isPriority }: Props) {
  const b = BADGE[item.reasonType];
  const Icon = b.icon;
  const displayTitle = getDisplayTitle(item.title, index);
  const followHint = HINT_FOLLOW[item.reasonType];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white transition-[box-shadow,transform] duration-200",
        isPriority
          ? "border-emerald-300/80 shadow-md shadow-emerald-900/5 ring-2 ring-emerald-200/50 sm:scale-[1.01]"
          : "border-slate-200/90 shadow-sm hover:shadow-md hover:shadow-slate-900/5",
      )}
    >
      {isPriority && (
        <div className="border-b border-amber-200/70 bg-gradient-to-r from-amber-50/95 to-amber-100/50 px-4 py-2.5 text-center text-sm font-bold text-amber-950 sm:text-left">
          <span className="mr-1" aria-hidden>
            ★
          </span>
          優先觀看：建議從本支影片開始
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-2 sm:items-center">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-sm",
                b.className,
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
              {b.label}
            </span>
            <span
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/90 text-xs font-bold tabular-nums text-slate-600"
              title="建議觀看順序"
              aria-label={`第 ${index + 1} 支推薦`}
            >
              {index + 1}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{displayTitle}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{item.reasonText}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{followHint}</p>
          </div>
        </div>

        <div className="flex shrink-0 border-t border-slate-100 bg-slate-50/30 p-4 sm:w-52 sm:border-l sm:border-t-0 sm:border-slate-100 sm:bg-gradient-to-b sm:from-white sm:to-slate-50/40 sm:p-5 sm:pl-4">
          <a
            href={item.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex w-full min-h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-xl px-4 text-sm font-bold shadow-sm transition",
              "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white",
              "hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md",
              "active:scale-[0.98] sm:min-h-[3.5rem]",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Play className="h-5 w-5 fill-current" fill="currentColor" aria-hidden />
            </span>
            立即觀看
          </a>
        </div>
      </div>
    </motion.li>
  );
}
