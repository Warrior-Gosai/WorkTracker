import apiClient from '../../../services/api/apiClient';

export const dbChangeService = {
  /**
   * Fetch paginated and filtered database changes
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getDbChanges(params = {}) {
    const response = await apiClient.get('/db-changes', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch single database change details
   * @param {number|string} dbChangeId
   * @returns {Promise<Object>}
   */
  async getDbChangeById(dbChangeId) {
    const response = await apiClient.get(`/db-changes/${dbChangeId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create new database change
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createDbChange(data) {
    const response = await apiClient.post('/db-changes', data);
    return response.data?.data || response.data;
  },

  /**
   * Update database change
   * @param {number|string} dbChangeId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateDbChange(dbChangeId, data) {
    const response = await apiClient.put(`/db-changes/${dbChangeId}`, data);
    return response.data?.data || response.data;
  },
};

export default dbChangeService;
