import { ReportView } from "@/components/report/ReportView";

type Params = { sessionId: string };

export const metadata = {
  title: "診斷報告",
  description: "小六升國一數學診斷報告。",
};

export default async function ReportPage({ params }: { params: Promise<Params> }) {
  const { sessionId } = await params;
  return <ReportView sessionId={sessionId} />;
}
