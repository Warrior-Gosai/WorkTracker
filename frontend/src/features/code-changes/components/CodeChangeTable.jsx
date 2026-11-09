import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitCommit,
  FileCode,
} from 'lucide-react';
import { CHANGE_STATUSES, CODE_ENVIRONMENTS } from '../constants/codeChangeConstants';

export const CodeChangeTable = ({
  codeChanges = [],
  sortBy = 'changeDatetime',
  direction = 'desc',
  onSort,
}) => {
  const renderSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-400 opacity-60" />;
    }
    return direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
    );
  };

  const getStatusBadge = (val) => {
    const found = CHANGE_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getEnvironmentBadge = (val) => {
    const found = CODE_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!codeChanges || codeChanges.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <GitCommit className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No code changes found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No code changes match the selected filter criteria or none have been logged yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('codeChangeCode')}
              >
                <div className="flex items-center">
                  <span>Code Change</span>
                  {renderSortIcon('codeChangeCode')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4">
                Work Log & Task
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('changeStatus')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('changeStatus')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('svnCommitId')}
              >
                <div className="flex items-center">
                  <span>SVN Commit ID</span>
                  {renderSortIcon('svnCommitId')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('changeDatetime')}
              >
                <div className="flex items-center">
                  <span>Date & Time</span>
                  {renderSortIcon('changeDatetime')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('environment')}
              >
                <div className="flex items-center">
                  <span>Env</span>
                  {renderSortIcon('environment')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Files
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {codeChanges.map((cc) => (
              <tr key={cc.codeChangeId} className="hover:bg-slate-50/70 transition-colors group">
                <td className="py-3.5 px-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                  <Link
                    to={`/code-changes/${cc.codeChangeId}`}
                    className="hover:underline hover:text-blue-700 focus:outline-hidden"
                  >
                    {cc.codeChangeCode}
                  </Link>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to={`/work-logs/${cc.workLogId}`}
                      className="font-mono text-xs font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                    >
                      {cc.workLogCode || 'WL-LOG'}
                    </Link>
                    {cc.projectCode && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        {cc.projectCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5" title={cc.taskItemTitle}>
                    <span className="font-mono text-slate-600 mr-1">{cc.taskItemCode}:</span>
                    {cc.taskItemTitle || '—'}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(cc.changeStatus)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {cc.svnCommitId ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs bg-slate-100 text-slate-800 border border-slate-200">
                      <GitCommit className="w-3 h-3 mr-1 text-slate-500" />
                      {cc.svnCommitId}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Uncommitted</span>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                  {formatDateTime(cc.changeDatetime)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getEnvironmentBadge(cc.environment)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <FileCode className="w-3 h-3 text-slate-500" />
                    {cc.fileCount || (cc.files ? cc.files.length : 0)}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      to={`/code-changes/${cc.codeChangeId}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/code-changes/${cc.codeChangeId}/edit`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Code Change"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeChangeTable;
