import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportService, extractFilename, parseBlobError, triggerBlobDownload } from './exportService';
import { apiClient } from '../../../services/api/apiClient';

vi.mock('../../../services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('exportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractFilename', () => {
    it('extracts filename with quotes', () => {
      const header = 'attachment; filename="01_Daily_Work_Log.xlsx"';
      expect(extractFilename(header, 'default.xlsx')).toBe('01_Daily_Work_Log.xlsx');
    });

    it('extracts filename without quotes', () => {
      const header = 'attachment; filename=02_DB_Change_Log.xlsx';
      expect(extractFilename(header, 'default.xlsx')).toBe('02_DB_Change_Log.xlsx');
    });

    it('returns fallback if header is missing or empty', () => {
      expect(extractFilename(null, 'fallback.zip')).toBe('fallback.zip');
      expect(extractFilename('', 'fallback.zip')).toBe('fallback.zip');
    });
  });

  describe('parseBlobError', () => {
    it('parses error JSON message inside Blob', async () => {
      const errorJson = JSON.stringify({ success: false, message: 'Invalid scope specified' });
      const mockBlob = {
        text: vi.fn().mockResolvedValue(errorJson),
      };
      // Provide an object mimicking a Blob
      Object.setPrototypeOf(mockBlob, Blob.prototype);

      const error = {
        response: {
          data: mockBlob,
          status: 400,
        },
      };

      const msg = await parseBlobError(error);
      expect(msg).toBe('Invalid scope specified');
    });

    it('falls back to standard message if data is not Blob', async () => {
      const error = {
        response: {
          data: { message: 'Regular error message' },
        },
      };

      const msg = await parseBlobError(error);
      expect(msg).toBe('Regular error message');
    });
  });

  describe('API endpoints calls', () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        parentNode: {
          removeChild: vi.fn(),
        },
      };

      globalThis.window = {
        URL: {
          createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/test'),
          revokeObjectURL: vi.fn(),
        },
      };

      globalThis.document = {
        createElement: vi.fn().mockReturnValue(mockElement),
        body: {
          appendChild: vi.fn(),
        },
      };
    });

    afterEach(() => {
      delete globalThis.window;
      delete globalThis.document;
    });

    it('exportDailyWorkLog makes GET request with responseType blob', async () => {
      const mockResponse = {
        data: new Uint8Array([1, 2, 3]),
        headers: {
          'content-disposition': 'attachment; filename="01_Daily_Work_Log.xlsx"',
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const filename = await exportService.exportDailyWorkLog({ scope: 'all' });
      expect(apiClient.get).toHaveBeenCalledWith('/exports/work-logs', {
        params: { scope: 'all' },
        responseType: 'blob',
      });
      expect(filename).toBe('01_Daily_Work_Log.xlsx');
    });

    it('exportDbChangeLog makes GET request with responseType blob', async () => {
      const mockResponse = {
        data: new Uint8Array([1, 2, 3]),
        headers: {
          'content-disposition': 'attachment; filename="02_DB_Change_Log.xlsx"',
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const filename = await exportService.exportDbChangeLog({ scope: 'filtered', environment: 'DEV' });
      expect(apiClient.get).toHaveBeenCalledWith('/exports/db-changes', {
        params: { scope: 'filtered', environment: 'DEV' },
        responseType: 'blob',
      });
      expect(filename).toBe('02_DB_Change_Log.xlsx');
    });

    it('exportCodeChangeLog makes GET request with responseType blob', async () => {
      const mockResponse = {
        data: new Uint8Array([1, 2, 3]),
        headers: {
          'content-disposition': 'attachment; filename="03_Code_File_Change_Log.xlsx"',
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const filename = await exportService.exportCodeChangeLog({ scope: 'all' });
      expect(apiClient.get).toHaveBeenCalledWith('/exports/code-changes', {
        params: { scope: 'all' },
        responseType: 'blob',
      });
      expect(filename).toBe('03_Code_File_Change_Log.xlsx');
    });

    it('exportAllReports makes GET request with responseType blob', async () => {
      const mockResponse = {
        data: new Uint8Array([1, 2, 3]),
        headers: {
          'content-disposition': 'attachment; filename="DevWork_Tracker_Reports.zip"',
        },
      };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const filename = await exportService.exportAllReports({ scope: 'all' });
      expect(apiClient.get).toHaveBeenCalledWith('/exports/all', {
        params: { scope: 'all' },
        responseType: 'blob',
      });
      expect(filename).toBe('DevWork_Tracker_Reports.zip');
    });
  });
});
