import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Database,
  Calendar,
  Layers,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { useDbChangeDetails } from '../hooks/useDbChanges';
import { DB_ENVIRONMENTS, OBJECT_TYPE_COLORS } from '../constants/dbChangeConstants';

export const DbChangeDetailPage = () => {
  const { dbChangeId } = useParams();
  const { data: dbChange, isLoading, isError, error } = useDbChangeDetails(dbChangeId);

  const getEnvironmentBadge = (val) => {
    const found = DB_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getObjectTypeBadge = (val) => {
    const color = OBJECT_TYPE_COLORS[val] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
        {val}
      </span>
    );
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading database change details...</p>
      </div>
    );
  }

  if (isError || !dbChange) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-base font-semibold text-red-900">Database Change Not Found</h2>
        <p className="text-xs text-red-700">{error?.message || 'Unable to retrieve database change details.'}</p>
        <Link
          to="/db-changes"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Database Changes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/db-changes"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {dbChange.dbChangeCode}
              </h1>
              {getEnvironmentBadge(dbChange.environment)}
              {getObjectTypeBadge(dbChange.objectType)}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                {dbChange.databaseName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Work date: {formatDate(dbChange.workDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/db-changes/${dbChangeId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit DB Change</span>
          </Link>
        </div>
      </div>

      {/* Grid: Context & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details Card & Modification Descriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Object Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Database Object Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Database Platform
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {dbChange.databaseName}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Object Type
                </span>
                <div>{getObjectTypeBadge(dbChange.objectType)}</div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Object Name
                </span>
                <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 block select-all break-all">
                  {dbChange.objectName}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Environment
                </span>
                <div>{getEnvironmentBadge(dbChange.environment)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Created At
                </span>
                <span className="text-slate-500 text-xs">{formatDateTime(dbChange.createdAt)}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Last Updated
                </span>
                <span className="text-slate-500 text-xs">{formatDateTime(dbChange.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Modification Details & Business Reason */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Reason & Modification Details
              </h2>
            </div>

            {/* Why Changed */}
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Why Changed / Business Reason
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {dbChange.whyChanged}
              </p>
            </div>

            {/* What Changed */}
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                What Changed (Technical Details)
              </span>
              {dbChange.whatChanged ? (
                <p className="text-xs text-slate-700 whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-mono">
                  {dbChange.whatChanged}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No technical description logged.</p>
              )}
            </div>

            {/* Affected Object(s) */}
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Affected Object(s)
              </span>
              {dbChange.affectedObject ? (
                <p className="text-xs text-slate-700 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {dbChange.affectedObject}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No related/affected objects listed.</p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Remarks
              </span>
              {dbChange.remarks ? (
                <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {dbChange.remarks}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No additional remarks logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Hierarchy Context Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Hierarchy Context
              </h2>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Project
              </span>
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${dbChange.projectId}`}
                  className="font-semibold text-sm text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                >
                  <span>{dbChange.projectName}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </Link>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                  {dbChange.projectCode}
                </span>
              </div>
            </div>

            {/* Task Item */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Task Item
              </span>
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/task-items/${dbChange.taskItemId}`}
                  className="text-xs text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 group"
                >
                  <span className="font-mono text-slate-600 font-semibold mr-1">
                    {dbChange.taskItemCode}:
                  </span>
                  <span>{dbChange.taskItemTitle}</span>
                </Link>
              </div>
            </div>

            {/* Work Log */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Parent Work Log
              </span>
              <div className="flex items-center justify-between">
                <Link
                  to={`/work-logs/${dbChange.workLogId}`}
                  className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>{dbChange.workLogCode}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  {formatDate(dbChange.workDate)}
                </span>
              </div>
            </div>

            {/* Immutability Note */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Database changes are permanently attached to this Work Log and cannot be reassigned or deleted.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbChangeDetailPage;
