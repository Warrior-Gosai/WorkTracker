import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  FolderKanban,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';

export const DashboardPlaceholderPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2">
              Phase 4 — Frontend Foundation Complete
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.username || 'Developer'}!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              DevWork Tracker authentication and security infrastructure are active.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Authenticated Session
            </span>
          </div>
        </div>
      </div>

      {/* Security & Foundation Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">In-Memory JWT</h3>
              <p className="text-xs text-slate-500">Zero LocalStorage exposure</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access tokens reside exclusively in React memory. Automatic rotation is handled via backend HttpOnly cookies.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">CSRF Protection</h3>
              <p className="text-xs text-slate-500">Spring Security sync</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            State-changing requests transmit verified anti-CSRF headers coordinated with Spring Security filters.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Single-Account Lock</h3>
              <p className="text-xs text-slate-500">Strict database constraint</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Registration route is sealed at both database and application levels. Only the single owner account has access.
          </p>
        </div>
      </div>

      {/* Up Next / Roadmap Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Application Modules Pipeline
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Upcoming phases will replace the manual Excel workbooks:
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Phase 5 — Project Management</p>
                <p className="text-xs text-slate-500">Manage client projects, project codes, and statuses</p>
              </div>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center">
              Next Task <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 opacity-80">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Phases 6–7 — Task Items & Work Logs</p>
                <p className="text-xs text-slate-500">Daily timesheet entries, time calculations, and pending tasks</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Queued
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 opacity-80">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Phases 8–10 — Code & DB Changes & Excel Exports</p>
                <p className="text-xs text-slate-500">Granular file/SQL logging and structured Excel workbook exports</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Queued
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholderPage;

