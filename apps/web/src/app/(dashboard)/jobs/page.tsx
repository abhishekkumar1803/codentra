'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@codentra/ui';
import { useJobs } from '@/features/jobs/hooks/use-jobs';

const jobTypes = [
  { value: '', label: 'All' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `₹${(n / 100000).toFixed(0)}L`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export default function JobsPage() {
  const [jobType, setJobType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading, error } = useJobs({
    jobType: jobType || undefined,
    search: query || undefined,
    limit: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="mt-1 text-muted-foreground">
          Curated openings from top companies. Membership required.
        </p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
      >
        <input
          className="flex h-10 min-w-[200px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {jobTypes.map((t) => (
          <Button
            key={t.value || 'all'}
            size="sm"
            variant={jobType === t.value ? 'default' : 'outline'}
            onClick={() => setJobType(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load jobs. Active subscription required.
          </CardContent>
        </Card>
      )}

      {data?.items.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No jobs found. Check back soon!
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.items.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm font-medium text-primary">
                  {job.company}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {job.jobType.replace('_', ' ')}
                  {job.location ? ` · ${job.location}` : ''}
                </p>
                {formatSalary(job.salaryMin, job.salaryMax) && (
                  <p>{formatSalary(job.salaryMin, job.salaryMax)}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
