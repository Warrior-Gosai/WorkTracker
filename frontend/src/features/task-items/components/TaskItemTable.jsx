import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit3,
  RefreshCw,
  Ban,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
} from 'lucide-react';
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants';
import { ROUTES } from '../../../constants';

export const TaskItemTable = ({
  taskItems = [],
  sortBy = 'createdAt',
  direction = 'desc',
  onSort,
  onEdit,
  onChangeStatus,
  onDeactivate,
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

  const getTaskTypeLabel = (val) => {
    const found = TASK_TYPES.find((t) => t.value === val);
    return found ? found.label : val;
  };

  const getPriorityBadge = (val) => {
    const found = TASK_PRIORITIES.find((p) => p.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getStatusBadge = (val) => {
    const found = TASK_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!taskItems || taskItems.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No active task items found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          No active task items match your current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider select-none">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-6 pr-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('taskItemCode')}
              >
                <div className="flex items-center">
                  <span>Code</span>
                  {renderSortIcon('taskItemCode')}
                </div>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center">
                  <span>Title</span>
                  {renderSortIcon('title')}
                </div>
              </th>

              <th scope="col" className="py-3.5 px-3">
                <span>Project</span>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('taskType')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  {renderSortIcon('taskType')}
                </div>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('priority')}
              >
                <div className="flex items-center">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center">
                  <span>Created</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>

              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {taskItems.map((task) => (
              <tr
                key={task.taskItemId}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Code */}
                <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                  <Link
                    to={`${ROUTES.TASK_ITEMS}/${task.taskItemId}`}
                    className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {task.taskItemCode}
                  </Link>
                </td>

                {/* Title */}
                <td className="py-3.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                  <Link
                    to={`${ROUTES.TASK_ITEMS}/${task.taskItemId}`}
                    className="hover:text-blue-600 transition-colors block truncate"
                    title={task.title}
                  >
                    {task.title}
                  </Link>
                </td>

                {/* Project */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {task.projectCode || `PRJ-${task.projectId}`}
                  </span>
                </td>

                {/* Task Type */}
                <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-600">
                  {getTaskTypeLabel(task.taskType)}
                </td>

                {/* Priority */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getPriorityBadge(task.priority)}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getStatusBadge(task.status)}
                </td>

                {/* Created */}
                <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {formatDate(task.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-1">
                    <Link
                      to={`${ROUTES.TASK_ITEMS}/${task.taskItemId}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                      aria-label="View task details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Task Item"
                      aria-label="Edit task item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeStatus(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Update Workflow Status"
                      aria-label="Update workflow status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeactivate(task)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate Task Item"
                      aria-label="Deactivate task item"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
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

export default TaskItemTable;

