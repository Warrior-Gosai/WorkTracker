import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Hourglass,
  ArrowLeft,
  Save,
  FolderKanban,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { updatePendingTaskSchema } from '../schemas/pendingTaskSchemas';
import { usePendingTaskDetails, useUpdatePendingTask } from '../hooks/usePendingTasks';
import {
  PENDING_TASK_PRIORITIES,
  PENDING_TASK_STATUSES,
} from '../constants/pendingTaskConstants';
import Button from '../../../components/common/Button';

export const PendingTaskEditPage = () => {
  const { pendingTaskId } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading, isError, error } = usePendingTaskDetails(pendingTaskId);
  const updateMutation = useUpdatePendingTask();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updatePendingTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      remarks: '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'PENDING',
        dueDate: task.dueDate || '',
        remarks: task.remarks || '',
      });
    }
  }, [task, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync({
        pendingTaskId,
        data,
      });
      navigate(`/pending-tasks/${pendingTaskId}`);
    } catch (err) {
      // Handled by mutation toast
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading pending task...</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/pending-tasks/${pendingTaskId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Details
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">Edit Pending Task</h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {task.pendingTaskCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update task title, status, priority, due date, and remarks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Project Association Banner */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <FolderKanban className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Project Context:</span>
            <span className="font-mono px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">
              {task.projectCode}
            </span>
            <span className="text-slate-900 font-medium">{task.projectName}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Permanent association</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            Editable Task Details
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Priority & Status & Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                {PENDING_TASK_PRIORITIES.map((pr) => (
                  <option key={pr.value} value={pr.value}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                {PENDING_TASK_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Change Notice */}
          {selectedStatus === 'COMPLETED' && task.status !== 'COMPLETED' && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-xs text-emerald-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>
                Saving with status <strong>COMPLETED</strong> will record the completion timestamp automatically.
              </span>
            </div>
          )}

          {selectedStatus !== 'COMPLETED' && task.status === 'COMPLETED' && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <span>
                Moving status away from <strong>COMPLETED</strong> will clear the completion timestamp automatically.
              </span>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              {...register('remarks')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to={`/pending-tasks/${pendingTaskId}`}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={updateMutation.isPending || isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PendingTaskEditPage;
