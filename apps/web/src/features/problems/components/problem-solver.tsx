'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { CodeEditor } from './code-editor';
import {
  useProblem,
  useProblemSubmissions,
  useRunCode,
  useSubmission,
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
  PENDING: 'text-muted-foreground animate-pulse',
};

type BottomTab = 'testcase' | 'result' | 'submissions';

function codeStorageKey(
  contestSlug: string,
  problemSlug: string,
  language: string,
) {
  return `codentra:code:${contestSlug}:${problemSlug}:${language}`;
}

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
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [customInputs, setCustomInputs] = useState<string[]>(['']);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    null,
  );
  const [bottomTab, setBottomTab] = useState<BottomTab>('testcase');
  const [pendingSubmitId, setPendingSubmitId] = useState<string | null>(null);

  const { data: polledSubmission } = useSubmission(
    contestSlug,
    problemSlug,
    pendingSubmitId,
  );

  const activeSubmitResult = polledSubmission ?? null;

  useEffect(() => {
    if (!problem || codeInitialized) return;
    const stored = localStorage.getItem(
      codeStorageKey(contestSlug, problemSlug, language),
    );
    const starter =
      stored ??
      problem.starterCode[language] ??
      problem.starterCode.PYTHON ??
      '';
    setSourceCode(starter);
    setCodeInitialized(true);

    const samples = problem.sampleTestCases.map((tc) => tc.input);
    setCustomInputs(samples.length ? samples : ['']);
  }, [problem, language, codeInitialized, contestSlug, problemSlug]);

  useEffect(() => {
    if (!codeInitialized) return;
    localStorage.setItem(
      codeStorageKey(contestSlug, problemSlug, language),
      sourceCode,
    );
  }, [sourceCode, language, contestSlug, problemSlug, codeInitialized]);

  useEffect(() => {
    if (!polledSubmission || polledSubmission.verdict === 'PENDING') return;
    setPendingSubmitId(null);
    setActiveSubmissionId(polledSubmission.id);
    setBottomTab('result');
    void queryClient.invalidateQueries({
      queryKey: ['problems', contestSlug, problemSlug, 'submissions'],
    });
    void queryClient.invalidateQueries({
      queryKey: ['problems', contestSlug, problemSlug],
    });
    void queryClient.invalidateQueries({
      queryKey: ['contests', contestSlug],
    });
  }, [polledSubmission, contestSlug, problemSlug, queryClient]);

  const handleLanguageChange = (next: string) => {
    if (!problem) return;
    localStorage.setItem(
      codeStorageKey(contestSlug, problemSlug, language),
      sourceCode,
    );
    setLanguage(next);
    const stored = localStorage.getItem(
      codeStorageKey(contestSlug, problemSlug, next),
    );
    setSourceCode(
      stored ?? problem.starterCode[next] ?? problem.starterCode.PYTHON ?? '',
    );
    setRunResult(null);
    setCodeInitialized(true);
  };

  const resetToStarter = () => {
    if (!problem) return;
    const starter =
      problem.starterCode[language] ?? problem.starterCode.PYTHON ?? '';
    setSourceCode(starter);
    localStorage.removeItem(
      codeStorageKey(contestSlug, problemSlug, language),
    );
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

  const sampleCases = problem?.sampleTestCases ?? [];
  const testcaseTabs = useMemo(() => {
    const custom = customInputs.map((input, i) => ({
      key: `custom-${i}`,
      label: `Case ${i + 1}`,
      input,
      isSample: false,
    }));
    return custom.length ? custom : [{ key: 'empty', label: 'Case 1', input: '', isSample: false }];
  }, [customInputs]);

  const activeInput = testcaseTabs[activeCaseIndex]?.input ?? '';

  if (contestLoading) {
    return <Skeleton className="h-[70vh] w-full" />;
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
            <Button onClick={handleRegister} disabled={joinContest.isPending}>
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
    return <Skeleton className="h-[70vh] w-full" />;
  }

  const isLive = problem.contestStatus === 'LIVE';
  const isEnded = problem.contestStatus === 'ENDED';
  const isRegistered = problem.isRegistered;
  const isVirtual = problem.isVirtual;
  const canRun = isRegistered;
  const canSubmit = isRegistered && (isLive || isEnded);
  const isPracticeMode = isEnded || isVirtual;

  const handleRun = async (runSamples: boolean) => {
    setActionError(null);
    setActiveSubmissionId(null);
    setPendingSubmitId(null);
    setBottomTab('result');
    try {
      const result = await runCode.mutateAsync({
        language,
        sourceCode,
        ...(runSamples ? { runSamples: true } : { input: activeInput }),
      });
      setRunResult(result);
    } catch (error) {
      setRunResult(null);
      setActionError(formatActionError(error));
    }
  };

  const handleSubmit = () => {
    setActionError(null);
    setRunResult(null);
    setBottomTab('result');
    submitCode.mutate(
      { language, sourceCode },
      {
        onSuccess: (data) => {
          if (data.verdict === 'PENDING') {
            setPendingSubmitId(data.id);
          } else {
            setActiveSubmissionId(data.id);
          }
        },
        onError: (error) => setActionError(formatActionError(error)),
      },
    );
  };

  const displaySubmission =
    activeSubmitResult ??
    submissions?.items.find((s) => s.id === activeSubmissionId) ??
    null;

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[640px] flex-col gap-3">
      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {!isRegistered && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
            <p className="text-sm text-amber-900">
              Register to run and submit solutions.
            </p>
            <Button size="sm" onClick={handleRegister} disabled={joinContest.isPending}>
              {joinContest.isPending ? 'Joining...' : 'Register'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isRegistered && isPracticeMode && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
          {isVirtual
            ? 'Virtual mode — submissions do not affect rankings.'
            : 'Upsolve mode — practice only.'}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/contests/${contestSlug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {contest?.title ?? 'Contest'}
          </Link>
          <h1 className="text-xl font-bold">{problem.title}</h1>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              {problem.difficulty}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              {problem.points} pts
            </span>
            {problem.isSolved && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
                Solved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        {/* Problem panel */}
        <Card className="flex min-h-0 flex-col overflow-hidden">
          <CardHeader className="shrink-0 border-b py-3">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto p-4 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{problem.description}</p>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-semibold">Input: </span>
                {problem.inputFormat}
              </p>
              <p>
                <span className="font-semibold">Output: </span>
                {problem.outputFormat}
              </p>
              <p className="text-muted-foreground">
                Time limit: {problem.timeLimitMs}ms · Memory: {problem.memoryMb}
                MB
              </p>
            </div>
            {sampleCases.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold">Examples</p>
                {sampleCases.map((tc, i) => (
                  <div
                    key={tc.id}
                    className="rounded-md border bg-muted/30 p-3 font-mono text-xs"
                  >
                    <p className="mb-1 font-sans font-medium">Example {i + 1}</p>
                    <p>Input: {tc.input}</p>
                    <p>Output: {tc.output}</p>
                  </div>
                ))}
              </div>
            )}
            {problem.hiddenTestCaseCount > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                + {problem.hiddenTestCaseCount} hidden test case
                {problem.hiddenTestCaseCount > 1 ? 's' : ''} on submit.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Editor workspace */}
        <div className="flex min-h-0 flex-col gap-2">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
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
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={resetToStarter}>
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canRun || runCode.isPending}
                  onClick={() => void handleRun(false)}
                >
                  {runCode.isPending ? 'Running...' : 'Run'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canRun || runCode.isPending}
                  onClick={() => void handleRun(true)}
                >
                  Run all samples
                </Button>
                <Button
                  size="sm"
                  disabled={!canSubmit || submitCode.isPending || !!pendingSubmitId}
                  onClick={handleSubmit}
                >
                  {submitCode.isPending || pendingSubmitId
                    ? 'Submitting...'
                    : 'Submit'}
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-2">
              <CodeEditor
                language={language}
                value={sourceCode}
                onChange={setSourceCode}
                height="100%"
              />
            </div>
          </Card>

          {/* Bottom panel — LeetCode-style tabs */}
          <Card className="flex max-h-[240px] min-h-[180px] flex-col overflow-hidden">
            <div className="flex shrink-0 border-b">
              {(
                [
                  ['testcase', 'Testcase'],
                  ['result', 'Test Result'],
                  ['submissions', 'Submissions'],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setBottomTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium',
                    bottomTab === tab
                      ? 'border-b-2 border-primary text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 text-sm">
              {bottomTab === 'testcase' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {testcaseTabs.map((tc, i) => (
                      <Button
                        key={tc.key}
                        size="sm"
                        variant={activeCaseIndex === i ? 'default' : 'outline'}
                        onClick={() => setActiveCaseIndex(i)}
                      >
                        {tc.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCustomInputs((prev) => [...prev, '']);
                        setActiveCaseIndex(customInputs.length);
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <textarea
                    value={activeInput}
                    onChange={(e) => {
                      const next = [...customInputs];
                      next[activeCaseIndex] = e.target.value;
                      setCustomInputs(next);
                    }}
                    className="min-h-[80px] w-full rounded-md border bg-background p-2 font-mono text-xs"
                    placeholder="stdin input for Run"
                  />
                </div>
              )}

              {bottomTab === 'result' && (
                <ResultPanel
                  runResult={runResult}
                  submission={displaySubmission}
                  pending={!!pendingSubmitId}
                />
              )}

              {bottomTab === 'submissions' && (
                <SubmissionsPanel
                  items={submissions?.items ?? []}
                  activeId={activeSubmissionId}
                  onSelect={(id) => {
                    setActiveSubmissionId(id);
                    setBottomTab('result');
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  runResult,
  submission,
  pending,
}: {
  runResult: RunCodeResult | null;
  submission: CodeSubmission | null;
  pending: boolean;
}) {
  if (pending) {
    return (
      <p className={cn('font-medium', VERDICT_STYLES.PENDING)}>
        Judging… (queued via BullMQ)
      </p>
    );
  }

  // Run results take priority — submission history is shown via Submissions tab
  if (runResult?.mode === 'custom') {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Run result</p>
        <p className={cn('font-semibold', VERDICT_STYLES[runResult.verdict])}>
          {runResult.verdict}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {runResult.runtimeMs}ms
          </span>
        </p>
        <p className="font-mono text-xs">Output: {runResult.output || '(empty)'}</p>
        {runResult.message && (
          <p className="text-xs text-red-600">{runResult.message}</p>
        )}
        {runResult.verdict !== 'ACCEPTED' && (
          <p className="font-mono text-xs text-muted-foreground">
            Expected: {runResult.expectedOutput}
          </p>
        )}
      </div>
    );
  }

  if (runResult?.mode === 'samples') {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Run result</p>
        <p className={cn('font-semibold', VERDICT_STYLES[runResult.verdict])}>
          {runResult.verdict}
        </p>
        {runResult.results.map((r) => (
          <div key={r.index} className="font-mono text-xs">
            <p className={VERDICT_STYLES[r.verdict]}>
              Case {r.index}: {r.verdict} ({r.runtimeMs}ms)
            </p>
            <p>Input: {r.input}</p>
            <p>Output: {r.output || '(empty)'}</p>
            {r.message && (
              <p className="text-red-600">{r.message}</p>
            )}
            {r.verdict !== 'ACCEPTED' && (
              <p className="text-muted-foreground">Expected: {r.expectedOutput}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (submission) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Submission result</p>
        <p className={cn('font-semibold', VERDICT_STYLES[submission.verdict])}>
          {submission.verdict}
          {submission.runtimeMs != null && submission.verdict === 'ACCEPTED' && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {submission.runtimeMs}ms
            </span>
          )}
        </p>
        {submission.verdictDetails?.message && (
          <p className="text-xs text-muted-foreground">
            {submission.verdictDetails.message}
          </p>
        )}
        {submission.verdictDetails?.passedCount != null && (
          <p className="text-xs text-muted-foreground">
            Passed {submission.verdictDetails.passedCount}/
            {submission.verdictDetails.totalCount} tests
          </p>
        )}
        {submission.verdictDetails?.input &&
          !submission.verdictDetails.isHidden && (
          <div className="font-mono text-xs">
            <p>Input: {submission.verdictDetails.input}</p>
            <p>Expected: {submission.verdictDetails.expectedOutput}</p>
            <p>Got: {submission.verdictDetails.actualOutput}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-muted-foreground">
      Run against a testcase or submit to see results here.
    </p>
  );
}

function SubmissionsPanel({
  items,
  activeId,
  onSelect,
}: {
  items: CodeSubmission[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!items.length) {
    return <p className="text-muted-foreground">No submissions yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted/50',
              activeId === s.id && 'bg-muted/50',
            )}
          >
            <span className={cn('font-medium', VERDICT_STYLES[s.verdict])}>
              {s.verdict}
            </span>
            <span className="text-xs text-muted-foreground">
              {s.language} · {new Date(s.submittedAt).toLocaleString('en-IN')}
              {s.runtimeMs != null && s.verdict === 'ACCEPTED' && ` · ${s.runtimeMs}ms`}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
