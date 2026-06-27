'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardContent, Skeleton } from '@codentra/ui';
import {
  ContestStatusBadge,
  ContestTypeBadge,
  formatContestDate,
} from '@/features/contests/components/contest-badges';
import {
  useAdminContests,
  useDeleteContest,
} from '../hooks/use-admin-contests';

export function AdminContestList() {
  const [status, setStatus] = useState('');
  const { data, isLoading, error } = useAdminContests({
    status: status || undefined,
    limit: 50,
  });
  const deleteContest = useDeleteContest();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage contests</h1>
          <p className="mt-1 text-muted-foreground">
            Create, edit, and publish contests.
          </p>
        </div>
        <Link href="/admin/contests/new">
          <Button>New contest</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'DRAFT', 'SCHEDULED', 'LIVE', 'ENDED'].map((s) => (
          <Button
            key={s || 'all'}
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            onClick={() => setStatus(s)}
          >
            {s || 'All'}
          </Button>
        ))}
      </div>

      {isLoading && <Skeleton className="h-48 w-full" />}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load contests.
          </CardContent>
        </Card>
      )}

      {data?.items.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No contests found.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {data?.items.map((contest) => (
          <Card key={contest.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/contests/${contest.id}`}
                    className="font-medium hover:underline"
                  >
                    {contest.title}
                  </Link>
                  <ContestTypeBadge type={contest.type} />
                  <ContestStatusBadge status={contest.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatContestDate(contest.startTime)} ·{' '}
                  {contest.participantCount} participants
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/contests/${contest.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this contest?')) {
                      deleteContest.mutate(contest.id);
                    }
                  }}
                  disabled={deleteContest.isPending}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
