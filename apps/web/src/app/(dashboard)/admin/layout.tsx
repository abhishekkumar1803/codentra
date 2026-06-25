import { AdminGuard } from '@/features/admin/components/admin-guard';
import { AdminNav } from '@/features/admin/components/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <AdminNav />
        {children}
      </div>
    </AdminGuard>
  );
}
