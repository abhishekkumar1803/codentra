'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, Skeleton } from '@codentra/ui';
import { useContests } from '@/features/contests/hooks/use-contests';
import { ContestCard } from '@/features/contests/components/contest-card';
import { ContestFilters } from '@/features/contests/components/contest-filters';

export default function QuizzesPage() {
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useContests({
    type: 'QUIZ',
    status: status || undefined,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
        <p className="mt-1 text-muted-foreground">
          Timed knowledge quizzes — separate from coding contests.
        </p>
      </div>

      <ContestFilters
        type="QUIZ"
        status={status}
        onTypeChange={() => {}}
        onStatusChange={setStatus}
        hideTypeFilter
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
            Failed to load quizzes. Make sure the API is running.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data?.items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No quizzes found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing filters or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {data?.items.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.items.map((quiz) => (
            <ContestCard key={quiz.id} contest={quiz} hrefBase="/contests" />
          ))}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Looking for DSA or CP challenges?{' '}
        <Link href="/contests" className="text-primary underline">
          Browse contests
        </Link>
      </p>
    </div>
  );
}
