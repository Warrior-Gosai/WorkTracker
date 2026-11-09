import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Lock,
} from 'lucide-react';
import { updateWorkLogSchema } from '../schemas/workLogSchemas';
import { useWorkLogDetails, useUpdateWorkLog } from '../hooks/useWorkLogs';
import { WORK_TYPES, WORK_ENVIRONMENTS, WORK_STATUSES } from '../constants/workLogConstants';

export const WorkLogEditPage = () => {
  const { workLogId } = useParams();
  const navigate = useNavigate();

  const { data: workLog, isLoading, isError, error } = useWorkLogDetails(workLogId);
  const updateMutation = useUpdateWorkLog();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateWorkLogSchema),
  });

  // When workLog data loads, populate the form
  useEffect(() => {
    if (workLog) {
      // Normalize times (e.g. "09:00:00" -> "09:00")
      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
        return timeStr;
      };

      reset({
        workDate: workLog.workDate || new Date().toISOString().split('T')[0],
        environment: workLog.environment || 'LOCAL',
        workType: workLog.workType || 'DEVELOPMENT',
        taskRequirement: workLog.taskRequirement || '',
        workDescription: workLog.workDescription || '',
        purposeReason: workLog.purposeReason || '',
        technologyArea: workLog.technologyArea || '',
        startTime: formatTime(workLog.startTime),
        endTime: formatTime(workLog.endTime),
        status: workLog.status || 'IN_PROGRESS',
        problemBlocker: workLog.problemBlocker || '',
        solutionResolution: workLog.solutionResolution || '',
        testingVerification: workLog.testingVerification || '',
        resultOutcome: workLog.resultOutcome || '',
        pendingNextAction: workLog.pendingNextAction || '',
        notesRemarks: workLog.notesRemarks || '',
      });
    }
  }, [workLog, reset]);

  const handleClearTimes = () => {
    setValue('startTime', '');
    setValue('endTime', '');
  };

  const onSubmit = (formData) => {
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

    updateMutation.mutate(
      { workLogId, data: payload },
      {
        onSuccess: () => {
          navigate(`/work-logs/${workLogId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading work log...</p>
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <Link
          to={`/work-logs/${workLogId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Log Details</span>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Work Log: {workLog.workLogCode}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
            {workLog.workLogCode}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Update daily work details, requirements, time tracking, and resolution outcomes.
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
            {/* Task Item (Read-only banner) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Task Item (Immutable)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium">
                <span className="font-mono text-blue-600 mr-1.5">[{workLog.taskItemCode}]</span>
                {workLog.taskItemTitle || 'Task'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Task item association cannot be changed after creation.
              </p>
            </div>

            {/* Project (Read-only banner) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Project (Immutable)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium">
                <span className="font-mono text-slate-500 mr-1.5">[{workLog.projectCode || 'PRJ'}]</span>
                {workLog.projectName || '—'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Project is derived through the associated task item.
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
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
              Both times must either be provided or both left blank. Total duration will be
              recalculated automatically by the backend upon saving.
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
            </div>

            {/* Problem / Blocker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Problem / Blocker
              </label>
              <textarea
                rows={2}
                {...register('problemBlocker')}
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
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/work-logs/${workLogId}`}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
          >
            {updateMutation.isPending ? 'Saving...' : 'Update Work Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkLogEditPage;

