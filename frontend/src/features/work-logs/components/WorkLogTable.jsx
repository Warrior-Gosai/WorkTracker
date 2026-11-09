import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  Clock,
} from 'lucide-react';
import { WORK_TYPES, WORK_ENVIRONMENTS, WORK_STATUSES } from '../constants/workLogConstants';

export const WorkLogTable = ({
  workLogs = [],
  sortBy = 'workDate',
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

  const getWorkTypeLabel = (val) => {
    const found = WORK_TYPES.find((t) => t.value === val);
    return found ? found.label : val;
  };

  const getEnvironmentBadge = (val) => {
    const found = WORK_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getStatusBadge = (val) => {
    const found = WORK_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

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

  if (!workLogs || workLogs.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No work logs found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No work logs match the selected filter criteria or none have been logged yet.
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
                onClick={() => onSort('workLogCode')}
              >
                <div className="flex items-center">
                  <span>Work ID</span>
                  {renderSortIcon('workLogCode')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('workDate')}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {renderSortIcon('workDate')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4">
                Project & Task
              </th>
              <th scope="col" className="py-3 px-4">
                Requirement
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('workType')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  {renderSortIcon('workType')}
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
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Duration
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {workLogs.map((log) => (
              <tr key={log.workLogId} className="hover:bg-slate-50/70 transition-colors group">
                <td className="py-3.5 px-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                  <Link
                    to={`/work-logs/${log.workLogId}`}
                    className="hover:underline hover:text-blue-700 focus:outline-hidden"
                  >
                    {log.workLogCode}
                  </Link>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-medium text-slate-800">{formatDate(log.workDate)}</div>
                  <div className="text-xs text-slate-500">{log.day || '—'}</div>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-slate-800 truncate" title={log.projectName}>
                      {log.projectName || '—'}
                    </span>
                    {log.projectCode && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        {log.projectCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5" title={log.taskItemTitle}>
                    <span className="font-mono text-slate-600 mr-1">{log.taskItemCode}:</span>
                    {log.taskItemTitle || '—'}
                  </div>
                </td>

                <td className="py-3.5 px-4 max-w-sm">
                  <p className="text-slate-800 line-clamp-2 leading-snug" title={log.taskRequirement}>
                    {log.taskRequirement}
                  </p>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-medium">
                    {getWorkTypeLabel(log.workType)}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getEnvironmentBadge(log.environment)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(log.status)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  {log.totalHours != null ? (
                    <span className="inline-flex items-center text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      {Number(log.totalHours).toFixed(2)}h
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      to={`/work-logs/${log.workLogId}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/work-logs/${log.workLogId}/edit`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Work Log"
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

export default WorkLogTable;
