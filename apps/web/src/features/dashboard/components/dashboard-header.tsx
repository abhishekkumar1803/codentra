'use client';

import { Button } from '@codentra/ui';
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: user } = useAuth();
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </Button>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Welcome back, {user?.name ?? 'Developer'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
