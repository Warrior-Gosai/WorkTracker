import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROUTES } from '../constants';

export const PublicRoute = () => {
  const { isAuthenticated, isLoading, setupRequired } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication status..." />;
  }

  if (setupRequired) {
    return <Navigate to={ROUTES.SETUP} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

