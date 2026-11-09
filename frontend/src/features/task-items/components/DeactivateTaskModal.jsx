import React from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import Button from '../../../components/common/Button';

export const DeactivateTaskModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  taskItem = null,
}) => {
  if (!isOpen || !taskItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deactivate Task Item</h3>
                <p className="text-xs text-slate-500 font-mono">{taskItem.taskItemCode}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="mt-4 space-y-3.5 text-xs text-slate-600">
            <p>
              Are you sure you want to deactivate <strong className="text-slate-900">{taskItem.title}</strong>?
            </p>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1">Permanent UI Deactivation</p>
              <p>
                Deactivated task items are excluded from normal listings, search results, and new work log forms. Reactivation is not supported through the user interface and must be done directly in the database.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 leading-relaxed flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Historical Data Protection:</strong> All existing work logs, code changes, and database changes linked to this task item will remain completely preserved and accessible.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-3.5 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              isLoading={isLoading}
              onClick={onConfirm}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeactivateTaskModal;

