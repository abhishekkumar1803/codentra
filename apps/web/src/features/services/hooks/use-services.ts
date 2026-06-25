import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/services-api';

export function useServiceCatalog() {
  return useQuery({
    queryKey: ['services', 'catalog'],
    queryFn: servicesApi.getCatalog,
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['services', 'me'],
    queryFn: servicesApi.getMyBookings,
  });
}

export function useBookService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.book,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'me'] });
    },
  });
}

export function useMentorAssignments() {
  return useQuery({
    queryKey: ['mentor', 'assignments'],
    queryFn: servicesApi.getMentorAssignments,
  });
}
