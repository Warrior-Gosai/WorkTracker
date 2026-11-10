import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, ArrowRight } from 'lucide-react';

export const ProjectSummary = ({ projectSummaries = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Project Performance & Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Active projects, task completion progress, and associated work logs
            </p>
          </div>
        </div>

        <Link
          to="/projects"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {projectSummaries.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
          <p>No project summaries available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3">Task Progress</th>
                <th className="py-2.5 px-3 text-right">Work Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {projectSummaries.map((p) => {
                const total = p.totalTaskItems || 0;
                const completed = p.completedTaskItems || 0;
                const open = p.openTaskItems || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <tr key={p.projectId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Project Code & Name */}
                    <td className="py-3 px-3">
                      <Link
                        to={`/projects/${p.projectId}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 block"
                      >
                        <span className="font-mono text-[11px] text-slate-400 mr-1.5">
                          {p.projectCode}
                        </span>
                        {p.projectName}
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.projectStatus === 1
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {p.projectStatus === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Progress Bar & Task Counts */}
                    <td className="py-3 px-3 min-w-[160px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">
                          <strong className="text-emerald-700">{completed}</strong> / {total} done
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        <span className="text-sky-700 font-medium">{open}</span> open tasks
                      </div>
                    </td>

                    {/* Work Logs Count */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{p.totalWorkLogs || 0}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectSummary;
