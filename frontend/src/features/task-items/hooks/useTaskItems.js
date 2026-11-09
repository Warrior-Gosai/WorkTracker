import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskItemService from '../services/taskItemService';
import { toast } from 'react-toastify';

export const TASK_ITEM_KEYS = {
  all: ['taskItems'],
  list: (params) => ['taskItems', 'list', params],
  detail: (id) => ['taskItems', 'detail', id],
  history: (id) => ['taskItems', 'history', id],
};

/**
 * Hook to retrieve paginated and filtered active task items
 */
export function useTaskItems(params = {}) {
  return useQuery({
    queryKey: TASK_ITEM_KEYS.list(params),
    queryFn: () => taskItemService.getTaskItems(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to retrieve single task item details
 */
export function useTaskItemDetails(taskItemId) {
  return useQuery({
    queryKey: TASK_ITEM_KEYS.detail(taskItemId),
    queryFn: () => taskItemService.getTaskItemById(taskItemId),
    enabled: Boolean(taskItemId),
  });
}

/**
 * Hook to retrieve task item history (work logs, code changes, DB changes)
 */
export function useTaskItemHistory(taskItemId) {
  return useQuery({
    queryKey: TASK_ITEM_KEYS.history(taskItemId),
    queryFn: () => taskItemService.getTaskItemHistory(taskItemId),
    enabled: Boolean(taskItemId),
  });
}

/**
 * Hook to create a new task item
 */
export function useCreateTaskItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => taskItemService.createTaskItem(data),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.all });
      toast.success(`Task Item ${newTask.taskItemCode} created successfully!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to create task item';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update task item details
 */
export function useUpdateTaskItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskItemId, data }) => taskItemService.updateTaskItem(taskItemId, data),
    onSuccess: (updatedTask, { taskItemId }) => {
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.detail(taskItemId) });
      toast.success(`Task Item ${updatedTask.taskItemCode} updated successfully!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to update task item';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update task item workflow status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskItemId, status }) => taskItemService.updateTaskStatus(taskItemId, status),
    onSuccess: (updatedTask, { taskItemId }) => {
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.detail(taskItemId) });
      toast.success(`Task Item ${updatedTask.taskItemCode} status updated to ${updatedTask.status}!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    },
  });
}

/**
 * Hook to deactivate task item
 */
export function useDeactivateTaskItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskItemId) => taskItemService.deactivateTaskItem(taskItemId),
    onSuccess: (deactivatedTask, taskItemId) => {
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_ITEM_KEYS.detail(taskItemId) });
      toast.info(`Task Item ${deactivatedTask.taskItemCode} deactivated.`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to deactivate task item';
      toast.error(msg);
    },
  });
}

