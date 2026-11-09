import apiClient from '../../../services/api/apiClient';

export const workLogService = {
  /**
   * Fetch paginated and filtered work logs
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getWorkLogs(params = {}) {
    const response = await apiClient.get('/work-logs', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch a single work log by ID
   * @param {number|string} workLogId
   * @returns {Promise<Object>}
   */
  async getWorkLogById(workLogId) {
    const response = await apiClient.get(`/work-logs/${workLogId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create a new work log
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createWorkLog(data) {
    const response = await apiClient.post('/work-logs', data);
    return response.data?.data || response.data;
  },

  /**
   * Update an existing work log
   * @param {number|string} workLogId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateWorkLog(workLogId, data) {
    const response = await apiClient.put(`/work-logs/${workLogId}`, data);
    return response.data?.data || response.data;
  },
};

