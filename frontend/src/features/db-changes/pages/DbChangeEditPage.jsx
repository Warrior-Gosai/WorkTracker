import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Database,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { updateDbChangeSchema } from '../schemas/dbChangeSchemas';
import { useDbChangeDetails, useUpdateDbChange } from '../hooks/useDbChanges';
import { DB_ENVIRONMENTS, DATABASE_NAMES, OBJECT_TYPES } from '../constants/dbChangeConstants';

export const DbChangeEditPage = () => {
  const { dbChangeId } = useParams();
  const navigate = useNavigate();

  const { data: dbChange, isLoading, isError, error } = useDbChangeDetails(dbChangeId);
  const updateMutation = useUpdateDbChange();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateDbChangeSchema),
    defaultValues: {
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

  useEffect(() => {
    if (dbChange) {
      reset({
        environment: dbChange.environment || 'LOCAL',
        databaseName: dbChange.databaseName || 'PostgreSQL',
        objectType: dbChange.objectType || 'Table',
        objectName: dbChange.objectName || '',
        whatChanged: dbChange.whatChanged || '',
        whyChanged: dbChange.whyChanged || '',
        affectedObject: dbChange.affectedObject || '',
        remarks: dbChange.remarks || '',
      });
    }
  }, [dbChange, reset]);

  const onSubmit = (formData) => {
    const payload = {
      environment: formData.environment,
      databaseName: formData.databaseName,
      objectType: formData.objectType,
      objectName: formData.objectName.trim(),
      whatChanged: formData.whatChanged?.trim() || null,
      whyChanged: formData.whyChanged.trim(),
      affectedObject: formData.affectedObject?.trim() || null,
      remarks: formData.remarks?.trim() || null,
    };

    updateMutation.mutate(
      { dbChangeId, data: payload },
      {
        onSuccess: () => {
          navigate(`/db-changes/${dbChangeId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading database change details...</p>
      </div>
    );
  }

  if (isError || !dbChange) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-base font-semibold text-red-900">Failed to load database change</h2>
        <p className="text-xs text-red-700">{error?.message || 'Database change not found.'}</p>
        <Link
          to="/db-changes"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Database Changes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/db-changes/${dbChangeId}`}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit DB Change <span className="font-mono text-blue-600">{dbChange.dbChangeCode}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Update database platform, object details, reason or technical modification descriptions.
          </p>
        </div>
      </div>

      {/* Readonly Context Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Work Log:</span>
            <Link
              to={`/work-logs/${dbChange.workLogId}`}
              className="font-mono font-medium text-blue-600 hover:underline"
            >
              {dbChange.workLogCode}
            </Link>
            <span className="text-slate-500">({dbChange.workDate})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold">
            {dbChange.projectCode}
          </span>
        </div>
        <div className="text-slate-600">
          <span className="font-medium text-slate-700">Task Item:</span> {dbChange.taskItemCode}:{' '}
          {dbChange.taskItemTitle}
        </div>
        <p className="text-[11px] text-slate-400">
          Work Log association and DB Change Code ({dbChange.dbChangeCode}) are permanent and cannot be modified.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
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
              placeholder="e.g. app_user, sp_calculate_payroll..."
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

          {/* Why Changed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Why Changed / Business Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('whyChanged')}
              rows={2}
              placeholder="Business requirement or bug fix necessitating this change..."
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
              placeholder="Technical description of changes, altered constraints, updated column data types..."
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
              placeholder="Additional deployment notes or rollback hints..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/db-changes/${dbChangeId}`}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DbChangeEditPage;
