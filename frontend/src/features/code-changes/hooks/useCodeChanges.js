import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import codeChangeService from '../services/codeChangeService';
import { toast } from 'react-toastify';

export const CODE_CHANGE_KEYS = {
  all: ['codeChanges'],
  list: (params) => ['codeChanges', 'list', params],
  detail: (id) => ['codeChanges', 'detail', id],
};

export function useCodeChanges(params = {}) {
  return useQuery({
    queryKey: CODE_CHANGE_KEYS.list(params),
    queryFn: () => codeChangeService.getCodeChanges(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCodeChangeDetails(codeChangeId) {
  return useQuery({
    queryKey: CODE_CHANGE_KEYS.detail(codeChangeId),
    queryFn: () => codeChangeService.getCodeChangeById(codeChangeId),
    enabled: Boolean(codeChangeId),
  });
}

export function useCreateCodeChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => codeChangeService.createCodeChange(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Code change ${data.codeChangeCode || ''} created successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create code change';
      toast.error(message);
    },
  });
}

export function useUpdateCodeChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeChangeId, data }) => codeChangeService.updateCodeChange(codeChangeId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['taskItems', 'history'] });
      toast.success(`Code change ${data.codeChangeCode || ''} updated successfully!`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update code change';
      toast.error(message);
    },
  });
}

export function useAddCodeChangeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeChangeId, fileData }) => codeChangeService.addFile(codeChangeId, fileData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.detail(variables.codeChangeId) });
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.all });
      toast.success('File entry added successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add file entry';
      toast.error(message);
    },
  });
}

export function useUpdateCodeChangeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeChangeId, fileId, fileData }) =>
      codeChangeService.updateFile(codeChangeId, fileId, fileData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.detail(variables.codeChangeId) });
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.all });
      toast.success('File entry updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update file entry';
      toast.error(message);
    },
  });
}

export function useDeleteCodeChangeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codeChangeId, fileId }) => codeChangeService.deleteFile(codeChangeId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.detail(variables.codeChangeId) });
      queryClient.invalidateQueries({ queryKey: CODE_CHANGE_KEYS.all });
      toast.success('File entry deleted successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete file entry';
      toast.error(message);
    },
  });
}
