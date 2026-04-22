import type { ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
};

/**
 * 欄位錯誤文字（可透過 id 以 aria-describedby 關聯）
 */
export function FormError({ id, children, className = "" }: Props) {
  if (children == null || children === "") return null;
  return (
    <p id={id} role="alert" className={`mt-1.5 text-xs text-rose-600 ${className}`.trim()}>
      {children}
    </p>
  );
}
