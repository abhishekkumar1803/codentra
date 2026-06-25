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
  Skeleton,
} from '@codentra/ui';
import { ApiError } from '@/shared/lib/api-client';
import { useQuizSession, useSubmitQuiz } from '../hooks/use-quizzes';

export function QuizTakeView({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: session, isLoading, error } = useQuizSession(slug);
  const submitQuiz = useSubmitQuiz();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error instanceof ApiError && error.code === 'QUIZ_ALREADY_SUBMITTED') {
    router.replace(`/contests/${slug}/quiz/results`);
    return null;
  }

  if (error || !session) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Unable to load quiz. Register and wait for the contest to go live.';
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{message}</p>
          <Link href={`/contests/${slug}`} className="mt-4 inline-block">
            <Button variant="outline">Back to contest</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const allAnswered =
    session.questions.length > 0 &&
    session.questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered) return;
    submitQuiz.mutate(
      {
        contestId: session.contestId,
        payload: {
          answers: session.questions.map((q) => ({
            questionId: q.id,
            optionId: answers[q.id]!,
          })),
        },
      },
      {
        onSuccess: () => {
          router.push(`/contests/${slug}/quiz/results`);
        },
      },
    );
  };

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
          {session.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {session.questions.length} questions · {session.durationMinutes} min
        </p>
      </div>

      {submitQuiz.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitQuiz.error instanceof ApiError
            ? submitQuiz.error.message
            : 'Failed to submit quiz. Please try again.'}
        </div>
      )}

      <div className="space-y-4">
        {session.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.text}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({question.points} pt{question.points !== 1 ? 's' : ''})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: option.id,
                      }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{option.text}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitQuiz.isPending}
        >
          {submitQuiz.isPending ? 'Submitting...' : 'Submit quiz'}
        </Button>
      </div>
    </div>
  );
}
