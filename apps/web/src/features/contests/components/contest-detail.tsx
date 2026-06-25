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
import { ApiError } from '@/shared/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useContest,
  useContestParticipants,
  useJoinContest,
} from '../hooks/use-contests';
import { useContestProblems } from '@/features/problems/hooks/use-problems';
import {
  ContestStatusBadge,
  ContestTypeBadge,
  formatContestDate,
} from './contest-badges';

const CODING_TYPES = ['DSA', 'COMPETITIVE_PROGRAMMING'];

export function ContestDetailView({ slug }: { slug: string }) {
  const { data: user } = useAuth();
  const { data: contest, isLoading, error } = useContest(slug);
  const { data: participants, isLoading: participantsLoading } =
    useContestParticipants(contest?.id);
  const { data: problems, isLoading: problemsLoading } = useContestProblems(
    CODING_TYPES.includes(contest?.type ?? '') ? slug : '',
  );
  const joinContest = useJoinContest();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Contest not found.</p>
          <Link href="/contests" className="mt-4 inline-block">
            <Button variant="outline">Back to contests</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const canJoin =
    !contest.isRegistered &&
    (contest.status === 'SCHEDULED' || contest.status === 'LIVE');

  const canVirtualJoin =
    !contest.isRegistered &&
    contest.status === 'ENDED' &&
    CODING_TYPES.includes(contest.type);

  const isVirtualParticipant = contest.registration?.isVirtual ?? false;

  const problemsLocked =
    !contest.isRegistered &&
    (contest.status === 'LIVE' || contest.status === 'ENDED');

  const joinError =
    joinContest.error instanceof ApiError
      ? joinContest.error.code === 'SUBSCRIPTION_REQUIRED'
        ? 'Active subscription required to join contests.'
        : joinContest.error.code === 'ALREADY_REGISTERED'
          ? 'You are already registered.'
          : joinContest.error.code === 'CONTEST_FULL'
            ? 'This contest is full.'
            : joinContest.error.message
      : joinContest.error
        ? 'Failed to register. Please try again.'
        : null;

  const isQuiz = contest.type === 'QUIZ';
  const isSystemDesign = contest.type === 'SYSTEM_DESIGN';
  const isSubmitted = contest.registration?.status === 'SUBMITTED';
  const canTakeQuiz =
    isQuiz && contest.isRegistered && contest.status === 'LIVE' && !isSubmitted;
  const canViewResults =
    isQuiz && contest.isRegistered && isSubmitted;
  const canSubmitSystemDesign =
    isSystemDesign &&
    contest.isRegistered &&
    contest.status === 'LIVE' &&
    !isSubmitted;
  const canViewSystemDesign =
    isSystemDesign && contest.isRegistered && isSubmitted;

  const myStanding = participants?.items.find((p) => p.userId === user?.id);
  const listHref = isQuiz ? '/quizzes' : '/contests';
  const listLabel = isQuiz ? 'quizzes' : 'contests';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={listHref}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {listLabel}
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {contest.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ContestTypeBadge type={contest.type} />
              <ContestStatusBadge status={contest.status} />
              {contest.isRegistered && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {isVirtualParticipant ? 'Virtual participant' : "You're registered"}
                </span>
              )}
            </div>
          </div>
          {canJoin && (
            <Button
              onClick={() => joinContest.mutate(contest.id)}
              disabled={joinContest.isPending}
            >
              {joinContest.isPending ? 'Registering...' : 'Register'}
            </Button>
          )}
          {canVirtualJoin && (
            <Button
              onClick={() => joinContest.mutate(contest.id)}
              disabled={joinContest.isPending}
            >
              {joinContest.isPending ? 'Joining...' : 'Virtual join'}
            </Button>
          )}
          {canTakeQuiz && (
            <Link href={`/contests/${contest.slug}/quiz`}>
              <Button>Start quiz</Button>
            </Link>
          )}
          {canViewResults && (
            <Link href={`/contests/${contest.slug}/quiz/results`}>
              <Button variant="outline">View results</Button>
            </Link>
          )}
          {canSubmitSystemDesign && (
            <Link href={`/contests/${contest.slug}/system-design`}>
              <Button>Submit solution</Button>
            </Link>
          )}
          {canViewSystemDesign && (
            <Link href={`/contests/${contest.slug}/system-design`}>
              <Button variant="outline">View submission</Button>
            </Link>
          )}
        </div>
      </div>

      {joinError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {joinError}
          {joinContest.error instanceof ApiError &&
            joinContest.error.code === 'SUBSCRIPTION_REQUIRED' && (
              <Link
                href="/dashboard/settings/subscription"
                className="ml-2 font-medium underline"
              >
                Subscribe now
              </Link>
            )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {contest.description}
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">Starts</dt>
              <dd>{formatContestDate(contest.startTime)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Ends</dt>
              <dd>{formatContestDate(contest.endTime)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Duration</dt>
              <dd>{contest.durationMinutes} minutes</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Participants
              </dt>
              <dd>
                {contest.participantCount}
                {contest.maxParticipants
                  ? ` / ${contest.maxParticipants}`
                  : ''}
              </dd>
            </div>
            {contest.createdBy && (
              <div>
                <dt className="font-medium text-muted-foreground">Host</dt>
                <dd>{contest.createdBy.name}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {CODING_TYPES.includes(contest.type) && (
        <Card>
          <CardHeader>
            <CardTitle>Problems ({problems?.items.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {problemsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : problems?.items.length ? (
              <ul className="divide-y">
                {problems.items.map((problem) => (
                  <li
                    key={problem.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    {problemsLocked ? (
                      <span
                        className="cursor-not-allowed font-medium text-muted-foreground"
                        title={
                          contest.status === 'ENDED'
                            ? 'Virtual join to open this problem'
                            : 'Register to open this problem'
                        }
                      >
                        {problem.title}
                      </span>
                    ) : (
                      <Link
                        href={`/contests/${slug}/problems/${problem.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {problem.title}
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {problem.difficulty} · {problem.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No problems published yet.
              </p>
            )}
            {problemsLocked && !!problems?.items.length && (
              <p className="mt-3 text-xs text-muted-foreground">
                {contest.status === 'ENDED'
                  ? 'Virtual join to access problems.'
                  : 'Register for this contest to access problems.'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {contest.isRegistered && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 text-sm">
            <p>
              {isVirtualParticipant
                ? 'You are participating virtually (practice mode).'
                : 'You are registered for this contest.'}
            </p>
            {!isVirtualParticipant && (
              <p className="mt-1 font-medium">
                Score: {myStanding?.score ?? 0} pts
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contest standings</CardTitle>
        </CardHeader>
        <CardContent>
          {participantsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : participants?.items.length ? (
            <>
              {myStanding && (
                <div className="mb-4 rounded-md bg-muted px-4 py-3 text-sm">
                  Your rank: #{myStanding.rank} · {myStanding.score} pts
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Rank</th>
                    <th className="pb-2 font-medium">Member</th>
                    <th className="pb-2 text-right font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.items.map((p) => (
                    <tr key={p.userId} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">#{p.rank}</td>
                      <td className="py-3 font-medium">{p.userName}</td>
                      <td className="py-3 text-right">{p.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No participants yet. Be the first to register!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
