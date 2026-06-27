'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Skeleton,
} from '@codentra/ui';
import {
  useAdminJobs,
  useCreateJob,
  useDeleteJob,
} from '@/features/jobs/hooks/use-jobs';

export function AdminJobList() {
  const { data, isLoading } = useAdminJobs({ limit: 50 });
  const deleteJob = useDeleteJob();
  const [showForm, setShowForm] = useState(false);
  const createJob = useCreateJob();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('REMOTE');
  const [applyUrl, setApplyUrl] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createJob.mutate(
      {
        title,
        company,
        description,
        location: location || undefined,
        jobType,
        applyUrl,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setTitle('');
          setCompany('');
          setDescription('');
          setLocation('');
          setApplyUrl('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Create and curate job listings.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New job'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={20}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Apply URL</Label>
                  <Input
                    type="url"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={createJob.isPending}>
                {createJob.isPending ? 'Creating...' : 'Create job'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="space-y-3">
          {data?.items.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">
                    {job.title} · {job.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.jobType} · {job.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      View apply link
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this job?')) deleteJob.mutate(job.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
