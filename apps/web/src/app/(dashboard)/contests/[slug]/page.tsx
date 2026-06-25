import { ContestDetailView } from '@/features/contests/components/contest-detail';

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContestDetailView slug={slug} />;
}
