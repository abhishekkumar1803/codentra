import { SystemDesignSubmitView } from '@/features/system-design/components/system-design-submit';

export default async function SystemDesignSubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SystemDesignSubmitView slug={slug} />;
}
