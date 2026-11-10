import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckSquare,
  Hourglass,
  FileCode2,
  Database,
  FolderPlus,
  Zap,
} from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      label: 'Log Work',
      description: 'Record daily development activity',
      icon: Clock,
      link: '/work-logs/new',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    },
    {
      label: 'New Task Item',
      description: 'Create actionable task under a project',
      icon: CheckSquare,
      link: '/task-items',
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      label: 'New Pending Task',
      description: 'Add follow-up item or reminder',
      icon: Hourglass,
      link: '/pending-tasks/new',
      color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
    },
    {
      label: 'Log Code Change',
      description: 'Track SVN commit and changed files',
      icon: FileCode2,
      link: '/code-changes/new',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    },
    {
      label: 'Log DB Change',
      description: 'Record schema or database modification',
      icon: Database,
      link: '/db-changes/new',
      color: 'text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100',
    },
    {
      label: 'New Project',
      description: 'Register a development project',
      icon: FolderPlus,
      link: '/projects',
      color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
        <Zap className="w-4 h-4 text-indigo-600" />
        <span>Quick Actions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.link}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all group ${act.color}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">{act.label}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{act.description}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
