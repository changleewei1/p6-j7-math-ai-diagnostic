"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { FormHint } from "@/components/ui/FormHint";
import { SectionCard } from "@/components/ui/SectionCard";
import { registerBodySchema, type RegisterBodyInput } from "@/lib/validations/register";
import type { RegisterApiResponse } from "@/types/api";

const PREFIX = "register";

/** 驗證失敗時，依此順序尋找第一個錯誤欄位以 focus / 捲動 */
const ORDERED_FIELDS: (keyof RegisterBodyInput)[] = [
  "studentName",
  "school",
  "grade",
  "parentName",
  "parentPhone",
  "lineId",
  "email",
  "marketingOptIn",
  "agreePrivacy",
];

function firstErrorFieldName(
  errors: Partial<Record<keyof RegisterBodyInput, { message?: string } | undefined>>,
): keyof RegisterBodyInput | undefined {
  for (const name of ORDERED_FIELDS) {
    if (errors[name]) return name;
  }
  return undefined;
}

function getInputId(name: string) {
  return `${PREFIX}-${name}`;
}
function getErrorId(name: string) {
  return `${PREFIX}-error-${name}`;
}
function getHintId(name: string) {
  return `${PREFIX}-hint-${name}`;
}

function describeBy(errorId: string | null, showHint: boolean, hintId: string) {
  if (errorId) return errorId;
  if (showHint) return hintId;
  return undefined;
}

