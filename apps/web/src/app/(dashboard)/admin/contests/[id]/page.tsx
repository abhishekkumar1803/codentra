import { AdminContestForm } from '@/features/admin/components/admin-contest-form';

export default async function AdminEditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminContestForm contestId={id} />;
}
