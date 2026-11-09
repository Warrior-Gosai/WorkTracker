import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workLogService } from './workLogService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('workLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getWorkLogs should call GET /work-logs with query params', async () => {
    const mockData = { content: [{ workLogId: 1, workLogCode: 'WL-000001' }], totalElements: 1 };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'JWT' };
    const result = await workLogService.getWorkLogs(params);

    expect(apiClient.get).toHaveBeenCalledWith('/work-logs', { params });
    expect(result).toEqual(mockData);
  });

  it('getWorkLogById should call GET /work-logs/{id}', async () => {
    const mockWorkLog = { workLogId: 100, workLogCode: 'WL-000001' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockWorkLog } });

    const result = await workLogService.getWorkLogById(100);

    expect(apiClient.get).toHaveBeenCalledWith('/work-logs/100');
    expect(result).toEqual(mockWorkLog);
  });

  it('createWorkLog should call POST /work-logs with payload', async () => {
    const payload = {
      taskItemId: 10,
      workType: 'DEVELOPMENT',
      taskRequirement: 'Implement Work Log module',
    };
    const mockCreated = { workLogId: 101, workLogCode: 'WL-000002', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await workLogService.createWorkLog(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/work-logs', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateWorkLog should call PUT /work-logs/{id} with payload', async () => {
    const payload = {
      workType: 'BUG_FIXING',
      taskRequirement: 'Updated Requirement',
    };
    const mockUpdated = { workLogId: 100, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await workLogService.updateWorkLog(100, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/work-logs/100', payload);
    expect(result).toEqual(mockUpdated);
  });
});

