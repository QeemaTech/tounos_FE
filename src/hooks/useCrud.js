import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCrudList(key, apiFn, params = {}) {
  return useQuery({
    queryKey: [key, params],
    queryFn: () => apiFn(params).then((r) => r.data),
    keepPreviousData: true,
  });
}

export function useCrudDetail(key, apiFn, id) {
  return useQuery({
    queryKey: [key, id],
    queryFn: () => apiFn(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCrudCreate(key, apiFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiFn(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useCrudUpdate(key, apiFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => apiFn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useCrudDelete(key, apiFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}
