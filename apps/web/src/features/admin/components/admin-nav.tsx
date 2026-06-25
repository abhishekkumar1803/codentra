'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@codentra/ui';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
  { href: '/admin/payments', label: 'Payments', icon: '💰' },
  { href: '/admin/contests', label: 'Contests', icon: '🏆' },
  { href: '/admin/jobs', label: 'Jobs', icon: '💼' },
  { href: '/admin/activity-logs', label: 'Activity Logs', icon: '📋' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b pb-4">
      {adminNavItems.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
