'use client';

import Link from 'next/link';
import type { ContestListItem } from '@codentra/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@codentra/ui';
import {
  ContestStatusBadge,
  ContestTypeBadge,
  formatContestDate,
} from './contest-badges';

export function ContestCard({
  contest,
  hrefBase = '/contests',
}: {
  contest: ContestListItem;
  hrefBase?: string;
}) {
  return (
    <Link href={`${hrefBase}/${contest.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-lg leading-snug">{contest.title}</CardTitle>
          <ContestStatusBadge status={contest.status} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ContestTypeBadge type={contest.type} />
            {contest.isRegistered && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Registered
              </span>
            )}
          </div>
          <div className="grid gap-1 text-sm text-muted-foreground">
            <p>Starts: {formatContestDate(contest.startTime)}</p>
            <p>Duration: {contest.durationMinutes} min</p>
            <p>{contest.participantCount} participants</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
