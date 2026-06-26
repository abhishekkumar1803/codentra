'use client';

import { Button, cn } from '@codentra/ui';
import type { CodeSubmission } from '@codentra/types';
import { CodeEditor } from './code-editor';

const VERDICT_STYLES: Record<string, string> = {
  ACCEPTED: 'text-green-600',
  WRONG_ANSWER: 'text-red-600',
  RUNTIME_ERROR: 'text-red-600',
  TIME_LIMIT_EXCEEDED: 'text-orange-600',
  COMPILATION_ERROR: 'text-red-600',
  PENDING: 'text-muted-foreground',
};

export function SubmissionDetailModal({
  submission,
  isLoading,
  onClose,
}: {
  submission: CodeSubmission | null | undefined;
  isLoading?: boolean;
  onClose: () => void;
}) {
  if (!submission && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div>
            <h2 id="submission-modal-title" className="text-lg font-semibold">
              Submission details
            </h2>
            {submission && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {submission.language} ·{' '}
                {new Date(submission.submittedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading submission…</p>
          )}

          {submission && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'text-lg font-semibold',
                    VERDICT_STYLES[submission.verdict],
                  )}
                >
                  {submission.verdict}
                </span>
                {submission.runtimeMs != null && (
                  <span className="text-sm text-muted-foreground">
                    {submission.runtimeMs}ms
                  </span>
                )}
                {submission.score > 0 && (
                  <span className="text-sm text-muted-foreground">
                    +{submission.score} pts
                  </span>
                )}
              </div>

              {submission.verdictDetails?.message && (
                <p className="text-sm text-muted-foreground">
                  {submission.verdictDetails.message}
                </p>
              )}

              {submission.verdictDetails?.passedCount != null && (
                <p className="text-sm text-muted-foreground">
                  Passed {submission.verdictDetails.passedCount}/
                  {submission.verdictDetails.totalCount} test cases
                </p>
              )}

              {submission.verdictDetails?.input &&
                !submission.verdictDetails.isHidden && (
                <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs">
                  <p>Input: {submission.verdictDetails.input}</p>
                  <p>Expected: {submission.verdictDetails.expectedOutput}</p>
                  <p>Got: {submission.verdictDetails.actualOutput}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">Submitted code</p>
                <div className="h-[min(50vh,400px)] overflow-hidden rounded-md border">
                  <CodeEditor
                    language={submission.language}
                    value={submission.sourceCode}
                    readOnly
                    height="100%"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
