import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  AlertTriangle,
  RefreshCw,
  FolderKanban,
  Calendar,
} from 'lucide-react';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants/pendingTaskConstants';

export const PendingTaskTable = ({
  tasks = [],
  isLoading = false,
  sortBy = 'dueDate',
  direction = 'asc',
  onSort,
  onOpenStatusModal,
}) => {
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-1 inline" />;
    }
    return direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading pending tasks...</p>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">No Pending Tasks Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          There are no pending tasks matching your current filter criteria.
        </p>
        <Link
          to="/pending-tasks/new"
          className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          Create Pending Task
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('pendingTaskCode')}
              >
                <div className="flex items-center">
                  <span>Code</span>
                  {renderSortIcon('pendingTaskCode')}
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center">
                  <span>Project</span>
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center">
                  <span>Title</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('priority')}
              >
                <div className="flex items-center">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('dueDate')}
              >
                <div className="flex items-center">
                  <span>Due Date</span>
                  {renderSortIcon('dueDate')}
                </div>
              </th>
              <th className="py-3 px-3 text-center">Overdue</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {tasks.map((task) => {
              const priorityClass = PRIORITY_COLORS[task.priority] || 'bg-slate-100 text-slate-700';
              const statusClass = STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-700';

              return (
                <tr
                  key={task.pendingTaskId}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                    <Link
                      to={`/pending-tasks/${task.pendingTaskId}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1.5"
                    >
                      <span>{task.pendingTaskCode}</span>
                    </Link>
                  </td>

                  {/* Project */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate max-w-[150px]">
                        <span className="font-mono text-[11px] text-slate-500 mr-1.5">
                          {task.projectCode}
                        </span>
                        <span className="font-medium text-slate-800 text-xs" title={task.projectName}>
                          {task.projectName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 max-w-xs sm:max-w-md">
                    <Link
                      to={`/pending-tasks/${task.pendingTaskId}`}
                      className="font-medium text-slate-900 hover:text-indigo-600 block truncate"
                      title={task.title}
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5" title={task.description}>
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityClass}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenStatusModal && onOpenStatusModal(task)}
                      title="Click to update status"
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border hover:opacity-85 transition-opacity ${statusClass}`}
                    >
                      {task.status}
                    </button>
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <span className="font-mono text-xs text-slate-700">
                        {task.dueDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No due date</span>
                    )}
                  </td>

                  {/* Overdue Indicator */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {task.overdue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        OVERDUE
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        type="button"
                        onClick={() => onOpenStatusModal && onOpenStatusModal(task)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Change Status"
                        aria-label="Change status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/pending-tasks/${task.pendingTaskId}`}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="View Details"
                        aria-label="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/pending-tasks/${task.pendingTaskId}/edit`}
                        className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        title="Edit Pending Task"
                        aria-label="Edit pending task"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingTaskTable;
