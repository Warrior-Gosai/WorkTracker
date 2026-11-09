import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  GitCommit,
  Layers,
  FileCode,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Clock,
  FolderGit2,
} from 'lucide-react';
import { createCodeChangeSchema } from '../schemas/codeChangeSchemas';
import { useCreateCodeChange } from '../hooks/useCodeChanges';
import { workLogService } from '../../work-logs/services/workLogService';
import { CHANGE_STATUSES, CODE_ENVIRONMENTS, COMMON_LAYERS } from '../constants/codeChangeConstants';

export const CodeChangeCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWorkLogId = searchParams.get('workLogId');

  const createMutation = useCreateCodeChange();
  const [workLogsList, setWorkLogsList] = useState([]);
  const [loadingWorkLogs, setLoadingWorkLogs] = useState(true);
  const [selectedWorkLog, setSelectedWorkLog] = useState(null);

  // Default to current local time formatted for datetime-local
  const getNowLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offset);
    return localTime.toISOString().slice(0, 16);
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCodeChangeSchema),
    defaultValues: {
      workLogId: preselectedWorkLogId ? Number(preselectedWorkLogId) : '',
      changeStatus: 'UNCOMMITTED',
      svnCommitId: '',
      changeDatetime: getNowLocal(),
      environment: 'LOCAL',
      remarks: '',
      files: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'files',
  });

  const watchedWorkLogId = watch('workLogId');
  const watchedChangeStatus = watch('changeStatus');

  // Load recent work logs for selection
  useEffect(() => {
    let isMounted = true;
    workLogService
      .getWorkLogs({ size: 100, sortBy: 'workDate', direction: 'desc' })
      .then((res) => {
        if (isMounted) {
          const list = res?.content || [];
          setWorkLogsList(list);
          setLoadingWorkLogs(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load work logs for code change', err);
        if (isMounted) setLoadingWorkLogs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected work log preview
  useEffect(() => {
    if (watchedWorkLogId && workLogsList.length > 0) {
      const found = workLogsList.find((w) => String(w.workLogId) === String(watchedWorkLogId));
      setSelectedWorkLog(found || null);
    } else {
      setSelectedWorkLog(null);
    }
  }, [watchedWorkLogId, workLogsList]);

  // When changing status to UNCOMMITTED, clear commit ID
  const handleStatusChange = (status) => {
    setValue('changeStatus', status);
    if (status === 'UNCOMMITTED') {
      setValue('svnCommitId', '');
    }
  };

  const handleAddFile = () => {
    append({
      layer: 'BACKEND',
      technology: '',
      filePath: '',
      whatChanged: '',
      whyChanged: '',
      affectedFiles: '',
      remarks: '',
    });
  };

  const onSubmit = (formData) => {
    // Convert local datetime to ISO string
    const isoDateTime = formData.changeDatetime
      ? new Date(formData.changeDatetime).toISOString()
      : new Date().toISOString();

    const payload = {
      workLogId: Number(formData.workLogId),
      changeStatus: formData.changeStatus,
      svnCommitId:
        formData.changeStatus === 'COMMITTED' && formData.svnCommitId
          ? formData.svnCommitId.trim()
          : null,
      changeDatetime: isoDateTime,
      environment: formData.environment,
      remarks: formData.remarks?.trim() || null,
      files:
        formData.files && formData.files.length > 0
          ? formData.files.map((f) => ({
              layer: f.layer || null,
              technology: f.technology?.trim() || null,
              filePath: f.filePath.trim(),
              whatChanged: f.whatChanged?.trim() || null,
              whyChanged: f.whyChanged?.trim() || null,
              affectedFiles: f.affectedFiles?.trim() || null,
              remarks: f.remarks?.trim() || null,
            }))
          : [],
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        navigate(`/code-changes/${res.codeChangeId}`);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/code-changes"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Code Change</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record committed revisions or uncommitted local work linked to a work log.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Work Log Association */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              1. Work Log Association
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Daily Work Log <span className="text-red-500">*</span>
            </label>
            <select
              {...register('workLogId')}
              disabled={loadingWorkLogs}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 ${
                errors.workLogId
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            >
              <option value="">
                {loadingWorkLogs ? 'Loading work logs...' : '— Select a Work Log —'}
              </option>
              {workLogsList.map((w) => (
                <option key={w.workLogId} value={w.workLogId}>
                  {w.workLogCode} ({w.workDate}) — {w.taskItemCode}: {w.taskItemTitle} [{w.projectCode}]
                </option>
              ))}
            </select>
            {errors.workLogId && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.workLogId.message}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Note: Work Log association is permanent and cannot be changed after creation.
            </p>
          </div>

          {/* Context preview card if work log selected */}
          {selectedWorkLog && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {selectedWorkLog.workLogCode} ({selectedWorkLog.workDate})
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-medium">
                  {selectedWorkLog.projectCode}
                </span>
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-700">Task:</strong> {selectedWorkLog.taskItemCode} - {selectedWorkLog.taskItemTitle}
              </p>
              {selectedWorkLog.taskRequirement && (
                <p className="text-slate-500 line-clamp-2">
                  <strong className="text-slate-700">Requirement:</strong> {selectedWorkLog.taskRequirement}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Commit Status & Environment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GitCommit className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              2. Status & Commit Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Radio / Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Change Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CHANGE_STATUSES.map((status) => {
                  const isSelected = watchedChangeStatus === status.value;
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusChange(status.value)}
                      className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? status.value === 'COMMITTED'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                            : 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{status.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.changeStatus && (
                <p className="mt-1 text-xs text-red-600">{errors.changeStatus.message}</p>
              )}
            </div>

            {/* Environment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                {...register('environment')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {CODE_ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
              {errors.environment && (
                <p className="mt-1 text-xs text-red-600">{errors.environment.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* SVN Commit ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                SVN Commit ID / Revision{' '}
                {watchedChangeStatus === 'COMMITTED' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal lowercase">(disabled for uncommitted)</span>
                )}
              </label>
              <input
                type="text"
                {...register('svnCommitId')}
                disabled={watchedChangeStatus === 'UNCOMMITTED'}
                placeholder={
                  watchedChangeStatus === 'COMMITTED'
                    ? 'e.g. r1042 or 1042'
                    : 'Commit ID must be null for uncommitted changes'
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 ${
                  watchedChangeStatus === 'UNCOMMITTED'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : errors.svnCommitId
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.svnCommitId && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.svnCommitId.message}</span>
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Change Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('changeDatetime')}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 ${
                  errors.changeDatetime
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.changeDatetime && (
                <p className="mt-1 text-xs text-red-600">{errors.changeDatetime.message}</p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks (Optional)
            </label>
            <textarea
              {...register('remarks')}
              rows={2}
              placeholder="Any additional notes or revision context..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Section 3: Changed Files (Optional) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  3. Changed Files (Optional)
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File Entry</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <span>
              File records are completely optional for both uncommitted and committed changes. You can log a code change now and optionally add or edit individual file entries later.
            </span>
          </div>

          {fields.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              No individual files added yet. Click &quot;Add File Entry&quot; above if you want to detail specific files.
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-xs text-slate-700">
                      File #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      title="Remove file entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Layer */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Layer
                      </label>
                      <select
                        {...register(`files.${index}.layer`)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-hidden"
                      >
                        {COMMON_LAYERS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Technology */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Technology
                      </label>
                      <input
                        type="text"
                        {...register(`files.${index}.technology`)}
                        placeholder="e.g. Java, React, SQL"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    {/* Affected Files */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Affected Files
                      </label>
                      <input
                        type="text"
                        {...register(`files.${index}.affectedFiles`)}
                        placeholder="Related dependencies"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* File Path */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      File Path <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`files.${index}.filePath`)}
                      placeholder="e.g. src/main/java/com/devworktracker/WorkLogService.java"
                      className={`w-full px-2.5 py-1.5 text-xs border rounded-lg font-mono bg-white text-slate-800 focus:outline-hidden ${
                        errors.files?.[index]?.filePath
                          ? 'border-red-400 ring-1 ring-red-200'
                          : 'border-slate-200'
                      }`}
                    />
                    {errors.files?.[index]?.filePath && (
                      <p className="mt-0.5 text-[11px] text-red-600">
                        {errors.files[index].filePath.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* What Changed */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        What Changed
                      </label>
                      <textarea
                        {...register(`files.${index}.whatChanged`)}
                        rows={2}
                        placeholder="Brief summary of file changes"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    {/* Why Changed */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Why Changed
                      </label>
                      <textarea
                        {...register(`files.${index}.whyChanged`)}
                        rows={2}
                        placeholder="Reason or bug ticket reference"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/code-changes"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <GitCommit className="w-4 h-4" />
            <span>{createMutation.isPending ? 'Logging Code Change...' : 'Log Code Change'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CodeChangeCreatePage;
