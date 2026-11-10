import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pendingTaskService from '../services/pendingTaskService';
import { toast } from 'react-toastify';

export const PENDING_TASK_KEYS = {
  all: ['pendingTasks'],
  list: (params) => ['pendingTasks', 'list', params],
  detail: (id) => ['pendingTasks', 'detail', id],
};

export function usePendingTasks(params = {}) {
  return useQuery({
    queryKey: PENDING_TASK_KEYS.list(params),
    queryFn: () => pendingTaskService.getPendingTasks(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePendingTaskDetails(pendingTaskId) {
  return useQuery({
    queryKey: PENDING_TASK_KEYS.detail(pendingTaskId),
    queryFn: () => pendingTaskService.getPendingTaskById(pendingTaskId),
    enabled: Boolean(pendingTaskId),
  });
}

export function useCreatePendingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => pendingTaskService.createPendingTask(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PENDING_TASK_KEYS.all });
      toast.success(`Pending task ${data.pendingTaskCode || ''} created successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create pending task';
      toast.error(message);
    },
  });
}

export function useUpdatePendingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pendingTaskId, data }) => pendingTaskService.updatePendingTask(pendingTaskId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PENDING_TASK_KEYS.all });
      toast.success(`Pending task ${data.pendingTaskCode || ''} updated successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update pending task';
      toast.error(message);
    },
  });
}

export function useUpdatePendingTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pendingTaskId, data }) => pendingTaskService.updatePendingTaskStatus(pendingTaskId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PENDING_TASK_KEYS.all });
      toast.success(`Status updated to ${data.status || ''}!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update pending task status';
      toast.error(message);
    },
  });
}
