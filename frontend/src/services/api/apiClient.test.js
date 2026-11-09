import { describe, it, expect, beforeEach } from 'vitest';
import {
  apiClient,
  getAccessToken,
  setAccessToken,
  getCsrfToken,
  setCsrfToken,
} from './apiClient';

describe('apiClient token management', () => {
  beforeEach(() => {
    setAccessToken(null);
    setCsrfToken(null);
  });

  it('should store access token in memory and retrieve it', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('sample.jwt.token');
    expect(getAccessToken()).toBe('sample.jwt.token');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('should store CSRF token in memory and retrieve it', () => {
    expect(getCsrfToken()).toBeNull();
    setCsrfToken('csrf-token-12345');
    expect(getCsrfToken()).toBe('csrf-token-12345');
    setCsrfToken(null);
    expect(getCsrfToken()).toBeNull();
  });

  it('should have withCredentials configured for cookies', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('should have JSON content-type and accept headers by default', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.headers.Accept).toBe('application/json');
  });
});

