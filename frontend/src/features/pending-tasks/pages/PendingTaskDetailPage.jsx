import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Hourglass,
  ArrowLeft,
  Edit,
  FolderKanban,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { usePendingTaskDetails, useUpdatePendingTaskStatus } from '../hooks/usePendingTasks';
import { PendingTaskStatusModal } from '../components/PendingTaskStatusModal';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants/pendingTaskConstants';
import Button from '../../../components/common/Button';

export const PendingTaskDetailPage = () => {
  const { pendingTaskId } = useParams();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data: task, isLoading, isError, error } = usePendingTaskDetails(pendingTaskId);
  const statusMutation = useUpdatePendingTaskStatus();

  const handleStatusSubmit = async (newStatus) => {
    try {
      await statusMutation.mutateAsync({
        pendingTaskId,
        data: { status: newStatus },
      });
      setIsStatusModalOpen(false);
    } catch (err) {
      // Toast handled by mutation hook
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading pending task details...</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>Failed to load pending task:</strong>{' '}
          {error?.response?.data?.message || 'Task not found.'}
        </div>
        <div className="mt-4">
          <Link
            to="/pending-tasks"
            className="text-xs text-indigo-600 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Pending Tasks
          </Link>
        </div>
      </div>
    );
  }

  const priorityClass = PRIORITY_COLORS[task.priority] || 'bg-slate-100 text-slate-700';
  const statusClass = STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/pending-tasks"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Pending Tasks
        </Link>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Change Status
          </Button>

          <Link
            to={`/pending-tasks/${pendingTaskId}/edit`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Task
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {task.pendingTaskCode}
              </span>

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${priorityClass}`}
              >
                {task.priority} Priority
              </span>

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${statusClass}`}
              >
                {task.status}
              </span>

              {task.overdue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  OVERDUE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Audit Timestamps Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Due Date:</span>
            <span className="font-mono text-slate-800 font-medium">
              {task.dueDate || 'None'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>Completed At:</span>
            <span className="font-mono text-slate-800 font-medium">
              {task.completedAt ? formatDate(task.completedAt) : 'Not completed'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Created:</span>
            <span className="font-mono text-slate-700 font-medium">
              {formatDate(task.createdAt)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Last Updated:</span>
            <span className="font-mono text-slate-700 font-medium">
              {formatDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Description & Remarks (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3>Task Description</h3>
            </div>
            {task.description ? (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No description provided for this pending task.</p>
            )}
          </div>

          {/* Remarks Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3>Remarks & Notes</h3>
            </div>
            {task.remarks ? (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.remarks}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No internal remarks recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Context Information */}
        <div className="space-y-6">
          {/* Project Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-xs uppercase tracking-wider">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              <h3>Associated Project</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {task.projectCode}
                </span>
                <Link
                  to={`/projects/${task.projectId}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                >
                  View Project &rarr;
                </Link>
              </div>

              <p className="text-sm font-bold text-slate-900">
                {task.projectName}
              </p>
              <p className="text-[11px] text-slate-400">
                Project association is permanent and immutable.
              </p>
            </div>
          </div>

          {/* Task Summary Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Summary
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-semibold text-slate-900">{task.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Priority:</span>
                <span className="font-semibold text-slate-900">{task.priority}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-mono text-slate-900">{task.dueDate || 'None'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Overdue:</span>
                <span
                  className={`font-semibold ${
                    task.overdue ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {task.overdue ? 'Yes (Overdue)' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Modal */}
      <PendingTaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusSubmit}
        isLoading={statusMutation.isPending}
        pendingTask={task}
      />
    </div>
  );
};

export default PendingTaskDetailPage;
