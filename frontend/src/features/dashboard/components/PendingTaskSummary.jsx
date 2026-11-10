import React from 'react';
import { Link } from 'react-router-dom';
import {
  Hourglass,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const PendingTaskSummary = ({ pendingSummary = {}, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const overdueCount = pendingSummary.overdue || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pending Task Reminders
            </h2>
            <p className="text-xs text-slate-500">
              Follow-up items, deadlines, and overdue alerts
            </p>
          </div>
        </div>

        <Link
          to="/pending-tasks"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueCount > 0 && (
        <Link
          to="/pending-tasks?overdue=true"
          className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800 hover:bg-rose-100/70 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">
              {overdueCount} task{overdueCount > 1 ? 's are' : ' is'} overdue!
            </span>
          </div>
          <span className="text-[11px] font-medium underline">Filter Overdue &rarr;</span>
        </Link>
      )}

      {/* Status Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Pending */}
        <Link
          to="/pending-tasks?status=PENDING"
          className="p-3 rounded-lg bg-amber-50/40 border border-amber-100 hover:bg-amber-50 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-amber-700 text-[11px] font-semibold mb-1">
            <Hourglass className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-900">
            {pendingSummary.pending || 0}
          </div>
        </Link>

        {/* In Progress */}
        <Link
          to="/pending-tasks?status=IN_PROGRESS"
          className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-blue-700 text-[11px] font-semibold mb-1">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </div>
          <div className="text-lg font-bold font-mono text-blue-900">
            {pendingSummary.inProgress || 0}
          </div>
        </Link>

        {/* On Hold */}
        <Link
          to="/pending-tasks?status=ON_HOLD"
          className="p-3 rounded-lg bg-purple-50/40 border border-purple-100 hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-purple-700 text-[11px] font-semibold mb-1">
            <PauseCircle className="w-3.5 h-3.5" />
            <span>On Hold</span>
          </div>
          <div className="text-lg font-bold font-mono text-purple-900">
            {pendingSummary.onHold || 0}
          </div>
        </Link>

        {/* Completed */}
        <Link
          to="/pending-tasks?status=COMPLETED"
          className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-emerald-700 text-[11px] font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-900">
            {pendingSummary.completed || 0}
          </div>
        </Link>

        {/* Cancelled */}
        <Link
          to="/pending-tasks?status=CANCELLED"
          className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] font-semibold mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-800">
            {pendingSummary.cancelled || 0}
          </div>
        </Link>

        {/* Total */}
        <div className="p-3 rounded-lg bg-indigo-50/30 border border-indigo-100">
          <div className="flex items-center space-x-1.5 text-indigo-700 text-[11px] font-semibold mb-1">
            <span>Total Tasks</span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-900">
            {pendingSummary.total || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingTaskSummary;
