import { AuthLayout } from '@/features/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Get started"
      description="Create your free Codentra account"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
