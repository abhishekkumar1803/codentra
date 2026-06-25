'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@codentra/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/contests', label: 'Contests', icon: '🏆' },
  { href: '/quizzes', label: 'Quizzes', icon: '⚡' },
  { href: '/leaderboards', label: 'Leaderboards', icon: '📊' },
  { href: '/jobs', label: 'Jobs', icon: '💼' },
  { href: '/referrals', label: 'Referrals', icon: '🤝' },
  { href: '/services', label: 'Services', icon: '⭐' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/settings/subscription', label: 'Subscription', icon: '💳' },
];

const roleNavItems = {
  mentor: { href: '/mentor', label: 'Mentor', icon: '🎓' },
  employer: { href: '/employer', label: 'Employer', icon: '🏢' },
  admin: { href: '/admin', label: 'Admin', icon: '🛠️' },
};

export function DashboardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: user } = useAuth();

  const extraItems = [];
  if (user?.role === 'MENTOR' || user?.role === 'ADMIN') {
    extraItems.push(roleNavItems.mentor);
  }
  if (user?.role === 'ADMIN') {
    extraItems.push(roleNavItems.employer, roleNavItems.admin);
  }

  const items = [...navItems, ...extraItems];

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-bold">
            Codentra
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === '/contests' &&
                pathname.startsWith('/contests') &&
                !pathname.includes('/quiz')) ||
              (item.href === '/quizzes' &&
                (pathname.startsWith('/quizzes') ||
                  (pathname.includes('/quiz') &&
                    pathname.startsWith('/contests')))) ||
              (item.href === '/leaderboards' &&
                pathname.startsWith('/leaderboards')) ||
              (item.href === '/jobs' && pathname.startsWith('/jobs')) ||
              (item.href === '/referrals' &&
                pathname.startsWith('/referrals')) ||
              (item.href === '/services' &&
                pathname.startsWith('/services')) ||
              (item.href === '/mentor' && pathname.startsWith('/mentor')) ||
              (item.href === '/employer' &&
                pathname.startsWith('/employer')) ||
              (item.href === '/admin' && pathname.startsWith('/admin')) ||
              (item.href !== '/dashboard' &&
                item.href !== '/contests' &&
                item.href !== '/quizzes' &&
                item.href !== '/leaderboards' &&
                item.href !== '/jobs' &&
                item.href !== '/referrals' &&
                item.href !== '/services' &&
                item.href !== '/mentor' &&
                item.href !== '/employer' &&
                item.href !== '/admin' &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden>↩</span>
            Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}
