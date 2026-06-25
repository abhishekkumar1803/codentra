'use client';

import { useState } from 'react';
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
import {
  useAdminQuizQuestions,
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
} from '../hooks/use-admin-contests';

export function AdminQuizQuestions({ contestId }: { contestId: string }) {
  const { data, isLoading } = useAdminQuizQuestions(contestId);
  const createQuestion = useCreateQuizQuestion();
  const deleteQuestion = useDeleteQuizQuestion();

  const [text, setText] = useState('');
  const [points, setPoints] = useState('1');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const orderIndex = data?.items.length ?? 0;
    createQuestion.mutate(
      {
        contestId,
        payload: {
          text,
          points: parseInt(points, 10),
          orderIndex,
          options: options.map((o, i) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            orderIndex: i,
          })),
        },
      },
      {
        onSuccess: () => {
          setText('');
          setPoints('1');
          setOptions([
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]);
        },
      },
    );
  };

  const setCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, isCorrect: i === index })),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <ul className="space-y-3">
            {data?.items.map((q, qi) => (
              <li
                key={q.id}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {qi + 1}. {q.text}{' '}
                      <span className="text-muted-foreground">
                        ({q.points} pts)
                      </span>
                    </p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {q.options.map((o) => (
                        <li key={o.id}>
                          {o.isCorrect ? '✓ ' : '  '}
                          {o.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      deleteQuestion.mutate({
                        contestId,
                        questionId: q.id,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {!data?.items.length && (
              <p className="text-sm text-muted-foreground">
                No questions yet. Add your first question below.
              </p>
            )}
          </ul>
        )}

        <form onSubmit={handleAdd} className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label>Question text</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="space-y-2">
            <Label>Options (select correct answer)</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={opt.isCorrect}
                  onChange={() => setCorrect(i)}
                />
                <Input
                  value={opt.text}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, j) =>
                        j === i ? { ...o, text: e.target.value } : o,
                      ),
                    )
                  }
                  placeholder={`Option ${i + 1}`}
                  required
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={createQuestion.isPending}>
            {createQuestion.isPending ? 'Adding...' : 'Add question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
