import Link from "next/link";
import { CTA_OUTLINE, CTA_PRIMARY } from "@/components/home/ctaStyles";

export function Hero() {
  return (
    <section
      className="px-4 pt-4 pb-8 md:px-8 md:py-10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <div className="space-y-3 md:space-y-4">
          <h1
            id="hero-heading"
            className="text-balance text-2xl font-bold leading-tight tracking-tight text-slate-900 line-clamp-2 sm:text-3xl md:text-4xl md:leading-tight"
          >
            精準診斷學習落點，穩定銜接國一數學
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-snug text-slate-600 line-clamp-2">
            15 題快速測驗，立即掌握孩子數學程度、弱點與升國一準備度
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:justify-center md:gap-4">
          <Link href="/register" className={CTA_PRIMARY}>
            立即開始免費診斷
          </Link>
          <a href="#test-overview" className={CTA_OUTLINE}>
            向下滑，先看介紹
          </a>
        </div>
        <ul className="mx-auto w-max max-w-lg space-y-2 text-left text-sm text-slate-600">
          <li className="flex items-start gap-2.5">
            <span className="shrink-0 text-emerald-600" aria-hidden>
              ✔
            </span>
            <span>名貫補習班教學團隊設計</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="shrink-0 text-emerald-600" aria-hidden>
              ✔
            </span>
            <span>結合 AI 分析與教學經驗</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="shrink-0 text-emerald-600" aria-hidden>
              ✔
            </span>
            <span>已協助上百位學生銜接國一</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
