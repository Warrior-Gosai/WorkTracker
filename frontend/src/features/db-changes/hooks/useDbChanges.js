import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dbChangeService from '../services/dbChangeService';
import { toast } from 'react-toastify';

export const DB_CHANGE_KEYS = {
  all: ['dbChanges'],
  list: (params) => ['dbChanges', 'list', params],
  detail: (id) => ['dbChanges', 'detail', id],
};

export function useDbChanges(params = {}) {
  return useQuery({
    queryKey: DB_CHANGE_KEYS.list(params),
    queryFn: () => dbChangeService.getDbChanges(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useDbChangeDetails(dbChangeId) {
  return useQuery({
    queryKey: DB_CHANGE_KEYS.detail(dbChangeId),
    queryFn: () => dbChangeService.getDbChangeById(dbChangeId),
    enabled: Boolean(dbChangeId),
  });
}

export function useCreateDbChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => dbChangeService.createDbChange(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DB_CHANGE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Database change ${data.dbChangeCode || ''} created successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create database change';
      toast.error(message);
    },
  });
}

export function useUpdateDbChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dbChangeId, data }) => dbChangeService.updateDbChange(dbChangeId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DB_CHANGE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Database change ${data.dbChangeCode || ''} updated successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update database change';
      toast.error(message);
    },
  });
}
