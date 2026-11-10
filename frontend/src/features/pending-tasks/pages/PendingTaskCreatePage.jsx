import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Hourglass,
  ArrowLeft,
  Save,
  FolderKanban,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { createPendingTaskSchema } from '../schemas/pendingTaskSchemas';
import { useCreatePendingTask } from '../hooks/usePendingTasks';
import {
  PENDING_TASK_PRIORITIES,
  PENDING_TASK_STATUSES,
} from '../constants/pendingTaskConstants';
import { projectService } from '../../projects/services/projectService';
import Button from '../../../components/common/Button';

export const PendingTaskCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('projectId') || '';

  const [activeProjects, setActiveProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const createMutation = useCreatePendingTask();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createPendingTaskSchema),
    defaultValues: {
      projectId: defaultProjectId,
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      remarks: '',
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedStatus = watch('status');

  // Load active projects only (status = 1)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProjects(true);
    projectService
      .getProjects({ status: 1, size: 100, sortBy: 'projectName', direction: 'asc' })
      .then((res) => {
        if (isMounted && res?.content) {
          setActiveProjects(res.content);
        }
      })
      .catch((err) => {
        console.error('Failed to load active projects:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingProjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        projectId: Number(data.projectId),
      });
      navigate(`/pending-tasks/${result.pendingTaskId}`);
    } catch (err) {
      // Error handled by mutation hook toast
    }
  };

  const selectedProjectObj = activeProjects.find(
    (p) => String(p.projectId) === String(selectedProjectId)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/pending-tasks"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Pending Tasks
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Pending Task</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record a reminder, follow-up item, or action item directly under a Project
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>Task Information</span>
          </h2>

          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('projectId')}
              disabled={isLoadingProjects}
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.projectId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            >
              <option value="">-- Select an Active Project --</option>
              {activeProjects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} - {p.projectName}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.projectId.message}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Only active projects can receive new pending tasks.
            </p>
          </div>

          {/* Project Context Box if selected */}
          {selectedProjectObj && (
            <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center space-x-3 text-xs">
              <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-mono font-semibold text-indigo-700 mr-2">
                  {selectedProjectObj.projectCode}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedProjectObj.projectName}
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Update PostgreSQL connection pool timeout settings"
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
              placeholder="Detailed explanation, steps, or context for this pending task..."
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

          {/* Completion info banner if created as COMPLETED */}
          {selectedStatus === 'COMPLETED' && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-xs text-emerald-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>
                Since status is set to <strong>COMPLETED</strong>, the backend will record the completion timestamp automatically upon creation.
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
              placeholder="Internal notes or observations..."
              {...register('remarks')}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to="/pending-tasks"
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={createMutation.isPending || isSubmitting}
          >
            Save Pending Task
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PendingTaskCreatePage;
