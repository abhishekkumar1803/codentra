'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@codentra/ui';
import {
  useAdminContest,
  useCreateContest,
  useUpdateContest,
} from '../hooks/use-admin-contests';
import { AdminQuizQuestions } from './admin-quiz-questions';
import { AdminProblemManager } from './admin-problem-manager';

const contestTypes = [
  { value: 'DSA', label: 'DSA' },
  { value: 'COMPETITIVE_PROGRAMMING', label: 'Competitive Programming' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'QUIZ', label: 'Quiz' },
];

const contestStatuses = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'LIVE', label: 'Live' },
  { value: 'ENDED', label: 'Ended' },
];

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminContestForm({ contestId }: { contestId?: string }) {
  const router = useRouter();
  const isEdit = !!contestId;
  const { data: existing } = useAdminContest(contestId ?? '');
  const createContest = useCreateContest();
  const updateContest = useUpdateContest();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('QUIZ');
  const [status, setStatus] = useState('DRAFT');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [maxParticipants, setMaxParticipants] = useState('');

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setType(existing.type);
    setStatus(existing.status);
    setStartTime(toDatetimeLocal(existing.startTime));
    setEndTime(toDatetimeLocal(existing.endTime));
    setDurationMinutes(String(existing.durationMinutes));
    setMaxParticipants(
      existing.maxParticipants ? String(existing.maxParticipants) : '',
    );
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      type,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMinutes: parseInt(durationMinutes, 10),
      ...(maxParticipants
        ? { maxParticipants: parseInt(maxParticipants, 10) }
        : {}),
    };

    if (isEdit && contestId) {
      updateContest.mutate(
        { id: contestId, payload: { ...payload, status } },
        {
          onSuccess: () => router.push('/admin/contests'),
        },
      );
    } else {
      createContest.mutate(payload, {
        onSuccess: (data) => router.push(`/admin/contests/${data.id}`),
      });
    }
  };

  const pending = createContest.isPending || updateContest.isPending;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/contests"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to contests
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {isEdit ? 'Edit contest' : 'New contest'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {contestTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {contestStatuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Create contest'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isEdit && contestId && type === 'QUIZ' && (
        <AdminQuizQuestions contestId={contestId} />
      )}

      {isEdit &&
        contestId &&
        (type === 'DSA' || type === 'COMPETITIVE_PROGRAMMING') && (
          <AdminProblemManager contestId={contestId} />
        )}
    </div>
  );
}
