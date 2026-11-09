import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';
import { toast } from 'react-toastify';

export const PROJECT_KEYS = {
  all: ['projects'],
  list: (params) => ['projects', 'list', params],
  detail: (id) => ['projects', 'detail', id],
};

/**
 * Hook to retrieve paginated and filtered projects
 */
export function useProjects(params = {}) {
  return useQuery({
    queryKey: PROJECT_KEYS.list(params),
    queryFn: () => projectService.getProjects(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to retrieve single project details
 */
export function useProjectDetails(projectId) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(projectId),
    queryFn: () => projectService.getProjectById(projectId),
    enabled: Boolean(projectId),
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => projectService.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      toast.success(`Project ${newProject.projectCode} created successfully!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to create project';
      toast.error(msg);
    },
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }) => projectService.updateProject(projectId, data),
    onSuccess: (updatedProject, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success(`Project ${updatedProject.projectCode} updated successfully!`);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to update project';
      toast.error(msg);
    },
  });
}

