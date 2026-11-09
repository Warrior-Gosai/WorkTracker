import apiClient from '../../../services/api/apiClient';

export const codeChangeService = {
  /**
   * Fetch paginated and filtered code changes
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getCodeChanges(params = {}) {
    const response = await apiClient.get('/code-changes', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch single code change details
   * @param {number|string} codeChangeId
   * @returns {Promise<Object>}
   */
  async getCodeChangeById(codeChangeId) {
    const response = await apiClient.get(`/code-changes/${codeChangeId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create new code change
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createCodeChange(data) {
    const response = await apiClient.post('/code-changes', data);
    return response.data?.data || response.data;
  },

  /**
   * Update code change
   * @param {number|string} codeChangeId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateCodeChange(codeChangeId, data) {
    const response = await apiClient.put(`/code-changes/${codeChangeId}`, data);
    return response.data?.data || response.data;
  },

  /**
   * Exact SVN Commit ID search
   * @param {string} svnCommitId
   * @returns {Promise<Object>}
   */
  async searchBySvnCommitId(svnCommitId) {
    const response = await apiClient.get(`/code-changes/commit/${encodeURIComponent(svnCommitId)}`);
    return response.data?.data || response.data;
  },

  /**
   * Add child file entry
   * @param {number|string} codeChangeId
   * @param {Object} fileData
   * @returns {Promise<Object>}
   */
  async addFile(codeChangeId, fileData) {
    const response = await apiClient.post(`/code-changes/${codeChangeId}/files`, fileData);
    return response.data?.data || response.data;
  },

  /**
   * Update child file entry
   * @param {number|string} codeChangeId
   * @param {number|string} fileId
   * @param {Object} fileData
   * @returns {Promise<Object>}
   */
  async updateFile(codeChangeId, fileId, fileData) {
    const response = await apiClient.put(`/code-changes/${codeChangeId}/files/${fileId}`, fileData);
    return response.data?.data || response.data;
  },

  /**
   * Delete child file entry
   * @param {number|string} codeChangeId
   * @param {number|string} fileId
   * @returns {Promise<void>}
   */
  async deleteFile(codeChangeId, fileId) {
    await apiClient.delete(`/code-changes/${codeChangeId}/files/${fileId}`);
  },
};

export default codeChangeService;
