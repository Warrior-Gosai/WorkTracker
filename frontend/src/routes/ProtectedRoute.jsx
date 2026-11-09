import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROUTES } from '../constants';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, setupRequired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verifying authentication session..." />;
  }

  if (setupRequired) {
    return <Navigate to={ROUTES.SETUP} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

