'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@codentra/ui';
import { adminProblemsApi } from '../api/admin-problems-api';

export function AdminProblemManager({ contestId }: { contestId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'problems', contestId],
    queryFn: () => adminProblemsApi.list(contestId),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [points, setPoints] = useState('100');
  const [difficulty, setDifficulty] = useState('EASY');

  const [tcProblemId, setTcProblemId] = useState('');
  const [tcInput, setTcInput] = useState('');
  const [tcOutput, setTcOutput] = useState('');
  const [tcSample, setTcSample] = useState(true);

  const createProblem = useMutation({
    mutationFn: () =>
      adminProblemsApi.create(contestId, {
        title,
        description,
        inputFormat,
        outputFormat,
        difficulty,
        points: parseInt(points, 10),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'problems', contestId],
      });
      setTitle('');
      setDescription('');
      setInputFormat('');
      setOutputFormat('');
    },
  });

  const addTestCase = useMutation({
    mutationFn: () =>
      adminProblemsApi.addTestCase(contestId, tcProblemId, {
        input: tcInput,
        output: tcOutput,
        isSample: tcSample,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'problems', contestId],
      });
      setTcInput('');
      setTcOutput('');
    },
  });

  const deleteProblem = useMutation({
    mutationFn: (problemId: string) =>
      adminProblemsApi.deleteProblem(contestId, problemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'problems', contestId],
      });
    },
  });

  const deleteTestCase = useMutation({
    mutationFn: ({
      problemId,
      testCaseId,
    }: {
      problemId: string;
      testCaseId: string;
    }) => adminProblemsApi.deleteTestCase(contestId, problemId, testCaseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'problems', contestId],
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add coding problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Points</Label>
              <Input value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <textarea
              className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Input format</Label>
              <Input
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Output format</Label>
              <Input
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Difficulty</Label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <Button
            onClick={() => createProblem.mutate()}
            disabled={createProblem.isPending || !title || !description}
          >
            {createProblem.isPending ? 'Creating...' : 'Add problem'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add test case</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Problem</Label>
            <select
              value={tcProblemId}
              onChange={(e) => setTcProblemId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select problem</option>
              {data?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Input</Label>
              <textarea
                className="min-h-[60px] w-full rounded-md border px-3 py-2 font-mono text-sm"
                value={tcInput}
                onChange={(e) => setTcInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Expected output</Label>
              <textarea
                className="min-h-[60px] w-full rounded-md border px-3 py-2 font-mono text-sm"
                value={tcOutput}
                onChange={(e) => setTcOutput(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={tcSample}
              onChange={(e) => setTcSample(e.target.checked)}
            />
            Sample test case (visible in problem statement)
          </label>
          <Button
            onClick={() => addTestCase.mutate()}
            disabled={addTestCase.isPending || !tcProblemId || !tcInput}
          >
            {addTestCase.isPending ? 'Adding...' : 'Add test case'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problems ({data?.items.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && !data?.items.length && (
            <p className="text-sm text-muted-foreground">No problems yet.</p>
          )}
          <div className="space-y-4">
            {data?.items.map((problem) => (
              <div key={problem.id} className="rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{problem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {problem.difficulty} · {problem.points} pts ·{' '}
                      {problem._count.submissions} submissions
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteProblem.mutate(problem.id)}
                  >
                    Delete
                  </Button>
                </div>
                <ul className="mt-3 space-y-1 text-xs">
                  {problem.testCases.map((tc) => (
                    <li
                      key={tc.id}
                      className="flex items-center justify-between rounded bg-muted/40 px-2 py-1 font-mono"
                    >
                      <span>
                        {tc.isSample ? 'Sample' : 'Hidden'}: {tc.input} →{' '}
                        {tc.output}
                      </span>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          deleteTestCase.mutate({
                            problemId: problem.id,
                            testCaseId: tc.id,
                          })
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
