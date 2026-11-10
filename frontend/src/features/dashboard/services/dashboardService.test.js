import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboardService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSummary should call GET /dashboard/summary and return data', async () => {
    const mockSummary = {
      totalProjects: 5,
      activeProjects: 4,
      totalTaskItems: 80,
      openTaskItems: 20,
      totalWorkLogs: 150,
      totalPendingTasks: 12,
      overduePendingTasks: 3,
      uncommittedCodeChanges: 4,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockSummary } });

    const result = await dashboardService.getSummary();

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/summary');
    expect(result).toEqual(mockSummary);
  });

  it('getWorkSummary should call GET /dashboard/work-summary with cleaned params', async () => {
    const mockWork = {
      totalWorkLogs: 10,
      totalHours: 45.5,
      completedWorkLogs: 6,
      inProgressWorkLogs: 3,
      blockedWorkLogs: 1,
      onHoldWorkLogs: 0,
      dailySummaries: [],
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockWork } });

    const params = { dateFrom: '2026-11-01', dateTo: '2026-11-10', projectId: 1, emptyKey: '' };
    const result = await dashboardService.getWorkSummary(params);

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/work-summary', {
      params: { dateFrom: '2026-11-01', dateTo: '2026-11-10', projectId: 1 },
    });
    expect(result).toEqual(mockWork);
  });

  it('getProjectSummary should call GET /dashboard/project-summary', async () => {
    const mockProjects = [
      {
        projectId: 1,
        projectCode: 'PRJ-000001',
        projectName: 'FlowTrack',
        projectStatus: 1,
        totalTaskItems: 20,
        openTaskItems: 5,
        completedTaskItems: 12,
        totalWorkLogs: 45,
      },
    ];
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockProjects } });

    const result = await dashboardService.getProjectSummary();

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/project-summary');
    expect(result).toEqual(mockProjects);
  });

  it('getPendingSummary should call GET /dashboard/pending-summary', async () => {
    const mockPending = {
      pending: 5,
      inProgress: 3,
      onHold: 2,
      completed: 7,
      cancelled: 1,
      overdue: 2,
      total: 18,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockPending } });

    const result = await dashboardService.getPendingSummary();

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/pending-summary');
    expect(result).toEqual(mockPending);
  });

  it('getRecentActivities should call GET /dashboard/recent-activities with limit', async () => {
    const mockActivities = [
      {
        activityType: 'TASK_ITEM',
        recordId: 10,
        recordCode: 'TASK-000001',
        title: 'Task Title',
        activityDate: '2026-11-10T18:00:00Z',
        navigationTarget: '/task-items/10',
      },
    ];
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockActivities } });

    const result = await dashboardService.getRecentActivities(15);

    expect(apiClient.get).toHaveBeenCalledWith('/dashboard/recent-activities', {
      params: { limit: 15 },
    });
    expect(result).toEqual(mockActivities);
  });
});
