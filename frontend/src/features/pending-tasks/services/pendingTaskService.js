import apiClient from '../../../services/api/apiClient';

export const pendingTaskService = {
  /**
   * Fetch paginated and filtered pending tasks
   * @param {Object} params
   * @param {string} [params.search]
   * @param {number} [params.projectId]
   * @param {string} [params.priority]
   * @param {string} [params.status]
   * @param {string} [params.dueDateFrom]
   * @param {string} [params.dueDateTo]
   * @param {boolean} [params.overdue]
   * @param {number} [params.page=0]
   * @param {number} [params.size=10]
   * @param {string} [params.sortBy='dueDate']
   * @param {string} [params.direction='asc']
   * @returns {Promise<any>}
   */
  async getPendingTasks(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get('/pending-tasks', { params: cleanParams });
    return response.data?.data || response.data;
  },

  /**
   * Fetch single pending task by ID
   * @param {number|string} pendingTaskId
   * @returns {Promise<any>}
   */
  async getPendingTaskById(pendingTaskId) {
    const response = await apiClient.get(`/pending-tasks/${pendingTaskId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create a new pending task
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async createPendingTask(data) {
    const payload = {
      ...data,
      dueDate: data.dueDate ? data.dueDate : null,
      description: data.description ? data.description : null,
      remarks: data.remarks ? data.remarks : null,
    };
    const response = await apiClient.post('/pending-tasks', payload);
    return response.data?.data || response.data;
  },

  /**
   * Update an existing pending task
   * @param {number|string} pendingTaskId
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async updatePendingTask(pendingTaskId, data) {
    const payload = {
      ...data,
      dueDate: data.dueDate ? data.dueDate : null,
      description: data.description ? data.description : null,
      remarks: data.remarks ? data.remarks : null,
    };
    const response = await apiClient.put(`/pending-tasks/${pendingTaskId}`, payload);
    return response.data?.data || response.data;
  },

  /**
   * Update status of a pending task
   * @param {number|string} pendingTaskId
   * @param {{ status: string }} data
   * @returns {Promise<any>}
   */
  async updatePendingTaskStatus(pendingTaskId, data) {
    const response = await apiClient.patch(`/pending-tasks/${pendingTaskId}/status`, data);
    return response.data?.data || response.data;
  },
};

export default pendingTaskService;
