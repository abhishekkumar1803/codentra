import type {
  MentorAssignment,
  ServiceBooking,
  ServiceCatalogItem,
} from '@codentra/types';
import { api } from '@/shared/lib/api-client';

export const servicesApi = {
  getCatalog: () =>
    api.get<{ items: ServiceCatalogItem[] }>('/services/catalog'),

  book: (body: {
    type: string;
    preferredDate?: string;
    notes?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
  }) =>
    api.post<{ booking: unknown; payment: unknown }>('/services/book', body),

  getMyBookings: () => api.get<{ items: ServiceBooking[] }>('/services/me'),

  getMentorAssignments: () =>
    api.get<{ items: MentorAssignment[] }>('/mentor/assignments'),
};
