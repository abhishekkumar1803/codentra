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
import { SubscriptionStatus } from '@/features/subscription/components/subscription-status';
import { useSubscription } from '@/features/subscription/hooks/use-subscription';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUserStats } from '@/features/users/hooks/use-users';

function StatCard({
  label,
  value,
  subtitle,
  loading,
  prefix,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  prefix?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <p className="text-2xl font-bold">
              {prefix}
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs font-medium text-primary">
                {subtitle}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hasSubscription =
    subscription?.status === 'ACTIVE' || subscription?.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {userLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Welcome back, ${firstName}`
          )}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your hub for contests, jobs, and career growth.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="DSA Rating"
          value={stats?.dsaRating ?? 1200}
          subtitle={stats?.dsaTitle}
          loading={statsLoading}
        />
        <StatCard
          label="CP Rating"
          value={stats?.cpRating ?? 1200}
          subtitle={stats?.cpTitle}
          loading={statsLoading}
        />
        <StatCard
          label="Global rank"
          value={stats?.globalRank ?? '—'}
          loading={statsLoading}
          prefix={stats?.globalRank ? '#' : ''}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {subLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasSubscription ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your membership is active
                  </p>
                  <SubscriptionStatus subscription={subscription} />
                  <Link href="/dashboard/settings/subscription">
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to unlock contests, leaderboards, and premium
                    features.
                  </p>
                  <Link href="/dashboard/settings/subscription">
                    <Button size="sm">Subscribe now</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Contests, jobs, and leaderboards are live — explore from the
              sidebar.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/contests">
                <Button variant="outline" size="sm">
                  Contests
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" size="sm">
                  Jobs
                </Button>
              </Link>
              <Link href="/leaderboards">
                <Button variant="outline" size="sm">
                  Leaderboards
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
