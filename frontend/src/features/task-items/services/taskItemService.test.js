import { describe, it, expect, vi, beforeEach } from 'vitest';
import taskItemService from './taskItemService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('taskItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTaskItems should call GET /task-items with query params', async () => {
    const mockData = { content: [{ taskItemId: 1, title: 'Task 1' }], totalElements: 1 };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'Task' };
    const result = await taskItemService.getTaskItems(params);

    expect(apiClient.get).toHaveBeenCalledWith('/task-items', { params });
    expect(result).toEqual(mockData);
  });

  it('getTaskItemById should call GET /task-items/{id}', async () => {
    const mockTask = { taskItemId: 10, taskItemCode: 'TASK-000001' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockTask } });

    const result = await taskItemService.getTaskItemById(10);

    expect(apiClient.get).toHaveBeenCalledWith('/task-items/10');
    expect(result).toEqual(mockTask);
  });

  it('createTaskItem should call POST /task-items with payload', async () => {
    const payload = { projectId: 1, taskType: 'FEATURE_DEVELOPMENT', title: 'New Task' };
    const mockCreated = { taskItemId: 11, taskItemCode: 'TASK-000002', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await taskItemService.createTaskItem(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/task-items', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateTaskItem should call PUT /task-items/{id}', async () => {
    const payload = { taskType: 'BUG_FIX', title: 'Updated Task', priority: 'HIGH' };
    const mockUpdated = { taskItemId: 10, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await taskItemService.updateTaskItem(10, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/task-items/10', payload);
    expect(result).toEqual(mockUpdated);
  });

  it('updateTaskStatus should call PATCH /task-items/{id}/status', async () => {
    const mockUpdated = { taskItemId: 10, status: 'COMPLETED' };
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await taskItemService.updateTaskStatus(10, 'COMPLETED');

    expect(apiClient.patch).toHaveBeenCalledWith('/task-items/10/status', { status: 'COMPLETED' });
    expect(result).toEqual(mockUpdated);
  });

  it('deactivateTaskItem should call PATCH /task-items/{id}/deactivate', async () => {
    const mockDeactivated = { taskItemId: 10, isActive: 0 };
    apiClient.patch.mockResolvedValueOnce({ data: { success: true, data: mockDeactivated } });

    const result = await taskItemService.deactivateTaskItem(10);

    expect(apiClient.patch).toHaveBeenCalledWith('/task-items/10/deactivate');
    expect(result).toEqual(mockDeactivated);
  });

  it('getTaskItemHistory should call GET /task-items/{id}/history', async () => {
    const mockHistory = { taskItemId: 10, workLogs: [] };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockHistory } });

    const result = await taskItemService.getTaskItemHistory(10);

    expect(apiClient.get).toHaveBeenCalledWith('/task-items/10/history');
    expect(result).toEqual(mockHistory);
  });
});

