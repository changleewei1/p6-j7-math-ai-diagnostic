"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { SectionCard } from "@/components/ui/SectionCard";
import { INTERESTED_COURSE_OPTIONS, type InterestedCourseOption } from "@/lib/constants/booking";
import {
  bookingFormClientSchema,
  type BookingBodyInput,
  type BookingFormClientInput,
} from "@/lib/validations/booking";
import type { BookingApiResponse } from "@/types/api";

const PREFIX = "booking";

const ORDERED_FIELDS: (keyof BookingFormClientInput)[] = [
  "studentName",
  "parentName",
  "phone",
  "interestedCourse",
  "note",
  "willingToBeContacted",
  "agreeDataContact",
];

function firstErrorFieldName(
  errors: Partial<Record<keyof BookingFormClientInput, { message?: string } | undefined>>,
): keyof BookingFormClientInput | undefined {
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

type Props = {
  initialSessionId?: string | null;
  defaultStudentName?: string;
  defaultInterestedCourse?: InterestedCourseOption;
  /** 主送出按鈕文案 */
  submitLabel?: string;
  onSuccess: (bookingId: string) => void;
};

export function BookingForm({
  initialSessionId,
  defaultStudentName = "",
  defaultInterestedCourse = "想先了解適合的班別",
  submitLabel = "👉 立即預約免費試聽",
  onSuccess,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BookingFormClientInput>({
    resolver: zodResolver(bookingFormClientSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      studentName: defaultStudentName,
      parentName: "",
      phone: "",
      interestedCourse: defaultInterestedCourse,
      note: "",
      willingToBeContacted: true,
      agreeDataContact: false,
    },
  });

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (defaultStudentName.trim()) {
      setValue("studentName", defaultStudentName);
    }
  }, [defaultStudentName, setValue]);

  useEffect(() => {
    setValue("interestedCourse", defaultInterestedCourse);
  }, [defaultInterestedCourse, setValue]);

  const inputBase =
    "mt-0 block w-full min-h-11 rounded-xl border bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 sm:text-sm focus:outline-none focus:ring-2";
  const inputNormal = `${inputBase} border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20`;
  const inputError = `${inputBase} border-rose-500 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200`;

  const onInvalid = (formErrors: FieldErrors<BookingFormClientInput>) => {
    const name = firstErrorFieldName(
      formErrors as Partial<Record<keyof BookingFormClientInput, { message?: string }>>,
    );
    if (!name) return;
    setFocus(name);
    requestAnimationFrame(() => {
      if (name === "agreeDataContact" || name === "willingToBeContacted") {
        const block = document.getElementById("booking-consent-block");
        block?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const el = document.getElementById(getInputId(String(name)));
      const scrollTarget = el?.closest("[data-form-field]") ?? el;
      scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  async function onSubmit(data: BookingFormClientInput) {
    setSubmitError(null);
    const payload: BookingBodyInput = {
      ...data,
      sessionId: initialSessionId ?? null,
    };
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as BookingApiResponse;
      if (!res.ok || !json.success) {
        const fromServer = "message" in json && json.message ? json.message : "";
        setSubmitError(
          fromServer || (res.status >= 500 ? "送出失敗，請稍後再試" : `送出失敗（${res.status}）`),
        );
        return;
      }
      onSuccess(json.bookingId);
    } catch {
      setSubmitError("無法連線到伺服器，請檢查網路後再試。");
    }
  }

  const field = (name: keyof BookingFormClientInput) => {
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
        <h2 className="text-sm font-semibold text-slate-800">預約資料</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          有標示<span className="font-medium text-rose-600">必填</span>的欄位需完成。送出後專人將與您聯繫。
        </p>
        <div className="mt-4 space-y-4">
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
                className={field("studentName").hasError ? inputError : inputNormal}
                aria-invalid={field("studentName").hasError}
                aria-describedby={
                  field("studentName").hasError ? getErrorId("studentName") : undefined
                }
                {...register("studentName")}
              />
            </FormField>
          </div>
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
                aria-describedby={
                  field("parentName").hasError ? getErrorId("parentName") : undefined
                }
                {...register("parentName")}
              />
            </FormField>
          </div>
          <div data-form-field>
            <FormField
              label="聯絡電話"
              htmlFor={getInputId("phone")}
              required
              errorId={getErrorId("phone")}
              error={field("phone").message}
            >
              <input
                id={getInputId("phone")}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                className={field("phone").hasError ? inputError : inputNormal}
                placeholder="行動市話均可"
                aria-invalid={field("phone").hasError}
                aria-describedby={field("phone").hasError ? getErrorId("phone") : undefined}
                {...register("phone")}
              />
            </FormField>
          </div>
          <div data-form-field>
            <FormField
              label="想了解的課程"
              htmlFor={getInputId("interestedCourse")}
              required
              errorId={getErrorId("interestedCourse")}
              error={field("interestedCourse").message}
            >
              <select
                id={getInputId("interestedCourse")}
                className={field("interestedCourse").hasError ? inputError : inputNormal}
                aria-invalid={field("interestedCourse").hasError}
                aria-describedby={
                  field("interestedCourse").hasError ? getErrorId("interestedCourse") : undefined
                }
                {...register("interestedCourse")}
              >
                {INTERESTED_COURSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div data-form-field>
            <FormField
              label="備註"
              htmlFor={getInputId("note")}
              optional
              errorId={getErrorId("note")}
              error={field("note").message}
            >
              <textarea
                id={getInputId("note")}
                rows={3}
                className={`${field("note").hasError ? inputError : inputNormal} min-h-[5.5rem] resize-y py-2.5`}
                placeholder="可填寫方便聯絡的時段、想問的內容等"
                aria-invalid={field("note").hasError}
                aria-describedby={field("note").hasError ? getErrorId("note") : undefined}
                {...register("note")}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div id="booking-consent-block" className="space-y-3">
          <div data-form-field className="flex gap-2.5">
            <input
              id={getInputId("willingToBeContacted")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              {...register("willingToBeContacted")}
            />
            <label
              htmlFor={getInputId("willingToBeContacted")}
              className="text-sm leading-snug text-slate-700"
            >
              我願意接受補習班以電話或 LINE 與我聯繫，確認試聽與班別
            </label>
          </div>
          <div data-form-field className="flex gap-2.5">
            <input
              id={getInputId("agreeDataContact")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              {...register("agreeDataContact")}
            />
            <label
              htmlFor={getInputId("agreeDataContact")}
              className="text-sm leading-snug text-slate-700"
            >
              我同意提供上述資料，供補習班聯繫我並說明課程
              <span className="text-rose-600">（必填）</span>
            </label>
          </div>
          {field("agreeDataContact").message && (
            <p id={getErrorId("agreeDataContact")} className="text-xs text-rose-600">
              {field("agreeDataContact").message}
            </p>
          )}
        </div>
      </SectionCard>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition enabled:hover:from-emerald-700 enabled:hover:to-teal-700 disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "送出中…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
