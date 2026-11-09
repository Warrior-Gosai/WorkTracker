export const APP_NAME = 'DevWork Tracker';
export const APP_DESCRIPTION = 'Developer Work & Change Tracking System';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SETUP: '/setup',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  TASK_ITEMS: '/task-items',
  WORK_LOGS: '/work-logs',
  PENDING_TASKS: '/pending-tasks',
  CODE_CHANGES: '/code-changes',
  DB_CHANGES: '/db-changes',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};

