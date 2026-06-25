'use client';

import { useState } from 'react';
import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useContests } from '@/features/contests/hooks/use-contests';
import { ContestCard } from '@/features/contests/components/contest-card';
import { ContestFilters } from '@/features/contests/components/contest-filters';

export default function ContestsPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useContests({
    type: type || undefined,
    excludeType: type ? undefined : 'QUIZ',
    status: status || undefined,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
        <p className="mt-1 text-muted-foreground">
          Compete in DSA, CP, and system design challenges.
        </p>
      </div>

      <ContestFilters
        type={type}
        status={status}
        onTypeChange={setType}
        onStatusChange={setStatus}
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load contests. Make sure the API is running.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data?.items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No contests found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing filters or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {data?.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.items.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
