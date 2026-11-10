import { apiClient } from '../../../services/api/apiClient';

/**
 * Extracts a filename from the Content-Disposition header, or falls back to the default filename.
 */
export const extractFilename = (contentDisposition, fallbackName) => {
  if (!contentDisposition) return fallbackName;
  const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '').trim();
  }
  return fallbackName;
};

/**
 * Initiates browser download from an Axios blob response.
 */
export const triggerBlobDownload = (response, fallbackName) => {
  const contentDisposition = response.headers?.['content-disposition'];
  const filename = extractFilename(contentDisposition, fallbackName);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([response.data], {
      type: response.headers?.['content-type'] || 'application/octet-stream',
    });

    const urlObj = window.URL || URL;
    const downloadUrl = urlObj.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);

    setTimeout(() => {
      urlObj.revokeObjectURL(downloadUrl);
    }, 100);
  }

  return filename;
};

/**
 * Extracts a meaningful error message from an Axios error where the response data might be a Blob.
 */
export const parseBlobError = async (error) => {
  if (error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const parsed = JSON.parse(text);
      return parsed.message || 'Export request failed';
    } catch {
      return 'Export request failed with status ' + (error.response?.status || 'unknown');
    }
  }
  return error.response?.data?.message || error.message || 'Export request failed';
};

export const exportService = {
  /**
   * Export Daily Work Log (01_Daily_Work_Log.xlsx)
   */
  async exportDailyWorkLog(params = {}) {
    try {
      const response = await apiClient.get('/exports/work-logs', {
        params,
        responseType: 'blob',
      });
      return triggerBlobDownload(response, '01_Daily_Work_Log.xlsx');
    } catch (error) {
      const msg = await parseBlobError(error);
      throw new Error(msg);
    }
  },

  /**
   * Export DB Change Log (02_DB_Change_Log.xlsx)
   */
  async exportDbChangeLog(params = {}) {
    try {
      const response = await apiClient.get('/exports/db-changes', {
        params,
        responseType: 'blob',
      });
      return triggerBlobDownload(response, '02_DB_Change_Log.xlsx');
    } catch (error) {
      const msg = await parseBlobError(error);
      throw new Error(msg);
    }
  },

  /**
   * Export Code/File Change Log (03_Code_File_Change_Log.xlsx)
   */
  async exportCodeChangeLog(params = {}) {
    try {
      const response = await apiClient.get('/exports/code-changes', {
        params,
        responseType: 'blob',
      });
      return triggerBlobDownload(response, '03_Code_File_Change_Log.xlsx');
    } catch (error) {
      const msg = await parseBlobError(error);
      throw new Error(msg);
    }
  },

  /**
   * Export All Reports ZIP (DevWork_Tracker_Reports.zip)
   */
  async exportAllReports(params = {}) {
    try {
      const response = await apiClient.get('/exports/all', {
        params,
        responseType: 'blob',
      });
      return triggerBlobDownload(response, 'DevWork_Tracker_Reports.zip');
    } catch (error) {
      const msg = await parseBlobError(error);
      throw new Error(msg);
    }
  },
};

export default exportService;
