import apiClient from '../../../services/api/apiClient';

export const dashboardService = {
  /**
   * Fetch high-level summary cards metrics
   * @returns {Promise<any>}
   */
  async getSummary() {
    const response = await apiClient.get('/dashboard/summary');
    return response.data?.data || response.data;
  },

  /**
   * Fetch work summary metrics and daily hours breakdown
   * @param {Object} [params]
   * @param {string} [params.dateFrom]
   * @param {string} [params.dateTo]
   * @param {number} [params.projectId]
   * @returns {Promise<any>}
   */
  async getWorkSummary(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get('/dashboard/work-summary', { params: cleanParams });
    return response.data?.data || response.data;
  },

  /**
   * Fetch project breakdown overview
   * @returns {Promise<any>}
   */
  async getProjectSummary() {
    const response = await apiClient.get('/dashboard/project-summary');
    return response.data?.data || response.data;
  },

  /**
   * Fetch pending task status breakdown
   * @returns {Promise<any>}
   */
  async getPendingSummary() {
    const response = await apiClient.get('/dashboard/pending-summary');
    return response.data?.data || response.data;
  },

  /**
   * Fetch chronological recent activities across modules
   * @param {number} [limit=10]
   * @returns {Promise<any>}
   */
  async getRecentActivities(limit = 10) {
    const response = await apiClient.get('/dashboard/recent-activities', { params: { limit } });
    return response.data?.data || response.data;
  },
};

export default dashboardService;
