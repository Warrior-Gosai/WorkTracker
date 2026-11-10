import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pendingTaskService } from './pendingTaskService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('pendingTaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPendingTasks should call GET /pending-tasks with cleaned params', async () => {
    const mockData = {
      content: [{ pendingTaskId: 1, pendingTaskCode: 'PT-000001' }],
      totalElements: 1,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'index tuning', priority: 'HIGH', emptyKey: '' };
    const result = await pendingTaskService.getPendingTasks(params);

    expect(apiClient.get).toHaveBeenCalledWith('/pending-tasks', {
      params: { page: 0, size: 10, search: 'index tuning', priority: 'HIGH' },
    });
    expect(result).toEqual(mockData);
  });

  it('getPendingTaskById should call GET /pending-tasks/{id}', async () => {
    const mockTask = { pendingTaskId: 5, pendingTaskCode: 'PT-000005' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockTask } });

    const result = await pendingTaskService.getPendingTaskById(5);

    expect(apiClient.get).toHaveBeenCalledWith('/pending-tasks/5');
    expect(result).toEqual(mockTask);
  });

  it('createPendingTask should call POST /pending-tasks with payload', async () => {
    const payload = {
      projectId: 1,
      title: 'Fix flaky test',
      description: 'Review async timeout',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: '2026-11-25',
    };
    const mockCreated = { pendingTaskId: 1, pendingTaskCode: 'PT-000001', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await pendingTaskService.createPendingTask(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/pending-tasks', {
      ...payload,
      remarks: null,
    });
    expect(result).toEqual(mockCreated);
  });

  it('updatePendingTask should call PUT /pending-tasks/{id} with payload', async () => {
    const payload = {
      title: 'Updated title',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: '2026-12-01',
    };
    const mockUpdated = { pendingTaskId: 5, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await pendingTaskService.updatePendingTask(5, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/pending-tasks/5', {
      ...payload,
      description: null,
      remarks: null,
    });
    expect(result).toEqual(mockUpdated);
  });

  it('updatePendingTaskStatus should call PATCH /pending-tasks/{id}/status', async () => {
    const payload = { status: 'COMPLETED' };
    const mockResult = { pendingTaskId: 5, status: 'COMPLETED' };
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: mockResult } });

    const result = await pendingTaskService.updatePendingTaskStatus(5, payload);

    expect(apiClient.patch).toHaveBeenCalledWith('/pending-tasks/5/status', payload);
    expect(result).toEqual(mockResult);
  });
});
