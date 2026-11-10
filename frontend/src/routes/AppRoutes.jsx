import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import SetupRoute from './SetupRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import SetupPage from '../features/auth/pages/SetupPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProjectListPage from '../features/projects/pages/ProjectListPage';
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage';
import TaskItemListPage from '../features/task-items/pages/TaskItemListPage';
import TaskItemDetailPage from '../features/task-items/pages/TaskItemDetailPage';
import WorkLogListPage from '../features/work-logs/pages/WorkLogListPage';
import WorkLogCreatePage from '../features/work-logs/pages/WorkLogCreatePage';
import WorkLogDetailPage from '../features/work-logs/pages/WorkLogDetailPage';
import WorkLogEditPage from '../features/work-logs/pages/WorkLogEditPage';
import CodeChangeListPage from '../features/code-changes/pages/CodeChangeListPage';
import CodeChangeCreatePage from '../features/code-changes/pages/CodeChangeCreatePage';
import CodeChangeDetailPage from '../features/code-changes/pages/CodeChangeDetailPage';
import CodeChangeEditPage from '../features/code-changes/pages/CodeChangeEditPage';
import DbChangeListPage from '../features/db-changes/pages/DbChangeListPage';
import DbChangeCreatePage from '../features/db-changes/pages/DbChangeCreatePage';
import DbChangeDetailPage from '../features/db-changes/pages/DbChangeDetailPage';
import DbChangeEditPage from '../features/db-changes/pages/DbChangeEditPage';
import PendingTaskListPage from '../features/pending-tasks/pages/PendingTaskListPage';
import PendingTaskCreatePage from '../features/pending-tasks/pages/PendingTaskCreatePage';
import PendingTaskDetailPage from '../features/pending-tasks/pages/PendingTaskDetailPage';
import PendingTaskEditPage from '../features/pending-tasks/pages/PendingTaskEditPage';
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
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PROJECTS} element={<ProjectListPage />} />
          <Route path={`${ROUTES.PROJECTS}/:projectId`} element={<ProjectDetailPage />} />
          <Route path={ROUTES.TASK_ITEMS} element={<TaskItemListPage />} />
          <Route path={`${ROUTES.TASK_ITEMS}/:taskItemId`} element={<TaskItemDetailPage />} />
          <Route path={ROUTES.WORK_LOGS} element={<WorkLogListPage />} />
          <Route path={`${ROUTES.WORK_LOGS}/new`} element={<WorkLogCreatePage />} />
          <Route path={`${ROUTES.WORK_LOGS}/:workLogId`} element={<WorkLogDetailPage />} />
          <Route path={`${ROUTES.WORK_LOGS}/:workLogId/edit`} element={<WorkLogEditPage />} />
          <Route path={ROUTES.PENDING_TASKS} element={<PendingTaskListPage />} />
          <Route path={`${ROUTES.PENDING_TASKS}/new`} element={<PendingTaskCreatePage />} />
          <Route path={`${ROUTES.PENDING_TASKS}/:pendingTaskId`} element={<PendingTaskDetailPage />} />
          <Route path={`${ROUTES.PENDING_TASKS}/:pendingTaskId/edit`} element={<PendingTaskEditPage />} />
          <Route path={ROUTES.CODE_CHANGES} element={<CodeChangeListPage />} />
          <Route path={`${ROUTES.CODE_CHANGES}/new`} element={<CodeChangeCreatePage />} />
          <Route path={`${ROUTES.CODE_CHANGES}/:codeChangeId`} element={<CodeChangeDetailPage />} />
          <Route path={`${ROUTES.CODE_CHANGES}/:codeChangeId/edit`} element={<CodeChangeEditPage />} />
          <Route path={ROUTES.DB_CHANGES} element={<DbChangeListPage />} />
          <Route path={`${ROUTES.DB_CHANGES}/new`} element={<DbChangeCreatePage />} />
          <Route path={`${ROUTES.DB_CHANGES}/:dbChangeId`} element={<DbChangeDetailPage />} />
          <Route path={`${ROUTES.DB_CHANGES}/:dbChangeId/edit`} element={<DbChangeEditPage />} />
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

