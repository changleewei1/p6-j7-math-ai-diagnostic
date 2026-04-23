"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, MapPinned, Sparkles, Zap } from "lucide-react";
import { sectionShell } from "@/components/home/ctaStyles";

const CARDS = [
  {
    step: 1,
    badge: "AI 快速診斷",
    title: "快速診斷",
    Icon: Zap,
    lines: [
      "15 題精選題目，快速掌握目前程度",
      "3～5 分鐘完成",
    ],
    accent: "from-emerald-500/10 via-teal-400/5 to-cyan-400/0",
  },
  {
    step: 2,
    badge: "弱點分析",
    title: "精準分析",
    Icon: BarChart3,
    lines: ["分析弱點、速度與作答信心"],
    accent: "from-teal-500/10 via-emerald-400/5 to-cyan-400/0",
  },
  {
    step: 3,
    badge: "銜接建議",
    title: "銜接規劃",
    Icon: MapPinned,
    lines: ["提供更適合的補強與銜接方向"],
    accent: "from-cyan-500/8 via-emerald-400/5 to-teal-400/0",
  },
] as const;

const sectionInView = { once: true, amount: 0.25, margin: "0px 0px -80px 0px" };

export function ValueSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="test-overview"
      className={`${sectionShell} scroll-mt-20 md:scroll-mt-24`}
      aria-labelledby="value-heading"
    >
      <div className="mx-auto max-w-5xl">
        <motion.header
          className="mb-6 space-y-2 text-center md:mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={sectionInView}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
            數位診斷 · 即時回饋
          </div>
          <h2
            id="value-heading"
            className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
          >
            三大價值
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
            以 AI 診斷流程為核心，讓學習者快速掌握起點、釐清弱點，並銜接下一步。
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-5">
          {CARDS.map((c, i) => (
            <motion.article
              key={c.title}
              className="group relative min-h-0"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={sectionInView}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -4, scale: 1.01, transition: { duration: 0.2 } }
              }
            >
              <div
                className="relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/40 p-5 shadow-md shadow-slate-200/30 ring-1 ring-slate-100/60 transition-shadow duration-300 group-hover:border-emerald-300/40 group-hover:shadow-lg group-hover:shadow-emerald-200/20 md:p-6"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${c.accent} opacity-80 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />

                <div className="relative flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/60 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    {c.badge}
                  </span>
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-emerald-100 bg-white text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100/50"
                    aria-label={`第 ${c.step} 項`}
                  >
                    {c.step}
                  </span>
                </div>

                <div className="relative mt-4 flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/80 text-emerald-700 shadow-sm ring-1 ring-white/50 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg] group-hover:shadow-md group-hover:shadow-emerald-200/30">
                    <c.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-tight text-slate-900 md:text-lg">
                      {c.title}
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
                      {c.lines.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 before:mt-1.5 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-emerald-400/80 before:content-['']"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
