import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { TASK_STATUSES } from '../constants/taskConstants';
import Button from '../../../components/common/Button';

export const TaskStatusModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  taskItem = null,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('OPEN');

  useEffect(() => {
    if (taskItem) {
      setSelectedStatus(taskItem.status || 'OPEN');
    }
  }, [taskItem, isOpen]);

  if (!isOpen || !taskItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(selectedStatus);
  };

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
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Workflow Status</h3>
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

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select New Status
              </label>

              <div className="space-y-2">
                {TASK_STATUSES.map((status) => {
                  const isSelected = selectedStatus === status.value;
                  return (
                    <label
                      key={status.value}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-900 font-medium'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="workflowStatus"
                          value={status.value}
                          checked={isSelected}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm">{status.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Completion timestamp note */}
            {selectedStatus === 'COMPLETED' ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p>
                  Setting status to <strong>COMPLETED</strong> will record the completion timestamp automatically.
                </p>
              </div>
            ) : taskItem.status === 'COMPLETED' ? (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <p>
                  Moving away from <strong>COMPLETED</strong> will clear the completion timestamp.
                </p>
              </div>
            ) : null}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
              <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                disabled={selectedStatus === taskItem.status}
              >
                Update Status
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusModal;

