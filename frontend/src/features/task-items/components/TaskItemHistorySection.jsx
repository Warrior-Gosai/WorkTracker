import React from 'react';
import { Clock, FileCode, Database, GitCommit, Layers, AlertCircle } from 'lucide-react';

export const TaskItemHistorySection = ({ history, isLoading = false }) => {
  const workLogs = history?.workLogs || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Loading task history...
      </div>
    );
  }

  if (workLogs.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Work History Yet</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          No daily work logs or change records have been logged against this task item.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workLogs.map((wl) => (
        <div
          key={wl.workLogId}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          {/* Work Log Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {wl.workLogCode}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {wl.workType}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {formatDate(wl.workDate)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Env: {wl.environment}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {wl.status}
              </span>
            </div>
          </div>

          {/* Requirement & Description */}
          <div className="text-xs space-y-1.5">
            <div>
              <span className="font-semibold text-slate-700">Requirement: </span>
              <span className="text-slate-600">{wl.taskRequirement}</span>
            </div>
            {wl.workDescription && (
              <div>
                <span className="font-semibold text-slate-700">Description: </span>
                <span className="text-slate-600">{wl.workDescription}</span>
              </div>
            )}
          </div>

          {/* Sub-records: Code Changes & DB Changes */}
          {(wl.codeChanges.length > 0 || wl.dbChanges.length > 0) && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Code Changes */}
              {wl.codeChanges.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Code Changes ({wl.codeChanges.length})</span>
                  </div>
                  {wl.codeChanges.map((cc) => (
                    <div
                      key={cc.codeChangeId}
                      className="p-2 bg-white rounded border border-slate-200 space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700">{cc.codeChangeCode}</span>
                        <span className="text-slate-500">{cc.changeStatus}</span>
                      </div>
                      {cc.svnCommitId && (
                        <div className="text-slate-600 flex items-center space-x-1">
                          <GitCommit className="w-3 h-3 text-slate-400" />
                          <span>SVN: {cc.svnCommitId}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* DB Changes */}
              {wl.dbChanges.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    <span>DB Changes ({wl.dbChanges.length})</span>
                  </div>
                  {wl.dbChanges.map((dc) => (
                    <div
                      key={dc.dbChangeId}
                      className="p-2 bg-white rounded border border-slate-200 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-indigo-700">{dc.dbChangeCode}</span>
                        <span className="text-slate-500">{dc.databaseName}</span>
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold">{dc.objectType}: </span>
                        <span className="font-mono text-slate-800">{dc.objectName}</span>
                      </div>
                      {dc.whatChanged && (
                        <p className="text-slate-500 truncate">{dc.whatChanged}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskItemHistorySection;

