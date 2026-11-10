import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  FileCode2,
  Database,
  Hourglass,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

const TYPE_CONFIG = {
  PROJECT: {
    icon: FolderKanban,
    label: 'Project',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  TASK_ITEM: {
    icon: CheckSquare,
    label: 'Task Item',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  WORK_LOG: {
    icon: Clock,
    label: 'Work Log',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  CODE_CHANGE: {
    icon: FileCode2,
    label: 'Code Change',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  DB_CHANGE: {
    icon: Database,
    label: 'DB Change',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  PENDING_TASK: {
    icon: Hourglass,
    label: 'Pending Task',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
};

export const RecentActivities = ({ activities = [], isLoading = false }) => {
  const formatTimeAgo = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Engineering Activity
            </h2>
            <p className="text-xs text-slate-500">
              Live updates across all development entities
            </p>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
          <p>No recent activity recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((item, idx) => {
            const config = TYPE_CONFIG[item.activityType] || {
              icon: Activity,
              label: item.activityType,
              color: 'text-slate-600 bg-slate-50 border-slate-200',
            };
            const Icon = config.icon;

            return (
              <div
                key={idx}
                className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${config.color}`}
                    title={config.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        {item.recordCode}
                      </span>
                      {item.projectName && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          • {item.projectName}
                        </span>
                      )}
                    </div>

                    <Link
                      to={item.navigationTarget}
                      className="text-xs font-medium text-slate-900 hover:text-indigo-600 truncate block mt-0.5"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pt-0.5">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(item.activityDate)}
                  </span>
                  <Link
                    to={item.navigationTarget}
                    className="p-1 rounded text-slate-300 group-hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    title="View Record"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
