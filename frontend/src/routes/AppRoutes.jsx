import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import SetupRoute from './SetupRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import SetupPage from '../features/auth/pages/SetupPage';
import DashboardPlaceholderPage from '../features/dashboard/pages/DashboardPlaceholderPage';
import ProjectListPage from '../features/projects/pages/ProjectListPage';
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage';
import TaskItemListPage from '../features/task-items/pages/TaskItemListPage';
import TaskItemDetailPage from '../features/task-items/pages/TaskItemDetailPage';
import WorkLogListPage from '../features/work-logs/pages/WorkLogListPage';
import WorkLogCreatePage from '../features/work-logs/pages/WorkLogCreatePage';
import WorkLogDetailPage from '../features/work-logs/pages/WorkLogDetailPage';
import WorkLogEditPage from '../features/work-logs/pages/WorkLogEditPage';
import { ROUTES } from '../constants';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route: Login */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Setup Route: Initial One-Time Administrator Registration */}
      <Route element={<SetupRoute />}>
        <Route path={ROUTES.SETUP} element={<SetupPage />} />
      </Route>

      {/* Protected Routes inside AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPlaceholderPage />} />
          <Route path={ROUTES.PROJECTS} element={<ProjectListPage />} />
          <Route path={`${ROUTES.PROJECTS}/:projectId`} element={<ProjectDetailPage />} />
          <Route path={ROUTES.TASK_ITEMS} element={<TaskItemListPage />} />
          <Route path={`${ROUTES.TASK_ITEMS}/:taskItemId`} element={<TaskItemDetailPage />} />
          <Route path={ROUTES.WORK_LOGS} element={<WorkLogListPage />} />
          <Route path={`${ROUTES.WORK_LOGS}/new`} element={<WorkLogCreatePage />} />
          <Route path={`${ROUTES.WORK_LOGS}/:workLogId`} element={<WorkLogDetailPage />} />
          <Route path={`${ROUTES.WORK_LOGS}/:workLogId/edit`} element={<WorkLogEditPage />} />
          {/* Default root path redirects to dashboard */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>
      </Route>

      {/* Catch-all unknown routes redirect to Home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;

