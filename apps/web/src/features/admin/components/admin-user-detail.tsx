'use client';

import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@codentra/ui';
import {
  useAdminUser,
  useUpdateAdminUser,
} from '@/features/admin/hooks/use-admin';

export function AdminUserDetailView({ id }: { id: string }) {
  const { data: user, isLoading } = useAdminUser(id);
  const updateUser = useUpdateAdminUser();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          User not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={updateUser.isPending || user.role === 'ADMIN'}
              onClick={() =>
                updateUser.mutate({
                  id: user.id,
                  payload: {
                    role: user.role === 'USER' ? 'MENTOR' : 'USER',
                  },
                })
              }
            >
              Toggle role (USER ↔ MENTOR)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={updateUser.isPending}
              onClick={() =>
                updateUser.mutate({
                  id: user.id,
                  payload: { isActive: !user.isActive },
                })
              }
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">
                {user.isActive ? 'Active' : 'Inactive'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Subscription</dt>
              <dd className="font-medium">
                {user.subscription?.status ?? 'None'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-IN')}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {!user.payments.length ? (
            <p className="text-sm text-muted-foreground">No payments.</p>
          ) : (
            <ul className="divide-y text-sm">
              {user.payments.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>
                    {p.type} · {p.status}
                  </span>
                  <span>₹{(p.amount / 100).toFixed(0)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
