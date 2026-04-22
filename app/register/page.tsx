import { RegisterForm } from "@/components/register/RegisterForm";

export const metadata = {
  title: "填寫資料｜小六升國一數學診斷",
  description: "登記學生與家長聯絡方式後開始 15 題測驗。",
};

export default function RegisterPage() {
  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50/90 to-white text-slate-900">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 sm:py-8">
        <h1 className="text-center text-lg font-bold text-slate-900 sm:text-xl">測前登記</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          請先填寫學生與家長資料，完成後將開始數學能力診斷測驗。
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">登記後即建立專屬測驗，建議在 5 分鐘內完成本頁填寫。</p>
        <div className="mt-5">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
