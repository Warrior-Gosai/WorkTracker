import { describe, it, expect, vi, beforeEach } from 'vitest';
import { codeChangeService } from './codeChangeService';
import apiClient from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('codeChangeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCodeChanges should call GET /code-changes with query params', async () => {
    const mockData = {
      content: [{ codeChangeId: 1, codeChangeCode: 'CC-000001' }],
      totalElements: 1,
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockData } });

    const params = { page: 0, size: 10, search: 'CC-000001' };
    const result = await codeChangeService.getCodeChanges(params);

    expect(apiClient.get).toHaveBeenCalledWith('/code-changes', { params });
    expect(result).toEqual(mockData);
  });

  it('getCodeChangeById should call GET /code-changes/{id}', async () => {
    const mockCodeChange = { codeChangeId: 10, codeChangeCode: 'CC-000010' };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockCodeChange } });

    const result = await codeChangeService.getCodeChangeById(10);

    expect(apiClient.get).toHaveBeenCalledWith('/code-changes/10');
    expect(result).toEqual(mockCodeChange);
  });

  it('createCodeChange should call POST /code-changes with payload', async () => {
    const payload = {
      workLogId: 1,
      changeStatus: 'UNCOMMITTED',
      environment: 'LOCAL',
      changeDatetime: '2026-11-09T22:30:00Z',
    };
    const mockCreated = { codeChangeId: 10, codeChangeCode: 'CC-000010', ...payload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await codeChangeService.createCodeChange(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/code-changes', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateCodeChange should call PUT /code-changes/{id} with payload', async () => {
    const payload = {
      changeStatus: 'COMMITTED',
      svnCommitId: 'r1050',
      environment: 'LOCAL',
      changeDatetime: '2026-11-09T23:00:00Z',
    };
    const mockUpdated = { codeChangeId: 10, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await codeChangeService.updateCodeChange(10, payload);

    expect(apiClient.put).toHaveBeenCalledWith('/code-changes/10', payload);
    expect(result).toEqual(mockUpdated);
  });

  it('searchBySvnCommitId should call GET /code-changes/commit/{svnCommitId}', async () => {
    const mockSearchRes = {
      codeChangeId: 10,
      codeChangeCode: 'CC-000010',
      svnCommitId: 'r1050',
    };
    apiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockSearchRes } });

    const result = await codeChangeService.searchBySvnCommitId('r1050');

    expect(apiClient.get).toHaveBeenCalledWith('/code-changes/commit/r1050');
    expect(result).toEqual(mockSearchRes);
  });

  it('addFile should call POST /code-changes/{id}/files with file payload', async () => {
    const filePayload = {
      layer: 'BACKEND',
      technology: 'Java',
      filePath: 'src/main/Service.java',
    };
    const mockSavedFile = { codeChangeFileId: 55, ...filePayload };
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: mockSavedFile } });

    const result = await codeChangeService.addFile(10, filePayload);

    expect(apiClient.post).toHaveBeenCalledWith('/code-changes/10/files', filePayload);
    expect(result).toEqual(mockSavedFile);
  });

  it('updateFile should call PUT /code-changes/{id}/files/{fileId} with file payload', async () => {
    const filePayload = {
      layer: 'FRONTEND',
      technology: 'React',
      filePath: 'src/App.jsx',
    };
    const mockUpdatedFile = { codeChangeFileId: 55, ...filePayload };
    apiClient.put.mockResolvedValueOnce({ data: { success: true, data: mockUpdatedFile } });

    const result = await codeChangeService.updateFile(10, 55, filePayload);

    expect(apiClient.put).toHaveBeenCalledWith('/code-changes/10/files/55', filePayload);
    expect(result).toEqual(mockUpdatedFile);
  });

  it('deleteFile should call DELETE /code-changes/{id}/files/{fileId}', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { success: true } });

    await codeChangeService.deleteFile(10, 55);

    expect(apiClient.delete).toHaveBeenCalledWith('/code-changes/10/files/55');
  });
});
