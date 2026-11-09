import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROUTES } from '../constants';

export const SetupRoute = () => {
  const { setupRequired, isLoading } = useAuth();

  if (isLoading || setupRequired === null) {
    return <LoadingScreen message="Checking setup requirements..." />;
  }

  // Registration is strictly forbidden if setup is not required (an account already exists)
  if (setupRequired === false) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default SetupRoute;

