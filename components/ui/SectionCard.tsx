import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

/**
 * 通用卡片容器（白底、圓角、陰影）
 */
export function SectionCard({ children, className = "", title, subtitle }: Props) {
  return (
    <section
      className={`rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {title && (
        <header className="mb-3">
          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
