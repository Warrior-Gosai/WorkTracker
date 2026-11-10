import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Database,
  Clock,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { createDbChangeSchema } from '../schemas/dbChangeSchemas';
import { useCreateDbChange } from '../hooks/useDbChanges';
import { workLogService } from '../../work-logs/services/workLogService';
import { DB_ENVIRONMENTS, DATABASE_NAMES, OBJECT_TYPES } from '../constants/dbChangeConstants';

export const DbChangeCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWorkLogId = searchParams.get('workLogId');

  const createMutation = useCreateDbChange();
  const [workLogsList, setWorkLogsList] = useState([]);
  const [loadingWorkLogs, setLoadingWorkLogs] = useState(true);
  const [selectedWorkLog, setSelectedWorkLog] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createDbChangeSchema),
    defaultValues: {
      workLogId: preselectedWorkLogId ? Number(preselectedWorkLogId) : '',
      environment: 'LOCAL',
      databaseName: 'PostgreSQL',
      objectType: 'Table',
      objectName: '',
      whatChanged: '',
      whyChanged: '',
      affectedObject: '',
      remarks: '',
    },
  });

  const watchedWorkLogId = watch('workLogId');

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
        console.error('Failed to load work logs for DB change', err);
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

  const onSubmit = (formData) => {
    const payload = {
      workLogId: Number(formData.workLogId),
      environment: formData.environment,
      databaseName: formData.databaseName,
      objectType: formData.objectType,
      objectName: formData.objectName.trim(),
      whatChanged: formData.whatChanged?.trim() || null,
      whyChanged: formData.whyChanged.trim(),
      affectedObject: formData.affectedObject?.trim() || null,
      remarks: formData.remarks?.trim() || null,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        navigate(`/db-changes/${res.dbChangeId}`);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/db-changes"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Database Change</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record a database schema modification, table, trigger or script change linked to a work log.
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

        {/* Section 2: Database Object Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              2. Database Object Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Environment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Environment <span className="text-red-500">*</span>
              </label>
              <select
                {...register('environment')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {DB_ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
              {errors.environment && (
                <p className="mt-1 text-xs text-red-600">{errors.environment.message}</p>
              )}
            </div>

            {/* Database Platform */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Database Platform <span className="text-red-500">*</span>
              </label>
              <select
                {...register('databaseName')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {DATABASE_NAMES.map((db) => (
                  <option key={db} value={db}>
                    {db}
                  </option>
                ))}
              </select>
              {errors.databaseName && (
                <p className="mt-1 text-xs text-red-600">{errors.databaseName.message}</p>
              )}
            </div>

            {/* Object Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Object Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('objectType')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {OBJECT_TYPES.map((ot) => (
                  <option key={ot} value={ot}>
                    {ot}
                  </option>
                ))}
              </select>
              {errors.objectType && (
                <p className="mt-1 text-xs text-red-600">{errors.objectType.message}</p>
              )}
            </div>
          </div>

          {/* Object Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Object Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('objectName')}
              placeholder="e.g. app_user, sp_calculate_payroll, idx_user_email..."
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 ${
                errors.objectName
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.objectName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.objectName.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Modification Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              3. Modification Details & Reason
            </h2>
          </div>

          {/* Why Changed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Why Changed / Business Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('whyChanged')}
              rows={2}
              placeholder="Business requirement or bug fix necessitating this database modification..."
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 ${
                errors.whyChanged
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {errors.whyChanged && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.whyChanged.message}</span>
              </p>
            )}
          </div>

          {/* What Changed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              What Changed (Optional)
            </label>
            <textarea
              {...register('whatChanged')}
              rows={3}
              placeholder="Technical description of changes, e.g. Added columns, altered constraint, updated view SQL query..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Affected Object(s) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Affected Object(s) (Optional)
            </label>
            <input
              type="text"
              {...register('affectedObject')}
              placeholder="Related foreign tables, indexes, or dependent views..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks (Optional)
            </label>
            <textarea
              {...register('remarks')}
              rows={2}
              placeholder="Additional deployment notes, rollback guidance, or migration hints..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/db-changes"
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>{createMutation.isPending ? 'Logging DB Change...' : 'Log DB Change'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DbChangeCreatePage;
