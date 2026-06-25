import { QuizResultsView } from '@/features/quizzes/components/quiz-results';

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuizResultsView slug={slug} />;
}
