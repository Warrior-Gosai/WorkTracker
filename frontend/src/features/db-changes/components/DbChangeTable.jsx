import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Database,
} from 'lucide-react';
import { DB_ENVIRONMENTS, OBJECT_TYPE_COLORS } from '../constants/dbChangeConstants';

export const DbChangeTable = ({
  dbChanges = [],
  sortBy = 'createdAt',
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

  const getEnvironmentBadge = (val) => {
    const found = DB_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getObjectTypeBadge = (val) => {
    const color = OBJECT_TYPE_COLORS[val] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${color}`}>
        {val}
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

  if (!dbChanges || dbChanges.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No database changes found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No database changes match the selected filter criteria or none have been logged yet.
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
                onClick={() => onSort('dbChangeCode')}
              >
                <div className="flex items-center">
                  <span>DB Change</span>
                  {renderSortIcon('dbChangeCode')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4">
                Date
              </th>
              <th scope="col" className="py-3 px-4">
                Work Log & Task
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
                onClick={() => onSort('databaseName')}
              >
                <div className="flex items-center">
                  <span>Database</span>
                  {renderSortIcon('databaseName')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('objectType')}
              >
                <div className="flex items-center">
                  <span>Object Type</span>
                  {renderSortIcon('objectType')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('objectName')}
              >
                <div className="flex items-center">
                  <span>Object Name</span>
                  {renderSortIcon('objectName')}
                </div>
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {dbChanges.map((dbc) => (
              <tr key={dbc.dbChangeId} className="hover:bg-slate-50/70 transition-colors group">
                <td className="py-3.5 px-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                  <Link
                    to={`/db-changes/${dbc.dbChangeId}`}
                    className="hover:underline hover:text-blue-700 focus:outline-hidden"
                  >
                    {dbc.dbChangeCode}
                  </Link>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                  {formatDate(dbc.workDate)}
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      to={`/work-logs/${dbc.workLogId}`}
                      className="font-mono text-xs font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                    >
                      {dbc.workLogCode || 'WL-LOG'}
                    </Link>
                    {dbc.projectCode && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        {dbc.projectCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5" title={dbc.taskItemTitle}>
                    <span className="font-mono text-slate-600 mr-1">{dbc.taskItemCode}:</span>
                    {dbc.taskItemTitle || '—'}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getEnvironmentBadge(dbc.environment)}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-800">
                  {dbc.databaseName}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getObjectTypeBadge(dbc.objectType)}
                </td>

                <td className="py-3.5 px-4 font-mono text-xs text-slate-800 max-w-xs truncate" title={dbc.objectName}>
                  {dbc.objectName}
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
                  <div className="inline-flex items-center justify-end gap-1">
                    <Link
                      to={`/db-changes/${dbc.dbChangeId}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/db-changes/${dbc.dbChangeId}/edit`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit DB Change"
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

export default DbChangeTable;
