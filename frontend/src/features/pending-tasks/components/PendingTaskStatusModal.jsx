import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { PENDING_TASK_STATUSES, STATUS_COLORS } from '../constants/pendingTaskConstants';
import Button from '../../../components/common/Button';

export const PendingTaskStatusModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  pendingTask = null,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('PENDING');

  useEffect(() => {
    if (pendingTask) {
      setSelectedStatus(pendingTask.status || 'PENDING');
    }
  }, [pendingTask, isOpen]);

  if (!isOpen || !pendingTask) return null;

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
                <h3 className="text-base font-bold text-slate-900">Update Status</h3>
                <p className="text-xs text-slate-500 font-mono">{pendingTask.pendingTaskCode}</p>
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
              <p className="text-xs text-slate-500 mb-2">
                Task Title: <span className="font-semibold text-slate-800">{pendingTask.title}</span>
              </p>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select New Status
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PENDING_TASK_STATUSES.map((st) => {
                  const isSelected = selectedStatus === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setSelectedStatus(st.value)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 text-indigo-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            st.value === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : st.value === 'CANCELLED'
                              ? 'bg-slate-400'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span>{st.label}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          STATUS_COLORS[st.value] || 'bg-slate-100'
                        }`}
                      >
                        {st.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedStatus === 'COMPLETED' && (
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>Setting status to <strong>COMPLETED</strong> records the completion timestamp automatically.</span>
              </div>
            )}

            {selectedStatus !== 'COMPLETED' && pendingTask.status === 'COMPLETED' && (
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <span>Moving away from <strong>COMPLETED</strong> clears the completion timestamp automatically.</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                Update Status
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PendingTaskStatusModal;
