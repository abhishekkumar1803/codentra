'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@codentra/ui';
import type { CodeSubmission, RunCodeResult } from '@codentra/types';
import { useContest, useJoinContest } from '@/features/contests/hooks/use-contests';
import { ApiError } from '@/shared/lib/api-client';
import {
  useProblem,
  useProblemSubmissions,
  useRunCode,
  useSubmitCode,
} from '../hooks/use-problems';

const LANGUAGES = [
  { value: 'PYTHON', label: 'Python 3' },
  { value: 'CPP', label: 'C++' },
  { value: 'JAVA', label: 'Java' },
  { value: 'JAVASCRIPT', label: 'JavaScript' },
] as const;

const VERDICT_STYLES: Record<string, string> = {
  ACCEPTED: 'text-green-600',
  WRONG_ANSWER: 'text-red-600',
  RUNTIME_ERROR: 'text-red-600',
  TIME_LIMIT_EXCEEDED: 'text-orange-600',
  COMPILATION_ERROR: 'text-red-600',
  PENDING: 'text-muted-foreground',
};

export function ProblemSolverView({
  contestSlug,
  problemSlug,
}: {
  contestSlug: string;
  problemSlug: string;
}) {
  const { data: contest, isLoading: contestLoading } = useContest(contestSlug);
  const problemsLocked =
    !!contest &&
    !contest.isRegistered &&
    (contest.status === 'LIVE' || contest.status === 'ENDED');
  const canAccessProblem = !problemsLocked;

  const { data: problem, isLoading: problemLoading } = useProblem(
    contestSlug,
    problemSlug,
    { enabled: canAccessProblem },
  );
  const { data: submissions } = useProblemSubmissions(
    contestSlug,
    problemSlug,
    { enabled: canAccessProblem },
  );
  const runCode = useRunCode(contestSlug, problemSlug);
  const submitCode = useSubmitCode(contestSlug, problemSlug);
  const joinContest = useJoinContest();
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState('PYTHON');
  const [sourceCode, setSourceCode] = useState('');
  const [codeInitialized, setCodeInitialized] = useState(false);
  const [inputTab, setInputTab] = useState<'custom' | 'sample'>('custom');
  const [customInput, setCustomInput] = useState('1 2');
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<CodeSubmission | null>(null);
  const [hideProblem, setHideProblem] = useState(false);
  const [submitFeedback, setSubmitFeedback] =
    useState<CodeSubmission | null>(null);

  useEffect(() => {
    if (!problem || codeInitialized) return;
    const starter =
      problem.starterCode[language] ?? problem.starterCode.PYTHON ?? '';
    setSourceCode(starter);
    setCodeInitialized(true);
    if (problem.sampleTestCases[0]?.input) {
      setCustomInput(problem.sampleTestCases[0].input);
    }
  }, [problem, language, codeInitialized]);

  const handleLanguageChange = (next: string) => {
    if (!problem) return;
    setLanguage(next);
    setSourceCode(
      problem.starterCode[next] ?? problem.starterCode.PYTHON ?? '',
    );
    setRunResult(null);
    setSubmitFeedback(null);
  };

  const formatActionError = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.code === 'NOT_REGISTERED') {
        return contest?.status === 'ENDED'
          ? 'Virtual join this contest to practice problems.'
          : 'Register for this contest before running or submitting code.';
      }
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  };

  const handleRegister = () => {
    if (!contest) return;
    setActionError(null);
    joinContest.mutate(contest.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ['problems', contestSlug, problemSlug],
        });
        void queryClient.invalidateQueries({
          queryKey: ['contests', 'detail', contestSlug],
        });
      },
      onError: (error) => setActionError(formatActionError(error)),
    });
  };

  if (contestLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (problemsLocked && contest) {
    const isEnded = contest.status === 'ENDED';
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <Link
          href={`/contests/${contestSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to contest
        </Link>
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Registration required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-900">
              {isEnded
                ? 'Virtual join this ended contest to access problems and practice.'
                : 'Register for this live contest to view and solve problems.'}
            </p>
            <Button
              onClick={handleRegister}
              disabled={joinContest.isPending}
            >
              {joinContest.isPending
                ? 'Joining...'
                : isEnded
                  ? 'Virtual join'
                  : 'Register for contest'}
            </Button>
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (problemLoading || !problem) {
    return <Skeleton className="h-96 w-full" />;
  }

  const sampleInput = problem.sampleTestCases[0]?.input ?? '1 2';
  const activeInput = inputTab === 'sample' ? sampleInput : customInput;
  const isLive = problem.contestStatus === 'LIVE';
  const isEnded = problem.contestStatus === 'ENDED';
  const isRegistered = problem.isRegistered;
  const isVirtual = problem.isVirtual;
  const canRun = isRegistered;
  const canSubmit = isRegistered && (isLive || isEnded);
  const isPracticeMode = isEnded || isVirtual;

  return (
    <div className="space-y-4">
      {!isRegistered && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm text-amber-900">
              {isEnded
                ? 'This contest has ended. Virtual join to practice problems and submit in upsolve mode (no ranking impact).'
                : 'Register for this contest to run code and submit solutions.'}
            </p>
            <Button
              size="sm"
              onClick={handleRegister}
              disabled={joinContest.isPending}
            >
              {joinContest.isPending
                ? 'Joining...'
                : isEnded
                  ? 'Virtual join'
                  : 'Register for contest'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isRegistered && isPracticeMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3 text-sm text-blue-900">
            {isVirtual
              ? 'Virtual participation — practice mode. Submissions do not affect contest rankings or ratings.'
              : 'Contest ended — upsolve mode. Submissions are for practice only.'}
          </CardContent>
        </Card>
      )}

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/contests/${contestSlug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to contest
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{problem.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
              {problem.difficulty}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
              {problem.points} pts
            </span>
            {problem.isSolved && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800">
                COMPLETED
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHideProblem((v) => !v)}
        >
          {hideProblem ? 'Show problem' : 'Hide problem'}
        </Button>
      </div>

      <div
        className={cn(
          'grid gap-4 transition-all duration-300',
          hideProblem ? 'lg:grid-cols-1' : 'lg:grid-cols-2',
        )}
      >
        {!hideProblem && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Problem statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap leading-relaxed">
                {problem.description}
              </p>
              <div>
                <p>
                  <span className="font-medium">Input:</span>{' '}
                  {problem.inputFormat}
                </p>
                <p>
                  <span className="font-medium">Output:</span>{' '}
                  {problem.outputFormat}
                </p>
              </div>
              <p className="text-muted-foreground">
                Time limit: {problem.timeLimitMs}ms · Memory: {problem.memoryMb}
                MB
              </p>

              <div>
                <p className="mb-2 font-medium">Pretest cases (visible)</p>
                {problem.sampleTestCases.map((tc, i) => (
                  <div
                    key={tc.id}
                    className="mb-2 rounded-md border bg-muted/30 p-3 font-mono text-xs"
                  >
                    <p className="mb-2 font-sans font-medium">
                      Pretest {i + 1}
                    </p>
                    <p>Input: {tc.input}</p>
                    <p>Output: {tc.output}</p>
                  </div>
                ))}
              </div>

              {problem.hiddenTestCaseCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  + {problem.hiddenTestCaseCount} hidden test case
                  {problem.hiddenTestCaseCount > 1 ? 's' : ''} evaluated on
                  submit (details not shown).
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card className={cn(hideProblem && 'lg:col-span-full')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Code editor</CardTitle>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                spellCheck={false}
                className={cn(
                  'w-full rounded-md bg-zinc-900 p-4 font-mono text-sm text-zinc-100 transition-all',
                  hideProblem ? 'min-h-[420px]' : 'min-h-[280px]',
                )}
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={inputTab === 'custom' ? 'default' : 'outline'}
                  onClick={() => setInputTab('custom')}
                >
                  Custom input
                </Button>
                <Button
                  size="sm"
                  variant={inputTab === 'sample' ? 'default' : 'outline'}
                  onClick={() => setInputTab('sample')}
                >
                  Pretest cases
                </Button>
              </div>

              {inputTab === 'custom' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Input
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="mt-1 min-h-[80px] w-full rounded-md border bg-background p-3 font-mono text-sm"
                  />
                </div>
              )}

              <Button
                variant="outline"
                disabled={!canRun || runCode.isPending}
                onClick={async () => {
                  setActionError(null);
                  try {
                    const result = await runCode.mutateAsync({
                      language,
                      sourceCode,
                      ...(inputTab === 'sample'
                        ? { runSamples: true }
                        : { input: activeInput }),
                    });
                    setRunResult(result);
                  } catch (error) {
                    setActionError(formatActionError(error));
                  }
                }}
              >
                {runCode.isPending ? 'Running...' : 'Run code'}
              </Button>

              {runResult && runResult.mode === 'custom' && (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className={VERDICT_STYLES[runResult.verdict]}>
                    {runResult.verdict}
                  </p>
                  <p className="mt-1 font-mono text-xs">
                    Your output: {runResult.output || '(empty)'}
                  </p>
                  {runResult.verdict !== 'ACCEPTED' && (
                    <p className="font-mono text-xs text-muted-foreground">
                      Expected: {runResult.expectedOutput}
                    </p>
                  )}
                </div>
              )}

              {runResult && runResult.mode === 'samples' && (
                <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <p className={VERDICT_STYLES[runResult.verdict]}>
                    {runResult.verdict}
                  </p>
                  {runResult.results.map((r) => (
                    <div key={r.index} className="font-mono text-xs">
                      <p className={VERDICT_STYLES[r.verdict]}>
                        Pretest {r.index}: {r.verdict}
                      </p>
                      <p>Input: {r.input}</p>
                      <p>Output: {r.output || '(empty)'}</p>
                      {r.verdict !== 'ACCEPTED' && (
                        <p className="text-muted-foreground">
                          Expected: {r.expectedOutput}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {isLive
                  ? 'Submissions run all pretests then hidden tests.'
                  : isEnded && isRegistered
                    ? 'Practice mode — run and submit without affecting rankings.'
                    : isEnded
                      ? 'Virtual join to practice this ended contest.'
                      : 'Contest has not started — register and wait for go-live to submit.'}
              </p>

              <Button
                className="w-full"
                disabled={!canSubmit || submitCode.isPending}
                onClick={() => {
                  setActionError(null);
                  submitCode.mutate(
                    { language, sourceCode },
                    {
                      onSuccess: (data) => {
                        setSubmitFeedback(data);
                        if (data.verdict === 'ACCEPTED' || data.verdictDetails) {
                          setSelectedSubmission(data);
                        }
                      },
                      onError: (error) =>
                        setActionError(formatActionError(error)),
                    },
                  );
                }}
              >
                {submitCode.isPending ? 'Submitting...' : 'Submit solution'}
              </Button>

              {submitFeedback && (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className={VERDICT_STYLES[submitFeedback.verdict]}>
                    {submitFeedback.verdict}
                  </p>
                  {submitFeedback.verdictDetails?.message && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {submitFeedback.verdictDetails.message}
                    </p>
                  )}
                  {submitFeedback.verdictDetails?.input &&
                    !submitFeedback.verdictDetails.isHidden && (
                    <div className="mt-2 font-mono text-xs">
                      <p>Input: {submitFeedback.verdictDetails.input}</p>
                      <p>
                        Expected: {submitFeedback.verdictDetails.expectedOutput}
                      </p>
                      <p>
                        Got: {submitFeedback.verdictDetails.actualOutput}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your submissions</CardTitle>
              <p className="text-xs text-muted-foreground">
                Click a submission to view your submitted code and verdict.
              </p>
            </CardHeader>
            <CardContent>
              {submissions?.items.length ? (
                <ul className="space-y-2">
                  {submissions.items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubmission(
                            selectedSubmission?.id === s.id ? null : s,
                          )
                        }
                        className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            'font-medium',
                            VERDICT_STYLES[s.verdict],
                          )}
                        >
                          {s.verdict}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.language} ·{' '}
                          {new Date(s.submittedAt).toLocaleString('en-IN')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No submissions yet.
                </p>
              )}

              {selectedSubmission && (
                <div className="mt-4 space-y-3">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      VERDICT_STYLES[selectedSubmission.verdict],
                    )}
                  >
                    {selectedSubmission.verdict}
                  </p>
                  {selectedSubmission.verdictDetails && (
                    <div className="rounded-md border bg-muted/20 p-3 text-xs">
                      {selectedSubmission.verdictDetails.message && (
                        <p className="mb-2 text-muted-foreground">
                          {selectedSubmission.verdictDetails.message}
                        </p>
                      )}
                      {selectedSubmission.verdictDetails.input &&
                        !selectedSubmission.verdictDetails.isHidden && (
                        <div className="font-mono">
                          <p>Input: {selectedSubmission.verdictDetails.input}</p>
                          <p>
                            Expected:{' '}
                            {selectedSubmission.verdictDetails.expectedOutput}
                          </p>
                          <p>
                            Got: {selectedSubmission.verdictDetails.actualOutput}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <pre className="max-h-56 overflow-auto rounded-md bg-zinc-900 p-3 font-mono text-xs text-zinc-100">
                    {selectedSubmission.sourceCode}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
