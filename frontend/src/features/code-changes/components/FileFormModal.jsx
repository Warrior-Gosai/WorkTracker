import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, FileCode, AlertCircle } from 'lucide-react';
import { codeChangeFileSchema } from '../schemas/codeChangeSchemas';
import { COMMON_LAYERS } from '../constants/codeChangeConstants';

export const FileFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isPending = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(codeChangeFileSchema),
    defaultValues: {
      layer: 'BACKEND',
      technology: '',
      filePath: '',
      whatChanged: '',
      whyChanged: '',
      affectedFiles: '',
      remarks: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        layer: initialData.layer || 'BACKEND',
        technology: initialData.technology || '',
        filePath: initialData.filePath || '',
        whatChanged: initialData.whatChanged || '',
        whyChanged: initialData.whyChanged || '',
        affectedFiles: initialData.affectedFiles || '',
        remarks: initialData.remarks || '',
      });
    } else {
      reset({
        layer: 'BACKEND',
        technology: '',
        filePath: '',
        whatChanged: '',
        whyChanged: '',
        affectedFiles: '',
        remarks: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              {initialData ? 'Edit File Entry' : 'Add File Entry'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Layer
              </label>
              <select
                {...register('layer')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {COMMON_LAYERS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technology
              </label>
              <input
                type="text"
                {...register('technology')}
                placeholder="e.g. Java, React, SQL..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              File Path <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('filePath')}
              placeholder="e.g. backend/src/main/java/SecurityConfig.java"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono text-xs ${
                errors.filePath ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.filePath && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.filePath.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              What Changed
            </label>
            <textarea
              rows={2}
              {...register('whatChanged')}
              placeholder="Summary of code modifications in this file..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Why Changed
            </label>
            <textarea
              rows={2}
              {...register('whyChanged')}
              placeholder="Rationale or reason for the modification..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Affected File(s)
            </label>
            <input
              type="text"
              {...register('affectedFiles')}
              placeholder="Any dependencies or related files impacted..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Remarks
            </label>
            <input
              type="text"
              {...register('remarks')}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              {isPending ? 'Saving...' : initialData ? 'Update File' : 'Add File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileFormModal;
