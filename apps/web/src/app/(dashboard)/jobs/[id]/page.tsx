import { JobDetailView } from '@/features/jobs/components/job-detail';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailView id={id} />;
}