export function RegisterForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** 併發第二次 submit 時回傳同一 Promise，讓 RHF 的 isSubmitting 在整段請求期間保持為 true、並避免雙重 POST */
  const submitRunRef = useRef<Promise<void> | null>(null);

  const form = useForm<RegisterBodyInput>({
    resolver: zodResolver(registerBodySchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      studentName: "",
      school: "",
      grade: "小六",
      parentName: "",
      parentPhone: "",
      lineId: "",
      email: "",
      marketingOptIn: false,
      agreePrivacy: false,
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = form;

  const inputBase =
    "mt-0 block w-full min-h-11 rounded-xl border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 sm:text-sm focus:outline-none focus:ring-2";
  const inputNormal = `${inputBase} border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20`;
  const inputError = `${inputBase} border-rose-500 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200`;

  const onInvalid = (formErrors: FieldErrors<RegisterBodyInput>) => {
    const name = firstErrorFieldName(
      formErrors as Partial<Record<keyof RegisterBodyInput, { message?: string }>>,
    );
    if (!name) return;
    setFocus(name);
    requestAnimationFrame(() => {
      if (name === "agreePrivacy" || name === "marketingOptIn") {
        const block = document.getElementById("register-consent-block");
        block?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const el = document.getElementById(getInputId(String(name)));
      const scrollTarget = el?.closest("[data-form-field]") ?? el;
      scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  function onSubmit(data: RegisterBodyInput) {
    if (submitRunRef.current) {
      return submitRunRef.current;
    }
    const run = (async () => {
      setSubmitError(null);
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = (await res.json()) as RegisterApiResponse;
        if (!res.ok || !("success" in json) || !json.success) {
          const fromServer =
            json && typeof json === "object" && "message" in json
              ? (json as { message?: string }).message?.trim()
              : undefined;
          const msg =
            fromServer && fromServer.length > 0
              ? fromServer
              : res.status >= 500
                ? "建立測驗失敗，請稍後再試"
                : `無法完成登記（${res.status}）`;
          setSubmitError(msg);
          return;
        }
        const sid = json.sessionId;
        if (typeof sid !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sid)) {
          setSubmitError("已儲存資料，但未取得有效的測驗編號。請重新整理頁面或稍後再試；若重複出現請聯絡技術人員。");
          return;
        }
        // 整頁導向，避免在部分環境下 client-side navigation 未載入測驗 chunk 導致停在原頁
        window.location.assign(`/quiz/${sid}`);
      } catch {
        setSubmitError("無法連線到伺服器，請檢查網路後再試。");
      } finally {
        submitRunRef.current = null;
      }
    })();
    submitRunRef.current = run;
    return run;
  }

  const field = (name: keyof RegisterBodyInput) => {
    const err = errors[name]?.message;
    return {
      hasError: Boolean(err),
      message: err as string | undefined,
    };
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
      aria-busy={isSubmitting}
    >
      {submitError && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-2.5 text-sm text-rose-900"
          role="alert"
          data-api-error
        >
          {submitError}
        </div>
      )}

      <SectionCard>
        <p className="text-sm leading-relaxed text-slate-600">
          有標示
          <span className="font-medium text-rose-600">必填</span> 的欄位需完成，送出後即建立專屬測驗工作階段。
        </p>
        <h2 className="mt-4 text-sm font-semibold text-slate-800">學生</h2>
        <div className="mt-3 space-y-4">
          <div data-form-field>
            <FormField
              label="學生姓名"
              htmlFor={getInputId("studentName")}
              required
              errorId={getErrorId("studentName")}
              error={field("studentName").message}
            >
              <input
                id={getInputId("studentName")}
                type="text"
                autoComplete="name"
                inputMode="text"
                className={field("studentName").hasError ? inputError : inputNormal}
                aria-invalid={field("studentName").hasError}
                aria-describedby={describeBy(
                  field("studentName").hasError ? getErrorId("studentName") : null,
                  true,
                  getHintId("studentName"),
                )}
                {...register("studentName")}
              />
              <FormHint id={getHintId("studentName")}>與學生證或學校登記名稱一致尤佳。</FormHint>
            </FormField>
          </div>

          <div data-form-field>
            <FormField
              label="就讀國小"
              htmlFor={getInputId("school")}
              optional
              errorId={getErrorId("school")}
              error={field("school").message}
            >
              <input
                id={getInputId("school")}
                type="text"
                className={field("school").hasError ? inputError : inputNormal}
                placeholder="例：臺北市大安國小"
                autoComplete="organization"
                aria-invalid={field("school").hasError}
                aria-describedby={
                  field("school").hasError
                    ? getErrorId("school")
                    : getHintId("school")
                }
                {...register("school")}
              />
              <FormHint id={getHintId("school")}>未填寫不影響測驗，僅供服務參考。</FormHint>
            </FormField>
          </div>

          <div data-form-field>
            <FormField
              label="年級"
              htmlFor={getInputId("grade")}
              errorId={getErrorId("grade")}
              error={field("grade").message}
            >
              <select
                id={getInputId("grade")}
                className={field("grade").hasError ? inputError : inputNormal}
                aria-invalid={field("grade").hasError}
                aria-describedby={
                  field("grade").hasError ? getErrorId("grade") : getHintId("grade")
                }
                {...register("grade")}
              >
                <option value="小六">小六</option>
                <option value="小五">小五</option>
                <option value="小四">小四</option>
                <option value="其他">其他</option>
              </select>
              <FormHint id={getHintId("grade")}>多數受測者為小六學生；選「其他」時仍可繼續測驗。</FormHint>
            </FormField>
          </div>
        </div>

        <h2 id="parent-section" className="mt-6 scroll-mt-24 text-sm font-semibold text-slate-800">
          家長
        </h2>
        <div className="mt-3 space-y-4">
          <div data-form-field>
            <FormField
              label="家長姓名"
              htmlFor={getInputId("parentName")}
              required
              errorId={getErrorId("parentName")}
              error={field("parentName").message}
            >
              <input
                id={getInputId("parentName")}
                type="text"
                autoComplete="name"
                className={field("parentName").hasError ? inputError : inputNormal}
                aria-invalid={field("parentName").hasError}
                aria-describedby={describeBy(
                  field("parentName").hasError ? getErrorId("parentName") : null,
                  true,
                  getHintId("parentName"),
                )}
                {...register("parentName")}
              />
              <FormHint id={getHintId("parentName")}>用於學情與測驗聯絡說明。</FormHint>
            </FormField>
          </div>

          <div data-form-field>
            <FormField
              label="家長手機"
              htmlFor={getInputId("parentPhone")}
              required
              errorId={getErrorId("parentPhone")}
              error={field("parentPhone").message}
            >
              <input
                id={getInputId("parentPhone")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={field("parentPhone").hasError ? inputError : inputNormal}
                placeholder="例：0912345678"
                autoCorrect="off"
                aria-invalid={field("parentPhone").hasError}
                aria-describedby={describeBy(
                  field("parentPhone").hasError ? getErrorId("parentPhone") : null,
                  true,
                  getHintId("parentPhone"),
                )}
                {...register("parentPhone")}
              />
              <FormHint id={getHintId("parentPhone")}>至少 8 碼數字；可含區碼、括號、空格等。</FormHint>
            </FormField>
          </div>

          <div data-form-field>
            <FormField
              label="家長 LINE ID"
              htmlFor={getInputId("lineId")}
              optional
              errorId={getErrorId("lineId")}
              error={field("lineId").message}
            >
              <input
                id={getInputId("lineId")}
                type="text"
                className={field("lineId").hasError ? inputError : inputNormal}
                placeholder="未使用可略過"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                inputMode="text"
                aria-invalid={field("lineId").hasError}
                aria-describedby={describeBy(
                  field("lineId").hasError ? getErrorId("lineId") : null,
                  true,
                  getHintId("lineId"),
                )}
                {...register("lineId")}
              />
              <FormHint id={getHintId("lineId")}>用於之後學情通知（選填）。</FormHint>
            </FormField>
          </div>

          <div data-form-field>
            <FormField
              label="家長 Email"
              htmlFor={getInputId("email")}
              optional
              errorId={getErrorId("email")}
              error={field("email").message}
            >
              <input
                id={getInputId("email")}
                type="email"
                inputMode="email"
                className={field("email").hasError ? inputError : inputNormal}
                placeholder="未填寫不寄送"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                aria-invalid={field("email").hasError}
                aria-describedby={describeBy(
                  field("email").hasError ? getErrorId("email") : null,
                  true,
                  getHintId("email"),
                )}
                {...register("email")}
              />
              <FormHint id={getHintId("email")}>有填寫則以 Email 格式驗證；留空則不寄至信箱。</FormHint>
            </FormField>
          </div>
        </div>

        <div
          id="register-consent-block"
          className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4"
        >
          <p className="text-xs font-medium text-slate-600">授權與同意</p>
          <div className="flex items-start gap-3">
            <input
              id={getInputId("marketingOptIn")}
              type="checkbox"
              className="mt-1.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              aria-describedby={getHintId("marketingOptIn")}
              {...register("marketingOptIn")}
            />
            <label
              htmlFor={getInputId("marketingOptIn")}
              className="min-h-11 flex-1 cursor-pointer text-sm leading-relaxed text-slate-700"
            >
              願意接收診斷報告與課程相關建議（可於日後取消）
            </label>
          </div>
          <FormHint id={getHintId("marketingOptIn")} className="!mt-0 pl-8">
            不勾選僅影響行銷訊息，不影響測驗權益。
          </FormHint>

          <div
            className={`flex items-start gap-3 rounded-lg p-0.5 ${
              field("agreePrivacy").hasError ? "ring-2 ring-rose-300 ring-offset-1" : ""
            }`}
            data-form-field
          >
            <input
              id={getInputId("agreePrivacy")}
              type="checkbox"
              className="mt-1.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              aria-invalid={field("agreePrivacy").hasError}
              aria-describedby={
                field("agreePrivacy").hasError
                  ? getErrorId("agreePrivacy")
                  : getHintId("agreePrivacy")
              }
              {...register("agreePrivacy")}
            />
            <label
              htmlFor={getInputId("agreePrivacy")}
              className="min-h-11 flex-1 cursor-pointer text-sm font-medium leading-relaxed text-slate-800"
            >
              我已閱讀並同意辦方蒐集、處理前開聯絡與學情分析所需之個人資料
              <span className="ml-0.5 text-rose-600">（必填）</span>
            </label>
          </div>
          {field("agreePrivacy").message && (
            <p
              id={getErrorId("agreePrivacy")}
              className="pl-8 text-sm text-rose-600"
              role="alert"
            >
              {field("agreePrivacy").message}
            </p>
          )}
          <FormHint id={getHintId("agreePrivacy")} className="!mt-0 pl-8 text-slate-600">
            未勾選無法儲存資料並建立測驗。
          </FormHint>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="order-2 min-h-11 text-center text-sm font-medium text-emerald-800 underline sm:order-1"
          >
            返回首頁
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="order-1 min-h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md transition enabled:hover:from-emerald-700 enabled:hover:to-teal-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-48"
          >
            {isSubmitting ? "建立中…" : "建立測驗並前往"}
          </button>
        </div>
      </SectionCard>
    </form>
  );
}
