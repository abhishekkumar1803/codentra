import type { NotificationItem } from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.unreadOnly) search.set('unreadOnly', 'true');
    const qs = search.toString();
    return api.get<{
      items: NotificationItem[];
      meta: {
        page: number;
        limit: number;
        total: number;
        unreadCount: number;
      };
    }>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markRead: (id: string) =>
    api.patch<NotificationItem>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post<{ markedCount: number }>('/notifications/read-all'),
};
