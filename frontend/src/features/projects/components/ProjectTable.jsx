import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, ArrowUpDown, ArrowUp, ArrowDown, FolderKanban } from 'lucide-react';
import { ROUTES } from '../../../constants';

export const ProjectTable = ({
  projects = [],
  sortBy = 'createdAt',
  direction = 'desc',
  onSort,
  onEdit,
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

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
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

  if (!projects || projects.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FolderKanban className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No projects found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          No projects match your current search or filter criteria. Create a new project or adjust your filters.
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
                onClick={() => onSort('projectCode')}
              >
                <div className="flex items-center">
                  <span>Code</span>
                  {renderSortIcon('projectCode')}
                </div>
              </th>

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('projectName')}
              >
                <div className="flex items-center">
                  <span>Project Name</span>
                  {renderSortIcon('projectName')}
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

              <th
                scope="col"
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => onSort('updatedAt')}
              >
                <div className="flex items-center">
                  <span>Last Updated</span>
                  {renderSortIcon('updatedAt')}
                </div>
              </th>

              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {projects.map((project) => (
              <tr
                key={project.projectId}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Code */}
                <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                  <Link
                    to={`${ROUTES.PROJECTS}/${project.projectId}`}
                    className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {project.projectCode}
                  </Link>
                </td>

                {/* Name */}
                <td className="py-3.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                  <Link
                    to={`${ROUTES.PROJECTS}/${project.projectId}`}
                    className="hover:text-blue-600 transition-colors"
                    title={project.projectName}
                  >
                    {project.projectName}
                  </Link>
                  {project.description && (
                    <span className="block text-xs text-slate-400 truncate max-w-sm mt-0.5 font-normal">
                      {project.description}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 1
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {project.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Created At */}
                <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {formatDate(project.createdAt)}
                </td>

                {/* Updated At */}
                <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {formatDate(project.updatedAt)}
                </td>

                {/* Actions */}
                <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      to={`${ROUTES.PROJECTS}/${project.projectId}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                      aria-label="View project details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Project"
                      aria-label="Edit project"
                    >
                      <Edit3 className="w-4 h-4" />
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

export default ProjectTable;

