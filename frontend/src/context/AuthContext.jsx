import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../features/auth/services/authService';
import { setOnUnauthenticated } from '../services/api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(null);

  // Initialize and verify authentication state on mount
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check setup status
      const setupData = await authService.getSetupStatus();
      if (setupData?.setupRequired) {
        setSetupRequired(true);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setSetupRequired(false);

      // 2. Initialize CSRF token from Spring Security
      try {
        await authService.getCsrfToken();
      } catch (csrfErr) {
        console.warn('Could not initialize CSRF token on startup:', csrfErr);
      }

      // 3. Attempt silent refresh using HttpOnly cookie
      try {
        const refreshData = await authService.refreshToken();
        if (refreshData?.accessToken) {
          // 4. Retrieve current user profile
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (refreshErr) {
        // No valid session cookie found or expired
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Initialization error during setup status check:', err);
      setSetupRequired(false);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Register callback for when background 401 refresh fails
    setOnUnauthenticated(() => {
      setUser(null);
      setIsAuthenticated(false);
    });

    initializeAuth();
  }, [initializeAuth]);

  /**
   * Log in user
   */
  const login = async (credentials) => {
    const authData = await authService.login(credentials);
    try {
      await authService.getCsrfToken();
    } catch (e) {
      // non-fatal
    }
    const userData = await authService.getCurrentUser();
    setUser(userData);
    setIsAuthenticated(true);
    return { authData, userData };
  };

  /**
   * Register the single user during setup
   */
  const register = async (registrationData) => {
    const userResult = await authService.register(registrationData);
    setSetupRequired(false);
    return userResult;
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    setupRequired,
    setSetupRequired,
    login,
    register,
    logout,
    refreshUser: async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        // silent
      }
    },
    recheckSetupStatus: async () => {
      try {
        const status = await authService.getSetupStatus();
        setSetupRequired(status?.setupRequired);
        return status?.setupRequired;
      } catch {
        return false;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

