"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ClipboardList, FileText, LineChart } from "lucide-react";
import { sectionShell } from "@/components/home/ctaStyles";

const STEPS = [
  {
    n: 1,
    title: "填寫資料",
    desc: "建立學生與家長基本資料",
    Icon: FileText,
  },
  {
    n: 2,
    title: "進行測驗",
    desc: "依序作答並標示作答信心",
    Icon: ClipboardList,
  },
  {
    n: 3,
    title: "取得報告",
    desc: "檢視分析與銜接建議",
    Icon: LineChart,
  },
] as const;

const sectionInView = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" };

function StepConnector() {
  return (
    <div
      className="flex h-full w-full min-w-0 items-center justify-center"
      aria-hidden
    >
      <div className="flex w-full min-w-0 max-w-12 items-center">
        <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-emerald-200/30 via-emerald-300/50 to-emerald-200/30" />
        <div className="mx-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200/70 bg-white shadow-sm">
          <ArrowRight className="h-3 w-3 text-emerald-600" />
        </div>
        <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-emerald-200/30 via-emerald-300/50 to-emerald-200/30" />
      </div>
    </div>
  );
}

function StepCard({
  item,
  index,
  reduceMotion,
}: {
  item: (typeof STEPS)[number];
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      className="relative h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={sectionInView}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reduceMotion ? undefined : { y: -3, scale: 1.01, transition: { duration: 0.2 } }
      }
    >
      <div className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-emerald-50/25 p-5 shadow-md shadow-slate-200/30 ring-1 ring-slate-100/50 transition duration-300 group-hover:border-emerald-300/45 group-hover:shadow-lg group-hover:shadow-emerald-200/25 md:p-6">
        <div
          className="pointer-events-none absolute -left-4 top-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-400/5 to-cyan-400/0 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-sm ring-1 ring-white/20">
            {item.n}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white/90 text-emerald-700 shadow-sm">
                <item.Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-bold text-slate-900 md:text-lg">{item.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:pl-11">
              {item.desc}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StepsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={sectionShell}
      aria-labelledby="steps-heading"
    >
      <div className="mx-auto max-w-5xl">
        <motion.header
          className="mb-6 space-y-2 text-center md:mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={sectionInView}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            id="steps-heading"
            className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
          >
            只要三個步驟
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-600">
            流程清楚、好上手，幾分鐘內即可完成診斷與回饋。
          </p>
        </motion.header>

        {/* 桌機：橫向 step flow + 連線 */}
        <div className="hidden items-stretch gap-2 md:grid md:grid-cols-[1fr_40px_1fr_40px_1fr] md:gap-0">
          {STEPS.map((item, index) => (
            <div key={item.n} className="contents">
              <div className="min-w-0 self-stretch">
                <StepCard item={item} index={index} reduceMotion={reduceMotion} />
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex h-full min-h-[8rem] items-center justify-center self-center py-1">
                  <StepConnector />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 手機：直向 stepper */}
        <ol className="space-y-0 md:hidden">
          {STEPS.map((item, index) => (
            <li key={item.n}>
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-emerald-50/20 p-4 shadow-md shadow-slate-200/30 ring-1 ring-slate-100/50"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={sectionInView}
                transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex gap-3">
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white shadow">
                      {item.n}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-700">
                        <item.Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
              {index < STEPS.length - 1 && (
                <div className="flex justify-center py-1.5" aria-hidden>
                  <div className="flex flex-col items-center text-emerald-500/50">
                    <div className="h-1 w-px bg-emerald-200/50" />
                    <ChevronDown className="h-4 w-4" />
                    <div className="h-1 w-px bg-emerald-200/50" />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
