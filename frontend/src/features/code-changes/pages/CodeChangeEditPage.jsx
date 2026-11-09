import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  GitCommit,
  AlertCircle,
  Clock,
  Layers,
  FileCode,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { updateCodeChangeSchema } from '../schemas/codeChangeSchemas';
import { useCodeChangeDetails, useUpdateCodeChange } from '../hooks/useCodeChanges';
import { CHANGE_STATUSES, CODE_ENVIRONMENTS } from '../constants/codeChangeConstants';

export const CodeChangeEditPage = () => {
  const { codeChangeId } = useParams();
  const navigate = useNavigate();

  const { data: codeChange, isLoading, isError, error } = useCodeChangeDetails(codeChangeId);
  const updateMutation = useUpdateCodeChange();

  const isOriginallyCommitted = codeChange?.changeStatus === 'COMMITTED';

  // Format ISO timestamp to datetime-local string
  const formatForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const offset = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - offset);
      return local.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateCodeChangeSchema),
    defaultValues: {
      changeStatus: 'UNCOMMITTED',
      svnCommitId: '',
      changeDatetime: '',
      environment: 'LOCAL',
      remarks: '',
    },
  });

  const watchedStatus = watch('changeStatus');

  useEffect(() => {
    if (codeChange) {
      reset({
        changeStatus: codeChange.changeStatus || 'UNCOMMITTED',
        svnCommitId: codeChange.svnCommitId || '',
        changeDatetime: formatForInput(codeChange.changeDatetime),
        environment: codeChange.environment || 'LOCAL',
        remarks: codeChange.remarks || '',
      });
    }
  }, [codeChange, reset]);

  const handleStatusChange = (status) => {
    // If originally committed, do not allow changing back to UNCOMMITTED
    if (isOriginallyCommitted && status === 'UNCOMMITTED') {
      return;
    }
    setValue('changeStatus', status);
    if (status === 'UNCOMMITTED') {
      setValue('svnCommitId', '');
    }
  };

  const onSubmit = (formData) => {
    const isoDateTime = formData.changeDatetime
      ? new Date(formData.changeDatetime).toISOString()
      : new Date().toISOString();

    const payload = {
      changeStatus: formData.changeStatus,
      svnCommitId:
        formData.changeStatus === 'COMMITTED' && formData.svnCommitId
          ? formData.svnCommitId.trim()
          : null,
      changeDatetime: isoDateTime,
      environment: formData.environment,
      remarks: formData.remarks?.trim() || null,
    };

    updateMutation.mutate(
      { codeChangeId, data: payload },
      {
        onSuccess: () => {
          navigate(`/code-changes/${codeChangeId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading code change details...</p>
      </div>
    );
  }

  if (isError || !codeChange) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-base font-semibold text-red-900">Failed to load code change</h2>
        <p className="text-xs text-red-700">{error?.message || 'Code change not found.'}</p>
        <Link
          to="/code-changes"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Code Changes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/code-changes/${codeChangeId}`}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit Code Change <span className="font-mono text-blue-600">{codeChange.codeChangeCode}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Update commit status, SVN revision, environment or remarks.
          </p>
        </div>
      </div>

      {/* Readonly Context Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Work Log:</span>
            <Link
              to={`/work-logs/${codeChange.workLogId}`}
              className="font-mono font-medium text-blue-600 hover:underline"
            >
              {codeChange.workLogCode}
            </Link>
            <span className="text-slate-500">({codeChange.workDate})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold">
            {codeChange.projectCode}
          </span>
        </div>
        <div className="text-slate-600">
          <span className="font-medium text-slate-700">Task Item:</span> {codeChange.taskItemCode}:{' '}
          {codeChange.taskItemTitle}
        </div>
        <p className="text-[11px] text-slate-400">
          Work Log association and Code Change Code ({codeChange.codeChangeCode}) are permanent and cannot be modified.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          {/* Status Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Change Status <span className="text-red-500">*</span>
              </label>
              {isOriginallyCommitted && (
                <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Committed changes cannot be reverted to uncommitted
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CHANGE_STATUSES.map((status) => {
                const isSelected = watchedStatus === status.value;
                const isDisabled = isOriginallyCommitted && status.value === 'UNCOMMITTED';

                return (
                  <button
                    key={status.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleStatusChange(status.value)}
                    className={`px-3.5 py-3 text-xs font-medium rounded-xl border transition-all text-center flex items-center justify-center gap-2 ${
                      isDisabled
                        ? 'opacity-40 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isSelected
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

            {!isOriginallyCommitted && watchedStatus === 'COMMITTED' && (
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>Converting to COMMITTED:</strong> You are converting this uncommitted change set into a committed revision. The existing record and its associated file entries will be updated transactionally without creating duplicates.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SVN Commit ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                SVN Commit ID / Revision{' '}
                {watchedStatus === 'COMMITTED' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal lowercase">(disabled for uncommitted)</span>
                )}
              </label>
              <input
                type="text"
                {...register('svnCommitId')}
                disabled={watchedStatus === 'UNCOMMITTED'}
                placeholder={
                  watchedStatus === 'COMMITTED'
                    ? 'e.g. r1042 or 1042'
                    : 'Commit ID must be null for uncommitted changes'
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 ${
                  watchedStatus === 'UNCOMMITTED'
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
            <p className="text-[11px] text-slate-400 mt-1">
              Represents the actual commit time or local modification timestamp.
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks (Optional)
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              placeholder="Any revision notes or comments..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Informative notice about files */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              This code change has{' '}
              <strong className="text-slate-800">
                {codeChange.files?.length || 0} associated file entry(ies)
              </strong>
              . File records are preserved and can be managed directly on the details page.
            </span>
          </div>
          <Link
            to={`/code-changes/${codeChangeId}`}
            className="text-blue-600 hover:underline font-medium shrink-0"
          >
            Manage Files &rarr;
          </Link>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/code-changes/${codeChangeId}`}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <GitCommit className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CodeChangeEditPage;
