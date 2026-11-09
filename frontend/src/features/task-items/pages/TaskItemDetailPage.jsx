import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  RefreshCw,
  Ban,
  Calendar,
  CheckCircle2,
  FolderKanban,
  FileText,
  MessageSquare,
  History,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useTaskItemDetails,
  useTaskItemHistory,
  useUpdateTaskItem,
  useUpdateTaskStatus,
  useDeactivateTaskItem,
} from '../hooks/useTaskItems';
import TaskItemFormModal from '../components/TaskItemFormModal';
import TaskStatusModal from '../components/TaskStatusModal';
import DeactivateTaskModal from '../components/DeactivateTaskModal';
import TaskItemHistorySection from '../components/TaskItemHistorySection';
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { ROUTES } from '../../../constants';

export const TaskItemDetailPage = () => {
  const { taskItemId } = useParams();
  const navigate = useNavigate();

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const { data: taskItem, isLoading, isError, error } = useTaskItemDetails(taskItemId);
  const { data: history, isLoading: isLoadingHistory } = useTaskItemHistory(taskItemId);

  const updateMutation = useUpdateTaskItem();
  const statusMutation = useUpdateTaskStatus();
  const deactivateMutation = useDeactivateTaskItem();

  const handleUpdate = async (values) => {
    await updateMutation.mutateAsync({
      taskItemId,
      data: values,
    });
    setIsEditModalOpen(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    await statusMutation.mutateAsync({
      taskItemId,
      status: newStatus,
    });
    setIsStatusModalOpen(false);
  };

  const handleDeactivateConfirm = async () => {
    await deactivateMutation.mutateAsync(taskItemId);
    setIsDeactivateModalOpen(false);
    navigate(ROUTES.TASK_ITEMS, { replace: true });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getTaskTypeLabel = (val) => {
    const found = TASK_TYPES.find((t) => t.value === val);
    return found ? found.label : val;
  };

  const getPriorityBadge = (val) => {
    const found = TASK_PRIORITIES.find((p) => p.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getStatusBadge = (val) => {
    const found = TASK_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading task item details...</p>
      </div>
    );
  }

  if (isError || !taskItem) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.TASK_ITEMS}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Task Items
        </Link>
        <Alert
          type="error"
          title="Task Item Not Found or Inactive"
          message={error?.response?.data?.message || 'The requested task item does not exist or has been deactivated.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to={ROUTES.TASK_ITEMS}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Task Items
        </Link>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={Edit3}
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            icon={RefreshCw}
          >
            Change Status
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsDeactivateModalOpen(true)}
            icon={Ban}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Deactivate
          </Button>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="sm:flex sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {taskItem.taskItemCode}
              </span>

              <Link
                to={`${ROUTES.PROJECTS}/${taskItem.projectId}`}
                className="font-mono text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 transition-colors flex items-center space-x-1"
                title="View Project"
              >
                <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                <span>{taskItem.projectCode}</span>
                {taskItem.projectName && <span>— {taskItem.projectName}</span>}
              </Link>

              <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {getTaskTypeLabel(taskItem.taskType)}
              </span>

              {getPriorityBadge(taskItem.priority)}
              {getStatusBadge(taskItem.status)}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {taskItem.title}
            </h2>
          </div>
        </div>

        {/* Timestamps Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Created At:</span>
            <span className="font-mono text-slate-700 font-medium">{formatDate(taskItem.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last Updated:</span>
            <span className="font-mono text-slate-700 font-medium">{formatDate(taskItem.updatedAt)}</span>
          </div>
          {taskItem.completedAt ? (
            <div className="flex items-center space-x-2 text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed At:</span>
              <span className="font-mono">{formatDate(taskItem.completedAt)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Completed: In Progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Description & Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3>Description</h3>
          </div>
          {taskItem.description ? (
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {taskItem.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No description provided for this task item.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-sm">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3>Remarks</h3>
          </div>
          {taskItem.remarks ? (
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {taskItem.remarks}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No internal remarks recorded.</p>
          )}
        </div>
      </div>

      {/* Task History Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">Task History & Change Logs</h3>
        </div>
        <p className="text-xs text-slate-500">
          Associated daily work logs, SVN code commits and database changes
        </p>

        <TaskItemHistorySection history={history} isLoading={isLoadingHistory} />
      </div>

      {/* Modals */}
      <TaskItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        taskItem={taskItem}
      />

      <TaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusUpdate}
        isLoading={statusMutation.isPending}
        taskItem={taskItem}
      />

      <DeactivateTaskModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
        isLoading={deactivateMutation.isPending}
        taskItem={taskItem}
      />
    </div>
  );
};

export default TaskItemDetailPage;

