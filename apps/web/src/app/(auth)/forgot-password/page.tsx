import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      description="We'll send you instructions to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
