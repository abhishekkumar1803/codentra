'use client';

import { useState } from 'react';
import type { LeaderboardEntry } from '@codentra/types';
import { Button, Card, CardContent, CardHeader, Skeleton } from '@codentra/ui';
import { useContests } from '@/features/contests/hooks/use-contests';
import {
  useLeaderboard,
  useMyLeaderboardRankings,
} from '@/features/leaderboards/hooks/use-leaderboards';

type ViewMode = 'global' | 'contest';

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <li className="flex items-center justify-between py-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="w-8 font-medium text-muted-foreground">
          #{entry.rank}
        </span>
        {entry.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
            {entry.userName.charAt(0)}
          </div>
        )}
        <span className="font-medium">{entry.userName}</span>
      </div>
      <span className="font-medium">{entry.score} pts</span>
    </li>
  );
}

export default function LeaderboardsPage() {
  const [view, setView] = useState<ViewMode>('global');
  const [contestId, setContestId] = useState('');

  const { data: contests } = useContests({ limit: 50, excludeType: 'QUIZ' });
  const codingContests =
    contests?.items.filter((c) =>
      ['DSA', 'COMPETITIVE_PROGRAMMING', 'SYSTEM_DESIGN'].includes(c.type),
    ) ?? [];

  const { data, isLoading, error } = useLeaderboard({
    period: view === 'global' ? 'ALL_TIME' : undefined,
    contestId: view === 'contest' ? contestId : undefined,
    limit: 50,
  });
  const { data: myRankings } = useMyLeaderboardRankings();

  const myRank = myRankings?.rankings.find((r) => r.period === 'ALL_TIME');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboards</h1>
        <p className="mt-1 text-muted-foreground">
          All-time global rankings and per-contest standings.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={view === 'global' ? 'default' : 'outline'}
          onClick={() => setView('global')}
        >
          Global
        </Button>
        <Button
          size="sm"
          variant={view === 'contest' ? 'default' : 'outline'}
          onClick={() => setView('contest')}
        >
          By contest
        </Button>
      </div>

      {view === 'contest' && (
        <select
          value={contestId}
          onChange={(e) => setContestId(e.target.value)}
          className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select a contest</option>
          {codingContests.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.status})
            </option>
          ))}
        </select>
      )}

      {myRank?.rank && view === 'global' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-lg font-semibold">
              Your global rank: #{myRank.rank} · {myRank.score} pts
            </p>
          </CardContent>
        </Card>
      )}

      {view === 'contest' && !contestId && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Select a contest to view its standings.
          </CardContent>
        </Card>
      )}

      {(view === 'global' || contestId) && isLoading && (
        <Skeleton className="h-64 w-full" />
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load leaderboard.
          </CardContent>
        </Card>
      )}

      {data && (view === 'global' || contestId) && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold">
              {view === 'global' ? 'Global leaderboard' : 'Contest standings'}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {data.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No scores yet. Compete in contests to climb the ranks!
              </p>
            ) : (
              <ul className="divide-y">
                {data.items.map((entry) => (
                  <LeaderboardRow key={entry.userId} entry={entry} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
