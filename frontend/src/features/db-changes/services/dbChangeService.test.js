import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbChangeService } from './dbChangeService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('dbChangeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDbChanges should call GET /db-changes with query params', async () => {
    const mockData = {
      content: [{ dbChangeId: 1, dbChangeCode: 'DB-000001' }],
      totalElements: 1,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'app_user', environment: 'LOCAL' };
    const result = await dbChangeService.getDbChanges(params);

    expect(apiClient.get).toHaveBeenCalledWith('/db-changes', { params });
    expect(result).toEqual(mockData);
  });

  it('getDbChangeById should call GET /db-changes/{id}', async () => {
    const mockDbChange = { dbChangeId: 10, dbChangeCode: 'DB-000010' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockDbChange } });

    const result = await dbChangeService.getDbChangeById(10);

    expect(apiClient.get).toHaveBeenCalledWith('/db-changes/10');
    expect(result).toEqual(mockDbChange);
  });

  it('createDbChange should call POST /db-changes with payload', async () => {
    const payload = {
      workLogId: 1,
      environment: 'LOCAL',
      databaseName: 'PostgreSQL',
      objectType: 'Table',
      objectName: 'app_user',
      whyChanged: 'Security requirement',
    };
    const mockCreated = { dbChangeId: 10, dbChangeCode: 'DB-000010', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await dbChangeService.createDbChange(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/db-changes', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateDbChange should call PUT /db-changes/{id} with payload', async () => {
    const payload = {
      environment: 'UAT',
      databaseName: 'Oracle',
      objectType: 'View',
      objectName: 'vw_user_report',
      whyChanged: 'Updated reporting',
    };
    const mockUpdated = { dbChangeId: 10, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await dbChangeService.updateDbChange(10, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/db-changes/10', payload);
    expect(result).toEqual(mockUpdated);
  });
});
