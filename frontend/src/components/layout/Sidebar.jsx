import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Clock,
  Hourglass,
  FileCode2,
  Database,
  FileSpreadsheet,
  Settings,
  Layers,
  X,
} from 'lucide-react';
import { APP_NAME, ROUTES } from '../../constants';

const navItems = [
  {
    name: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    isAvailable: true,
  },
  {
    name: 'Projects',
    path: ROUTES.PROJECTS,
    icon: FolderKanban,
    isAvailable: false,
  },
  {
    name: 'Task Items',
    path: ROUTES.TASK_ITEMS,
    icon: CheckSquare,
    isAvailable: false,
  },
  {
    name: 'Work Logs',
    path: ROUTES.WORK_LOGS,
    icon: Clock,
    isAvailable: false,
  },
  {
    name: 'Pending Tasks',
    path: ROUTES.PENDING_TASKS,
    icon: Hourglass,
    isAvailable: false,
  },
  {
    name: 'Code Changes',
    path: ROUTES.CODE_CHANGES,
    icon: FileCode2,
    isAvailable: false,
  },
  {
    name: 'DB Changes',
    path: ROUTES.DB_CHANGES,
    icon: Database,
    isAvailable: false,
  },
  {
    name: 'Reports & Exports',
    path: ROUTES.REPORTS,
    icon: FileSpreadsheet,
    isAvailable: false,
  },
  {
    name: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    isAvailable: false,
  },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-tight block">
                {APP_NAME}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Work Tracker
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (!item.isAvailable) {
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 rounded-lg cursor-not-allowed select-none group opacity-75"
                  title="Coming in future phases"
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 mr-3 ${
                        isActive ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-500">
            <p className="font-medium text-slate-700">Single-User Edition</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Local Developer Workspace</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

