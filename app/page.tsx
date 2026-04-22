import type { Metadata } from "next";
import { CtaSection } from "@/components/home/CtaSection";
import { FaqSection } from "@/components/home/FaqSection";
import { Footer } from "@/components/home/Footer";
import { Hero } from "@/components/home/Hero";
import { MobileStickyCTA } from "@/components/home/MobileStickyCTA";
import { Navbar } from "@/components/home/Navbar";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ResultSection } from "@/components/home/ResultSection";
import { SolutionSection } from "@/components/home/SolutionSection";
import { StepsSection } from "@/components/home/StepsSection";
import { ValueSection } from "@/components/home/ValueSection";

export const metadata: Metadata = {
  title: "名貫補習班",
  description:
    "小六升國一數學 AI 診斷系統：15 題快速測驗，掌握弱點與銜接準備度，由名貫補習班教學團隊設計。",
};

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/90 via-white to-slate-50/80 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 pb-24 md:pb-0">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ValueSection />
        <StepsSection />
        <ResultSection />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
