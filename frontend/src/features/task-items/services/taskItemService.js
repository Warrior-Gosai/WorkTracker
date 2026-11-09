import apiClient from '../../../services/api/apiClient';

export const taskItemService = {
  /**
   * Fetch paginated and filtered active task items
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getTaskItems(params = {}) {
    const response = await apiClient.get('/task-items', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch a single task item by ID (active only)
   * @param {number|string} taskItemId
   * @returns {Promise<Object>}
   */
  async getTaskItemById(taskItemId) {
    const response = await apiClient.get(`/task-items/${taskItemId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create a new active task item
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createTaskItem(data) {
    const response = await apiClient.post('/task-items', data);
    return response.data?.data || response.data;
  },

  /**
   * Update task item details (taskType, title, description, priority, remarks)
   * @param {number|string} taskItemId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateTaskItem(taskItemId, data) {
    const response = await apiClient.put(`/task-items/${taskItemId}`, data);
    return response.data?.data || response.data;
  },

  /**
   * Update workflow status (recalculates completed_at)
   * @param {number|string} taskItemId
   * @param {string} status
   * @returns {Promise<Object>}
   */
  async updateTaskStatus(taskItemId, status) {
    const response = await apiClient.patch(`/task-items/${taskItemId}/status`, { status });
    return response.data?.data || response.data;
  },

  /**
   * Deactivate task item (sets is_active = 0, preserves historical records)
   * @param {number|string} taskItemId
   * @returns {Promise<Object>}
   */
  async deactivateTaskItem(taskItemId) {
    const response = await apiClient.patch(`/task-items/${taskItemId}/deactivate`);
    return response.data?.data || response.data;
  },

  /**
   * Retrieve historical work logs, code changes, and db changes for this task item
   * @param {number|string} taskItemId
   * @returns {Promise<Object>}
   */
  async getTaskItemHistory(taskItemId) {
    const response = await apiClient.get(`/task-items/${taskItemId}/history`);
    return response.data?.data || response.data;
  },
};

export default taskItemService;

