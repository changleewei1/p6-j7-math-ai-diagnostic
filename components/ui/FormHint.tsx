import type { ReactNode } from "react";

type Props = {
  id?: string;
  children: ReactNode;
  className?: string;
};

/**
 * 欄位輔助說明（不具錯誤語意）
 */
export function FormHint({ id, children, className = "" }: Props) {
  if (children == null || children === "") return null;
  return (
    <p id={id} className={`mt-1 text-xs text-slate-500 ${className}`.trim()}>
      {children}
    </p>
  );
}
