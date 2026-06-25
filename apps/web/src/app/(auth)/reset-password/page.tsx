import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthLayout
      title="Set new password"
      description="Choose a strong password for your account"
    >
      <ResetPasswordForm token={token ?? ''} />
    </AuthLayout>
  );
}
