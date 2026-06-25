'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@codentra/ui';
import { ApiError } from '@/shared/lib/api-client';
import {
  useSubmitSystemDesign,
  useSystemDesignChallenge,
} from '@/features/system-design/hooks/use-system-design';

export function SystemDesignSubmitView({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: challenge, isLoading, error } = useSystemDesignChallenge(slug);
  const submit = useSubmitSystemDesign();
  const [solution, setSolution] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error || !challenge) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {error instanceof ApiError ? error.message : 'Challenge not available.'}
        </CardContent>
      </Card>
    );
  }

  if (challenge.hasSubmitted && challenge.submission) {
    return (
      <div className="space-y-6">
        <Link
          href={`/contests/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to contest
        </Link>
        <h1 className="text-2xl font-bold">Submission received</h1>
        <Card>
          <CardContent className="py-6">
            <p className="whitespace-pre-wrap text-sm">{challenge.submission.solution}</p>
            {challenge.submission.diagramUrl && (
              <p className="mt-4 text-sm">
                Diagram:{' '}
                <a
                  href={challenge.submission.diagramUrl}
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit.mutate(
      {
        contestId: challenge.contestId,
        payload: {
          solution,
          diagramUrl: diagramUrl || undefined,
        },
      },
      { onSuccess: () => router.push(`/contests/${slug}`) },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/contests/${slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to contest
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{challenge.title}</h1>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {challenge.description}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Your solution</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="solution">Architecture & design (min 100 chars)</Label>
              <textarea
                id="solution"
                className="flex min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                required
                minLength={100}
                placeholder="Describe components, data flow, scaling, trade-offs..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagramUrl">Diagram URL (optional)</Label>
              <Input
                id="diagramUrl"
                type="url"
                placeholder="https://..."
                value={diagramUrl}
                onChange={(e) => setDiagramUrl(e.target.value)}
              />
            </div>
            {submit.error && (
              <p className="text-sm text-red-600">
                {submit.error instanceof ApiError
                  ? submit.error.message
                  : 'Submission failed.'}
              </p>
            )}
            <Button type="submit" disabled={submit.isPending || solution.length < 100}>
              {submit.isPending ? 'Submitting...' : 'Submit solution'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
