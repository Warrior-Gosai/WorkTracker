import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle,
  CheckSquare,
  Clock,
  Hourglass,
  AlertTriangle,
  GitCommit,
  Layers,
} from 'lucide-react';

export const SummaryCards = ({ summary = {}, isLoading = false }) => {
  const cards = [
    {
      title: 'Total Projects',
      value: summary.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      link: '/projects',
    },
    {
      title: 'Active Projects',
      value: summary.activeProjects ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      link: '/projects',
    },
    {
      title: 'Total Task Items',
      value: summary.totalTaskItems ?? 0,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      link: '/task-items',
    },
    {
      title: 'Open Task Items',
      value: summary.openTaskItems ?? 0,
      icon: Layers,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
      link: '/task-items',
    },
    {
      title: 'Total Work Logs',
      value: summary.totalWorkLogs ?? 0,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      link: '/work-logs',
    },
    {
      title: 'Total Pending Tasks',
      value: summary.totalPendingTasks ?? 0,
      icon: Hourglass,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      link: '/pending-tasks',
    },
    {
      title: 'Overdue Pending Tasks',
      value: summary.overduePendingTasks ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      link: '/pending-tasks?overdue=true',
      isAlert: (summary.overduePendingTasks ?? 0) > 0,
    },
    {
      title: 'Uncommitted Code',
      value: summary.uncommittedCodeChanges ?? 0,
      icon: GitCommit,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      link: '/code-changes',
      isAlert: (summary.uncommittedCodeChanges ?? 0) > 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-pulse space-y-3"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
            <div className="h-6 w-12 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link
            key={idx}
            to={card.link}
            className={`group bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              card.isAlert
                ? 'border-rose-200 ring-1 ring-rose-200/50 bg-rose-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.bgColor} ${card.color} ${card.borderColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                {card.value}
              </div>
              <div className="text-[11px] font-medium text-slate-500 mt-1 truncate" title={card.title}>
                {card.title}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SummaryCards;
