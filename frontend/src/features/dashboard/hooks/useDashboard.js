import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

export const DASHBOARD_KEYS = {
  all: ['dashboard'],
  summary: () => ['dashboard', 'summary'],
  workSummary: (params) => ['dashboard', 'work-summary', params],
  projectSummary: () => ['dashboard', 'project-summary'],
  pendingSummary: () => ['dashboard', 'pending-summary'],
  recentActivities: (limit) => ['dashboard', 'recent-activities', limit],
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(),
    queryFn: () => dashboardService.getSummary(),
    staleTime: 30000,
  });
}

export function useWorkSummary(params = {}) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.workSummary(params),
    queryFn: () => dashboardService.getWorkSummary(params),
    staleTime: 30000,
  });
}

export function useProjectSummary() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.projectSummary(),
    queryFn: () => dashboardService.getProjectSummary(),
    staleTime: 30000,
  });
}

export function usePendingSummary() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.pendingSummary(),
    queryFn: () => dashboardService.getPendingSummary(),
    staleTime: 30000,
  });
}

export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.recentActivities(limit),
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 20000,
  });
}
