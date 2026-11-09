import apiClient from '../../../services/api/apiClient';

export const projectService = {
  /**
   * Fetch paginated and filtered projects
   * @param {Object} params
   * @param {string} [params.search]
   * @param {number} [params.status] 0 or 1
   * @param {number} [params.page=0]
   * @param {number} [params.size=10]
   * @param {string} [params.sortBy='createdAt']
   * @param {string} [params.direction='desc']
   * @returns {Promise<import('../../../common/response/PageResponse').PageResponse>}
   */
  async getProjects(params = {}) {
    const response = await apiClient.get('/projects', { params });
    return response.data?.data || response.data;
  },

  /**
   * Fetch a single project by ID
   * @param {number|string} projectId
   * @returns {Promise<Object>}
   */
  async getProjectById(projectId) {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create a new project
   * @param {{ projectName: string, description?: string, remarks?: string }} data
   * @returns {Promise<Object>}
   */
  async createProject(data) {
    const response = await apiClient.post('/projects', data);
    return response.data?.data || response.data;
  },

  /**
   * Update an existing project
   * @param {number|string} projectId
   * @param {{ projectName: string, description?: string, remarks?: string }} data
   * @returns {Promise<Object>}
   */
  async updateProject(projectId, data) {
    const response = await apiClient.put(`/projects/${projectId}`, data);
    return response.data?.data || response.data;
  },
};

export default projectService;

