'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminJobsApi,
  jobsApi,
  type CreateJobPayload,
  type JobFilters,
} from '../api/jobs-api';

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', 'list', filters],
    queryFn: () => jobsApi.list(filters),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
}

export function useAdminJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['admin', 'jobs', filters],
    queryFn: () => adminJobsApi.list(filters),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobPayload) => adminJobsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateJobPayload & { isActive: boolean }>;
    }) => adminJobsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJobsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
