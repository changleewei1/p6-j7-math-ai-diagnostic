import { QuizSessionClient } from "@/components/quiz/QuizSessionClient";

type Params = { sessionId: string };

export const metadata = {
  title: "測驗中｜小六升國一數學診斷",
  description: "15 題能力診斷。",
};

export default async function QuizPage({ params }: { params: Promise<Params> }) {
  const { sessionId } = await params;
  return <QuizSessionClient sessionId={sessionId} />;
}
