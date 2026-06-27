import type {
  ActivityLogItem,
  AdminDashboardMetrics,
  AdminPaymentListItem,
  AdminSubscriptionListItem,
  AdminUserDetail,
  AdminUserListItem,
} from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const adminApi = {
  getDashboard: () => api.get<AdminDashboardMetrics>('/admin/dashboard'),

  listUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.search) search.set('search', params.search);
    if (params?.role) search.set('role', params.role);
    if (params?.status) search.set('status', params.status);
    const qs = search.toString();
    return api.get<{
      items: AdminUserListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  getUser: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`),

  updateUser: (id: string, payload: { role?: string; isActive?: boolean }) =>
    api.patch<AdminUserListItem>(`/admin/users/${id}`, payload),

  listSubscriptions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.status) search.set('status', params.status);
    const qs = search.toString();
    return api.get<{
      items: AdminSubscriptionListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/subscriptions${qs ? `?${qs}` : ''}`);
  },

  listPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.status) search.set('status', params.status);
    if (params?.type) search.set('type', params.type);
    const qs = search.toString();
    return api.get<{
      items: AdminPaymentListItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/payments${qs ? `?${qs}` : ''}`);
  },

  listActivityLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.action) search.set('action', params.action);
    if (params?.userId) search.set('userId', params.userId);
    const qs = search.toString();
    return api.get<{
      items: ActivityLogItem[];
      meta: { page: number; limit: number; total: number };
    }>(`/admin/activity-logs${qs ? `?${qs}` : ''}`);
  },
};
