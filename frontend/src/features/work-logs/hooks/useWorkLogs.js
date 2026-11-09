import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workLogService } from '../services/workLogService';
import { toast } from 'react-toastify';

export const WORK_LOG_KEYS = {
  all: ['workLogs'],
  list: (params) => ['workLogs', 'list', params],
  detail: (id) => ['workLogs', 'detail', id],
};

/**
 * Hook to retrieve paginated and filtered work logs
 */
export function useWorkLogs(params = {}) {
  return useQuery({
    queryKey: WORK_LOG_KEYS.list(params),
    queryFn: () => workLogService.getWorkLogs(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to retrieve single work log details
 */
export function useWorkLogDetails(workLogId) {
  return useQuery({
    queryKey: WORK_LOG_KEYS.detail(workLogId),
    queryFn: () => workLogService.getWorkLogById(workLogId),
    enabled: Boolean(workLogId),
  });
}

/**
 * Hook to create a new work log
 */
export function useCreateWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => workLogService.createWorkLog(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WORK_LOG_KEYS.all });
      // Invalidate task item history as well so task item detail page shows new work log
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Work log ${data.workLogCode || ''} created successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create work log';
      toast.error(message);
    },
  });
}

/**
 * Hook to update an existing work log
 */
export function useUpdateWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workLogId, data }) => workLogService.updateWorkLog(workLogId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WORK_LOG_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Work log ${data.workLogCode || ''} updated successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update work log';
      toast.error(message);
    },
  });
}

