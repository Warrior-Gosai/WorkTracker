import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { createWorkLogSchema } from '../schemas/workLogSchemas';
import { useCreateWorkLog } from '../hooks/useWorkLogs';
import { taskItemService } from '../../task-items/services/taskItemService';
import { WORK_TYPES, WORK_ENVIRONMENTS, WORK_STATUSES } from '../constants/workLogConstants';

export const WorkLogCreatePage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateWorkLog();

  const [activeTasks, setActiveTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createWorkLogSchema),
    defaultValues: {
      workDate: todayStr,
      environment: 'LOCAL',
      workType: 'DEVELOPMENT',
      taskRequirement: '',
      workDescription: '',
      purposeReason: '',
      technologyArea: '',
      startTime: '09:00',
      endTime: '',
      status: 'IN_PROGRESS',
      problemBlocker: '',
      solutionResolution: '',
      testingVerification: '',
      resultOutcome: '',
      pendingNextAction: '',
      notesRemarks: '',
    },
  });

  const watchedTaskItemId = watch('taskItemId');

  // Load active task items on mount
  useEffect(() => {
    let isMounted = true;
    taskItemService
      .getTaskItems({ size: 100, sortBy: 'title', direction: 'asc' })
      .then((res) => {
        if (isMounted) {
          const content = res?.content || [];
          setActiveTasks(content);
          setLoadingTasks(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load active task items', err);
        if (isMounted) setLoadingTasks(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected task item details when taskItemId changes
  useEffect(() => {
    if (watchedTaskItemId) {
      const found = activeTasks.find((t) => String(t.taskItemId) === String(watchedTaskItemId));
      setSelectedTask(found || null);
    } else {
      setSelectedTask(null);
    }
  }, [watchedTaskItemId, activeTasks]);

  const handleClearTimes = () => {
    setValue('startTime', '');
    setValue('endTime', '');
  };

  const onSubmit = (formData) => {
    // Format times: if empty string, set null
    const payload = {
      ...formData,
      startTime: formData.startTime?.trim() ? formData.startTime.trim() : null,
      endTime: formData.endTime?.trim() ? formData.endTime.trim() : null,
      workDescription: formData.workDescription?.trim() || null,
      purposeReason: formData.purposeReason?.trim() || null,
      technologyArea: formData.technologyArea?.trim() || null,
      problemBlocker: formData.problemBlocker?.trim() || null,
      solutionResolution: formData.solutionResolution?.trim() || null,
      testingVerification: formData.testingVerification?.trim() || null,
      resultOutcome: formData.resultOutcome?.trim() || null,
      pendingNextAction: formData.pendingNextAction?.trim() || null,
      notesRemarks: formData.notesRemarks?.trim() || null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        navigate('/work-logs');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button and page title */}
      <div>
        <Link
          to="/work-logs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Logs</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Work Log</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record development tasks, requirement implementation, time tracking, and verification outcomes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">1. Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Task Item Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Task Item <span className="text-red-500">*</span>
              </label>
              <select
                {...register('taskItemId')}
                disabled={loadingTasks}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${
                  errors.taskItemId ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              >
                <option value="">
                  {loadingTasks ? 'Loading active tasks...' : '-- Select Active Task Item --'}
                </option>
                {activeTasks.map((task) => (
                  <option key={task.taskItemId} value={task.taskItemId}>
                    [{task.taskItemCode}] {task.title} ({task.projectName || 'No Project'})
                  </option>
                ))}
              </select>
              {errors.taskItemId && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.taskItemId.message}
                </p>
              )}
            </div>

            {/* Project (Auto-populated, Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project (Derived from Task)
              </label>
              <input
                type="text"
                readOnly
                value={
                  selectedTask
                    ? `[${selectedTask.projectCode || 'PRJ'}] ${selectedTask.projectName || '—'}`
                    : 'Select a task item to view project'
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Project association is derived through the selected task item.
              </p>
            </div>

            {/* Work Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  {...register('workDate')}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${
                    errors.workDate ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.workDate && (
                <p className="text-xs text-red-600 mt-1">{errors.workDate.message}</p>
              )}
            </div>

            {/* Environment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                {...register('environment')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {WORK_ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('workType')}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${
                  errors.workType ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              >
                {WORK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.workType && (
                <p className="text-xs text-red-600 mt-1">{errors.workType.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Work Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">2. Work Details</h2>
          </div>

          <div className="space-y-4">
            {/* Task / Requirement */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Task / Requirement <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register('taskRequirement')}
                placeholder="State the requirement or issue implemented in this work session..."
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${
                  errors.taskRequirement ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.taskRequirement && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.taskRequirement.message}
                </p>
              )}
            </div>

            {/* Work Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Description
              </label>
              <textarea
                rows={3}
                {...register('workDescription')}
                placeholder="Technical details of changes made, algorithms, refactoring, or code modifications..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purpose / Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Purpose / Reason
                </label>
                <textarea
                  rows={2}
                  {...register('purposeReason')}
                  placeholder="Business context, reason for change, or user story..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              {/* Technology / Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technology / Area
                </label>
                <input
                  type="text"
                  maxLength={200}
                  {...register('technologyArea')}
                  placeholder="e.g. Spring Security, Flyway, React Query, PostgreSQL"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">Maximum 200 characters.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Time Tracking */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">3. Time Tracking</h2>
            </div>
            <button
              type="button"
              onClick={handleClearTimes}
              className="text-xs text-slate-500 hover:text-red-600 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Clear Both Times</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                step="60"
                {...register('startTime')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default 09:00 AM.</p>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                step="60"
                {...register('endTime')}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800 ${
                  errors.endTime ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">Optional. Supports overnight shifts.</p>
            </div>
          </div>

          {errors.endTime && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errors.endTime.message}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Both times must either be provided or both left blank. Total hours and duration are
              calculated authoritatively by the backend upon save.
            </span>
          </div>
        </div>

        {/* Section 4: Outcome & Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">4. Outcome & Status</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Log Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full sm:w-1/2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {WORK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Work log status is independent of task item status.
              </p>
            </div>

            {/* Problem / Blocker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Problem / Blocker
              </label>
              <textarea
                rows={2}
                {...register('problemBlocker')}
                placeholder="Any impediment, blocker or error encountered..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Solution / Resolution */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Solution / Resolution
              </label>
              <textarea
                rows={2}
                {...register('solutionResolution')}
                placeholder="How the blocker was addressed or resolved..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Testing / Verification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Testing / Verification
              </label>
              <textarea
                rows={2}
                {...register('testingVerification')}
                placeholder="Unit tests executed, manual verification steps performed..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Result / Outcome */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Result / Outcome
              </label>
              <textarea
                rows={2}
                {...register('resultOutcome')}
                placeholder="Final result, test pass count, feature acceptance..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Pending / Next Action */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pending / Next Action
              </label>
              <textarea
                rows={2}
                {...register('pendingNextAction')}
                placeholder="Next steps, follow-up tasks, pending code commits..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Notes / Remarks
              </label>
              <textarea
                rows={2}
                {...register('notesRemarks')}
                placeholder="Any additional notes or references..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/work-logs"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Work Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkLogCreatePage;

