import { ProblemSolverView } from '@/features/problems/components/problem-solver';

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string; problemSlug: string }>;
}) {
  const { slug, problemSlug } = await params;
  return (
    <ProblemSolverView contestSlug={slug} problemSlug={problemSlug} />
  );
}
