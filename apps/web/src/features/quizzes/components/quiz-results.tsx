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
import { useContest } from '@/features/contests/hooks/use-contests';
import { useQuizResults } from '../hooks/use-quizzes';

export function QuizResultsView({ slug }: { slug: string }) {
  const { data: contest, isLoading: contestLoading } = useContest(slug);
  const {
    data: results,
    isLoading: resultsLoading,
    error,
  } = useQuizResults(contest?.id, !!contest?.id);

  const isLoading = contestLoading || resultsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !results) {
    const message =
      error instanceof ApiError
        ? error.code === 'QUIZ_NOT_SUBMITTED'
          ? 'You have not submitted this quiz yet.'
          : error.message
        : 'Results not available.';
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{message}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href={`/contests/${slug}`}>
              <Button variant="outline">Back to contest</Button>
            </Link>
            {error instanceof ApiError &&
              error.code === 'QUIZ_NOT_SUBMITTED' && (
                <Link href={`/contests/${slug}/quiz`}>
                  <Button>Take quiz</Button>
                </Link>
              )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage =
    results.totalPoints > 0
      ? Math.round((results.score / results.totalPoints) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/contests/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to contest
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Quiz results
        </h1>
        <p className="mt-1 text-muted-foreground">{results.title}</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 py-6">
          <div>
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="text-3xl font-bold">
              {results.score}
              <span className="text-lg font-normal text-muted-foreground">
                /{results.totalPoints}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-3xl font-bold">{percentage}%</p>
          </div>
          {results.rank && (
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="text-3xl font-bold">#{results.rank}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {results.questions.map((question, index) => (
          <Card
            key={question.id}
            className={
              question.isCorrect
                ? 'border-green-200 bg-green-50/50'
                : 'border-red-200 bg-red-50/50'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.text}
                <span
                  className={`ml-2 text-sm font-normal ${
                    question.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {question.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {question.options.map((option) => {
                const isSelected = option.id === question.selectedOptionId;
                const isCorrect = option.isCorrect;
                return (
                  <p
                    key={option.id}
                    className={`text-sm ${
                      isCorrect
                        ? 'font-medium text-green-800'
                        : isSelected
                          ? 'text-red-800'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {isSelected ? '→ ' : '  '}
                    {option.text}
                    {isCorrect ? ' ✓' : ''}
                  </p>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
