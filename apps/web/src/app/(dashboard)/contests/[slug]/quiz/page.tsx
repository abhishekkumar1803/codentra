import { QuizTakeView } from '@/features/quizzes/components/quiz-take';

export default async function QuizTakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuizTakeView slug={slug} />;
}
