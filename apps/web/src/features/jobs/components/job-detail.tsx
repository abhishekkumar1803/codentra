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
import { useJob } from '@/features/jobs/hooks/use-jobs';

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `₹${(n / 100000).toFixed(0)}L per year`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function JobDetailView({ id }: { id: string }) {
  const { data: job, isLoading, error } = useJob(id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (error || !job) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Job not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to jobs
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <p className="mt-1 text-lg text-primary">{job.company}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {job.jobType.replace('_', ' ')}
            {job.location ? ` · ${job.location}` : ''}
          </p>
          {formatSalary(job.salaryMin, job.salaryMax) && (
            <p className="mt-1 text-sm font-medium">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
          )}
        </div>
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          <Button>Apply now</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {job.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
