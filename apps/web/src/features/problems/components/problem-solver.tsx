'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Skeleton, cn } from '@codentra/ui';
import type { CodeSubmission, RunCodeResult } from '@codentra/types';
import { useContest, useJoinContest } from '@/features/contests/hooks/use-contests';
import { ApiError } from '@/shared/lib/api-client';
import { CodeEditor } from './code-editor';
import { SubmissionDetailModal } from './submission-detail-modal';
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

type LanguageValue = (typeof LANGUAGES)[number]['value'];

const VALID_LANGUAGES = new Set<string>(LANGUAGES.map((l) => l.value));

function isValidLanguage(value: string): value is LanguageValue {
  return VALID_LANGUAGES.has(value);
}

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

function languageStorageKey(contestSlug: string, problemSlug: string) {
  return `codentra:lang:${contestSlug}:${problemSlug}`;
}

function readStoredLanguage(contestSlug: string, problemSlug: string) {
  if (typeof window === 'undefined') return 'PYTHON';
  const stored = localStorage.getItem(
    languageStorageKey(contestSlug, problemSlug),
  );
  return stored && isValidLanguage(stored) ? stored : 'PYTHON';
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

  const [language, setLanguage] = useState(() =>
    readStoredLanguage(contestSlug, problemSlug),
  );
  const [sourceCode, setSourceCode] = useState('');
  const [codeInitialized, setCodeInitialized] = useState(false);
  const [hideProblem, setHideProblem] = useState(false);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [customInputs, setCustomInputs] = useState<string[]>(['']);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    null,
  );
  const [modalSubmissionId, setModalSubmissionId] = useState<string | null>(
    null,
  );
  const [bottomTab, setBottomTab] = useState<BottomTab>('testcase');
  const [pendingSubmitId, setPendingSubmitId] = useState<string | null>(null);

  const { data: polledSubmission } = useSubmission(
    contestSlug,
    problemSlug,
    pendingSubmitId,
  );

  const { data: modalSubmission, isLoading: modalLoading } = useSubmission(
    contestSlug,
    problemSlug,
    modalSubmissionId,
  );

  useEffect(() => {
    if (!problem || codeInitialized) return;

    const lang = readStoredLanguage(contestSlug, problemSlug);
    if (lang !== language) {
      setLanguage(lang);
      return;
    }

    const stored = localStorage.getItem(
      codeStorageKey(contestSlug, problemSlug, lang),
    );
    const starter =
      stored ??
      problem.starterCode[lang] ??
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
    localStorage.setItem(
      languageStorageKey(contestSlug, problemSlug),
      language,
    );
  }, [language, contestSlug, problemSlug]);

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
    if (!problem || !isValidLanguage(next)) return;
    localStorage.setItem(
      codeStorageKey(contestSlug, problemSlug, language),
      sourceCode,
    );
    localStorage.setItem(
      languageStorageKey(contestSlug, problemSlug),
      next,
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
    }));
    return custom.length
      ? custom
      : [{ key: 'empty', label: 'Case 1', input: '' }];
  }, [customInputs]);

  const activeInput = testcaseTabs[activeCaseIndex]?.input ?? '';

  if (contestLoading) {
    return <Skeleton className="h-full w-full" />;
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold">Registration required</h2>
          <p className="mt-2 text-sm text-amber-900">
            {isEnded
              ? 'Virtual join this ended contest to access problems.'
              : 'Register for this live contest to view and solve problems.'}
          </p>
          <Button
            className="mt-4"
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
            <p className="mt-2 text-sm text-red-600">{actionError}</p>
          )}
        </div>
      </div>
    );
  }

  if (problemLoading || !problem) {
    return <Skeleton className="h-full w-full" />;
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
    polledSubmission ??
    submissions?.items.find((s) => s.id === activeSubmissionId) ??
    null;

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        {actionError && (
          <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {!isRegistered && (
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            <span>Register to run and submit solutions.</span>
            <Button
              size="sm"
              onClick={handleRegister}
              disabled={joinContest.isPending}
            >
              {joinContest.isPending ? 'Joining...' : 'Register'}
            </Button>
          </div>
        )}

        {isRegistered && isPracticeMode && (
          <div className="shrink-0 border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900">
            {isVirtual
              ? 'Virtual mode — submissions do not affect rankings.'
              : 'Upsolve mode — practice only.'}
          </div>
        )}

        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/contests/${contestSlug}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← {contest?.title ?? 'Contest'}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold">{problem.title}</h1>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {problem.difficulty}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {problem.points} pts
              </span>
              {problem.isSolved && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Solved
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setHideProblem((v) => !v)}
          >
            {hideProblem ? 'Show problem' : 'Hide problem'}
          </Button>
        </div>

        {/* Main split — LeetCode-style */}
        <div className="flex min-h-0 flex-1">
          {/* Problem description */}
          {!hideProblem && (
            <div className="flex w-full min-w-0 flex-col border-r lg:w-[42%] lg:max-w-xl">
              <div className="shrink-0 border-b px-4 py-2 text-sm font-medium">
                Description
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed">
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
                    Time limit: {problem.timeLimitMs}ms · Memory:{' '}
                    {problem.memoryMb}MB
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
                        <p className="mb-1 font-sans font-medium">
                          Example {i + 1}
                        </p>
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
              </div>
            </div>
          )}

          {/* Editor + console */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Editor toolbar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-md border bg-background px-2 py-1.5 text-sm"
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
                  Run all
                </Button>
                <Button
                  size="sm"
                  disabled={
                    !canSubmit || submitCode.isPending || !!pendingSubmitId
                  }
                  onClick={handleSubmit}
                >
                  {submitCode.isPending || pendingSubmitId
                    ? 'Submitting...'
                    : 'Submit'}
                </Button>
              </div>
            </div>

            {/* Monaco — takes maximum vertical space */}
            <div className="min-h-0 flex-1">
              <CodeEditor
                language={language}
                value={sourceCode}
                onChange={setSourceCode}
                height="100%"
              />
            </div>

            {/* Bottom console */}
            <div className="flex h-[220px] shrink-0 flex-col border-t bg-background">
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
                    {tab === 'submissions' && submissions?.items.length
                      ? ` (${submissions.items.length})`
                      : ''}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3 text-sm">
                {bottomTab === 'testcase' && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {testcaseTabs.map((tc, i) => (
                        <Button
                          key={tc.key}
                          size="sm"
                          variant={
                            activeCaseIndex === i ? 'default' : 'outline'
                          }
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
                      className="h-full min-h-[100px] w-full rounded-md border bg-background p-2 font-mono text-xs"
                      placeholder="stdin input for Run"
                    />
                  </div>
                )}

                {bottomTab === 'result' && (
                  <ResultPanel
                    runResult={runResult}
                    submission={displaySubmission}
                    pending={!!pendingSubmitId}
                    onViewSubmission={(id) => setModalSubmissionId(id)}
                  />
                )}

                {bottomTab === 'submissions' && (
                  <SubmissionsPanel
                    items={submissions?.items ?? []}
                    onSelect={(id) => setModalSubmissionId(id)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmissionDetailModal
        submission={modalSubmission}
        isLoading={modalLoading && !!modalSubmissionId}
        onClose={() => setModalSubmissionId(null)}
      />
    </>
  );
}

function ResultPanel({
  runResult,
  submission,
  pending,
  onViewSubmission,
}: {
  runResult: RunCodeResult | null;
  submission: CodeSubmission | null;
  pending: boolean;
  onViewSubmission: (id: string) => void;
}) {
  if (pending) {
    return (
      <p className={cn('font-medium', VERDICT_STYLES.PENDING)}>
        Judging your submission…
      </p>
    );
  }

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
        <p className="font-mono text-xs">
          Output: {runResult.output || '(empty)'}
        </p>
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
            {r.message && <p className="text-red-600">{r.message}</p>}
            {r.verdict !== 'ACCEPTED' && (
              <p className="text-muted-foreground">
                Expected: {r.expectedOutput}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (submission) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Submission result
        </p>
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewSubmission(submission.id)}
        >
          View submitted code
        </Button>
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
  onSelect,
}: {
  items: CodeSubmission[];
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
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-muted/50"
          >
            <span className={cn('font-medium', VERDICT_STYLES[s.verdict])}>
              {s.verdict}
            </span>
            <span className="text-xs text-muted-foreground">
              {s.language} · {new Date(s.submittedAt).toLocaleString('en-IN')}
              {s.runtimeMs != null && s.verdict === 'ACCEPTED'
                ? ` · ${s.runtimeMs}ms`
                : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
