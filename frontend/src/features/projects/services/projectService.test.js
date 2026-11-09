import { describe, it, expect, vi, beforeEach } from 'vitest';
import projectService from './projectService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProjects should call GET /projects with query parameters', async () => {
    const mockData = {
      content: [{ projectId: 1, projectName: 'Test Project' }],
      totalElements: 1,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'Test', status: 1 };
    const result = await projectService.getProjects(params);

    expect(apiClient.get).toHaveBeenCalledWith('/projects', { params });
    expect(result).toEqual(mockData);
  });

  it('getProjectById should call GET /projects/{id}', async () => {
    const mockProject = { projectId: 1, projectCode: 'PRJ-000001', projectName: 'Test' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockProject } });

    const result = await projectService.getProjectById(1);

    expect(apiClient.get).toHaveBeenCalledWith('/projects/1');
    expect(result).toEqual(mockProject);
  });

  it('createProject should call POST /projects with request body', async () => {
    const payload = { projectName: 'New Project', description: 'Desc' };
    const mockCreated = { projectId: 2, projectCode: 'PRJ-000002', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await projectService.createProject(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/projects', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateProject should call PUT /projects/{id} with updated body', async () => {
    const payload = { projectName: 'Updated Project', description: 'Updated' };
    const mockUpdated = { projectId: 1, projectCode: 'PRJ-000001', ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await projectService.updateProject(1, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/projects/1', payload);
    expect(result).toEqual(mockUpdated);
  });
});

