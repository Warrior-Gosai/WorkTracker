import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Clock,
  Layers,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useWorkLogDetails } from '../hooks/useWorkLogs';
import { WORK_TYPES, WORK_ENVIRONMENTS, WORK_STATUSES } from '../constants/workLogConstants';

export const WorkLogDetailPage = () => {
  const { workLogId } = useParams();
  const { data: workLog, isLoading, isError, error } = useWorkLogDetails(workLogId);

  const getWorkTypeLabel = (val) => {
    const found = WORK_TYPES.find((t) => t.value === val);
    return found ? found.label : val;
  };

  const getEnvironmentBadge = (val) => {
    const found = WORK_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getStatusBadge = (val) => {
    const found = WORK_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading work log details...</p>
      </div>
    );
  }

  if (isError || !workLog) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
        <p className="font-semibold">Failed to load work log</p>
        <p className="text-sm mt-1">{error?.message || 'Work log not found'}</p>
        <Link
          to="/work-logs"
          className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Work Logs</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div>
        <Link
          to="/work-logs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Logs</span>
        </Link>

        {/* Page Header Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                {workLog.workLogCode}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {formatDate(workLog.workDate)}
              </span>
              {getEnvironmentBadge(workLog.environment)}
              {getStatusBadge(workLog.status)}
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {workLog.taskRequirement}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <Link
              to={`/work-logs/${workLog.workLogId}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Work Log</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Context & Time Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Linked Task & Project Card */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Linked Task & Project Context
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Task Item */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500">Associated Task Item</span>
              <div>
                <Link
                  to={`/task-items/${workLog.taskItemId}`}
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span className="font-mono text-xs">[{workLog.taskItemCode}]</span>
                  <span className="truncate">{workLog.taskItemTitle || 'View Task'}</span>
                </Link>
              </div>
            </div>

            {/* Project */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-xs font-medium text-slate-500">Associated Project</span>
              <div>
                <Link
                  to={`/projects/${workLog.projectId}`}
                  className="text-sm font-semibold text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span className="font-mono text-xs text-slate-500">[{workLog.projectCode || 'PRJ'}]</span>
                  <span className="truncate">{workLog.projectName || '—'}</span>
                </Link>
              </div>
            </div>

            {/* Work Type */}
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500">Work Type</span>
              <p className="text-sm font-medium text-slate-800">
                {getWorkTypeLabel(workLog.workType)}
              </p>
            </div>

            {/* Technology / Area */}
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500">Technology / Area</span>
              <p className="text-sm font-medium text-slate-800">
                {workLog.technologyArea || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Tracking Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Time Tracking
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Start Time:</span>
              <span className="font-mono font-medium text-slate-800">
                {workLog.startTime || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">End Time:</span>
              <span className="font-mono font-medium text-slate-800">
                {workLog.endTime || 'Not specified'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Total Duration:</span>
              {workLog.totalHours != null ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {Number(workLog.totalHours).toFixed(2)} hours
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Work Details & Purpose */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Work Description & Purpose
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Task Requirement
            </h3>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
              {workLog.taskRequirement}
            </p>
          </div>

          {workLog.workDescription && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Technical Work Description
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                {workLog.workDescription}
              </p>
            </div>
          )}

          {workLog.purposeReason && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Purpose / Business Reason
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                {workLog.purposeReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resolution & Verification Outcomes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Verification & Outcomes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem / Blocker */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Problem / Blocker</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.problemBlocker || 'None encountered'}
            </p>
          </div>

          {/* Solution / Resolution */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Solution / Resolution</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.solutionResolution || '—'}
            </p>
          </div>

          {/* Testing / Verification */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Testing & Verification
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.testingVerification || '—'}
            </p>
          </div>

          {/* Result / Outcome */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Result / Outcome
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.resultOutcome || '—'}
            </p>
          </div>

          {/* Pending / Next Action */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Pending / Next Action
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.pendingNextAction || '—'}
            </p>
          </div>

          {/* Notes / Remarks */}
          <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-1">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Notes / Remarks
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-line">
              {workLog.notesRemarks || '—'}
            </p>
          </div>
        </div>

        {/* Timestamps footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>Created: {formatTimestamp(workLog.createdAt)}</span>
          <span>Last Updated: {formatTimestamp(workLog.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkLogDetailPage;

