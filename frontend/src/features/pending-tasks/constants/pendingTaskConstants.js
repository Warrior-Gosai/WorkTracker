export const PENDING_TASK_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const PENDING_TASK_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PRIORITY_COLORS = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  ON_HOLD: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Active Tasks (Pending, In Progress, On Hold)' },
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending Only' },
  { value: 'IN_PROGRESS', label: 'In Progress Only' },
  { value: 'ON_HOLD', label: 'On Hold Only' },
  { value: 'COMPLETED', label: 'Completed Only' },
  { value: 'CANCELLED', label: 'Cancelled Only' },
];

export const OVERDUE_FILTER_OPTIONS = [
  { value: '', label: 'All Due Dates' },
  { value: 'true', label: 'Overdue Only' },
  { value: 'false', label: 'Not Overdue' },
];
