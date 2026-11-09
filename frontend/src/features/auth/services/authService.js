import { apiClient, setAccessToken, setCsrfToken, getCsrfToken } from '../../../services/api/apiClient';
import { getCookie } from '../../../utils/cookieUtils';

/**
 * Authentication API Service
 * Interacts directly with backend endpoints matching DTOs
 */
export const authService = {
  /**
   * Check if initial registration is required
   * @returns {Promise<{ setupRequired: boolean }>}
   */
  async getSetupStatus() {
    const response = await apiClient.get('/auth/setup-status');
    return response.data?.data || response.data;
  },

  /**
   * Fetch CSRF token from Spring Security
   * @returns {Promise<{ token: string, headerName: string, parameterName: string }>}
   */
  async getCsrfToken() {
    const response = await apiClient.get('/auth/csrf-token');
    const csrfData = response.data?.data || response.data;
    if (csrfData?.token) {
      setCsrfToken(csrfData.token);
    }
    return csrfData;
  },

  /**
   * Register the single user account during initial setup
   * @param {{ username: string, email: string, password: string, confirmPassword: string }} data
   * @returns {Promise<{ userId: number, username: string, email: string, status: number }>}
   */
  async register(data) {
    const response = await apiClient.post('/auth/register', data);
    return response.data?.data || response.data;
  },

  /**
   * Authenticate user with username or email + password
   * @param {{ usernameOrEmail: string, password: string }} data
   * @returns {Promise<{ accessToken: string, tokenType: string, expiresIn: number }>}
   */
  async login(data) {
    const response = await apiClient.post('/auth/login', data);
    const authData = response.data?.data || response.data;
    if (authData?.accessToken) {
      setAccessToken(authData.accessToken);
    }
    return authData;
  },

  /**
   * Rotate refresh token using HttpOnly cookie
   * @returns {Promise<{ accessToken: string, tokenType: string, expiresIn: number }>}
   */
  async refreshToken() {
    // Send CSRF header if available
    const xsrfCookie = getCookie('XSRF-TOKEN') || getCsrfToken();
    const headers = {};
    if (xsrfCookie) {
      headers['X-XSRF-TOKEN'] = xsrfCookie;
    }

    const response = await apiClient.post('/auth/refresh', {}, { headers });
    const authData = response.data?.data || response.data;
    if (authData?.accessToken) {
      setAccessToken(authData.accessToken);
    }
    return authData;
  },

  /**
   * Logout user, revoking server refresh token and clearing cookie
   */
  async logout() {
    try {
      const xsrfCookie = getCookie('XSRF-TOKEN') || getCsrfToken();
      const headers = {};
      if (xsrfCookie) {
        headers['X-XSRF-TOKEN'] = xsrfCookie;
      }
      await apiClient.post('/auth/logout', {}, { headers });
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Retrieve current authenticated user profile
   * @returns {Promise<{ userId: number, username: string, email: string, status: number }>}
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data?.data || response.data;
  },
};

export default authService;

