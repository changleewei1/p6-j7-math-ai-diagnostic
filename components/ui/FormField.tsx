import type { ReactNode } from "react";
import { FormError } from "@/components/ui/FormError";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  errorId: string;
  children: ReactNode;
  className?: string;
};

/**
 * 統一表單欄位外殼：label、必填/選填、內容、錯誤
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  error,
  errorId,
  children,
  className = "",
}: Props) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-x-1.5 text-xs font-medium text-slate-800">
        <span>{label}</span>
        {required && <span className="text-rose-600">必填</span>}
        {optional && <span className="text-slate-400">選填</span>}
      </label>
      <div className="mt-1">{children}</div>
      <FormError id={errorId}>{error}</FormError>
    </div>
  );
}
