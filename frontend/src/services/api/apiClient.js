import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import { getCookie } from '../../utils/cookieUtils';

// In-memory token storage (NEVER stored in localStorage or sessionStorage)
let inMemoryAccessToken = null;
let inMemoryCsrfToken = null;

let isRefreshing = false;
let failedQueue = [];
let onUnauthenticatedCallback = null;

export const getAccessToken = () => inMemoryAccessToken;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getCsrfToken = () => inMemoryCsrfToken;

export const setCsrfToken = (token) => {
  inMemoryCsrfToken = token;
};

export const setOnUnauthenticated = (callback) => {
  onUnauthenticatedCallback = callback;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Main Axios Client instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

/**
 * Request Interceptor
 * Adds Bearer token and CSRF token when applicable
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Attach JWT Access Token if present
    if (inMemoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }

    // 2. Attach CSRF token on mutating requests (POST, PUT, PATCH, DELETE)
    const method = config.method ? config.method.toUpperCase() : 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const xsrfCookie = getCookie('XSRF-TOKEN');
      if (xsrfCookie) {
        config.headers['X-XSRF-TOKEN'] = xsrfCookie;
      } else if (inMemoryCsrfToken) {
        config.headers['X-XSRF-TOKEN'] = inMemoryCsrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles 401s, automatic refresh token rotation queue, and standardizes errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or already canceled
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = originalRequest?.url || '';

    // Ignore 401s for login, setup-status, and refresh calls to avoid infinite loops
    const isAuthBypassUrl =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/setup-status') ||
      requestUrl.includes('/auth/csrf-token');

    if (status === 401 && !originalRequest._retry && !isAuthBypassUrl) {
      if (isRefreshing) {
        // Queue this request until current refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh using HttpOnly cookie
        // Send CSRF header if available
        const xsrfCookie = getCookie('XSRF-TOKEN') || inMemoryCsrfToken;
        const refreshHeaders = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (xsrfCookie) {
          refreshHeaders['X-XSRF-TOKEN'] = xsrfCookie;
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: refreshHeaders,
          }
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint');
        }

        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        if (typeof onUnauthenticatedCallback === 'function') {
          onUnauthenticatedCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

