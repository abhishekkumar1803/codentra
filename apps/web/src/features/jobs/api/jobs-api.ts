import type { JobListItem } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export type JobFilters = {
  page?: number;
  limit?: number;
  jobType?: string;
  search?: string;
  company?: string;
};

export type CreateJobPayload = {
  title: string;
  company: string;
  description: string;
  location?: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  applyUrl: string;
};

export const jobsApi = {
  list: (filters?: JobFilters) => {
    const search = new URLSearchParams();
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.limit) search.set('limit', String(filters.limit));
    if (filters?.jobType) search.set('jobType', filters.jobType);
    if (filters?.search) search.set('search', filters.search);
    if (filters?.company) search.set('company', filters.company);
    const qs = search.toString();
    return api.get<{
      items: JobListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/jobs${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api.get<JobListItem>(`/jobs/${id}`),
};

export const adminJobsApi = {
  list: (filters?: JobFilters) => {
    const search = new URLSearchParams();
    if (filters?.page) search.set('page', String(filters.page));
    if (filters?.search) search.set('search', filters.search);
    const qs = search.toString();
    return api.get<{
      items: JobListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/jobs${qs ? `?${qs}` : ''}`);
  },

  create: (payload: CreateJobPayload) =>
    api.post<JobListItem>('/admin/jobs', payload),

  update: (id: string, payload: Partial<CreateJobPayload & { isActive: boolean }>) =>
    api.patch<JobListItem>(`/admin/jobs/${id}`, payload),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/admin/jobs/${id}`),
};
