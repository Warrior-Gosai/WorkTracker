import React, { useState, useEffect } from 'react';
import { X, Download, Filter, FileSpreadsheet, Archive, Loader2 } from 'lucide-react';
import { useExport, REPORT_TYPES } from '../hooks/useExport';
import { useProjects } from '../../projects/hooks/useProjects';

const REPORT_INFO = {
  [REPORT_TYPES.DAILY_WORK_LOG]: {
    title: 'Daily Work Log Export',
    filename: '01_Daily_Work_Log.xlsx',
    icon: FileSpreadsheet,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  [REPORT_TYPES.DB_CHANGE_LOG]: {
    title: 'Database Change Log Export',
    filename: '02_DB_Change_Log.xlsx',
    icon: FileSpreadsheet,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [REPORT_TYPES.CODE_CHANGE_LOG]: {
    title: 'Code/File Change Log Export',
    filename: '03_Code_File_Change_Log.xlsx',
    icon: FileSpreadsheet,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  [REPORT_TYPES.ALL_REPORTS]: {
    title: 'All Reports Export (ZIP)',
    filename: 'DevWork_Tracker_Reports.zip',
    icon: Archive,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export const ExportDialog = ({
  isOpen,
  onClose,
  reportType = REPORT_TYPES.DAILY_WORK_LOG,
  initialScope = 'all',
  initialFilters = {},
}) => {
  const { isExporting, exportReport } = useExport();
  const { data: projectsData } = useProjects({ size: 100 });
  const projects = projectsData?.content || [];

  const [scope, setScope] = useState(initialScope);
  const [filters, setFilters] = useState({
    search: '',
    projectId: '',
    fromDate: '',
    toDate: '',
    environment: '',
    workType: '',
    status: '',
    databaseName: '',
    objectType: '',
    changeStatus: '',
    svnCommitId: '',
  });

  useEffect(() => {
    if (isOpen) {
      setScope(initialScope);
      setFilters((prev) => ({
        ...prev,
        ...initialFilters,
        projectId: initialFilters.projectId || '',
        fromDate: initialFilters.fromDate || initialFilters.workDateFrom || initialFilters.dateFrom || '',
        toDate: initialFilters.toDate || initialFilters.workDateTo || initialFilters.dateTo || '',
      }));
    }
  }, [isOpen, initialScope, initialFilters]);

  if (!isOpen) return null;

  const info = REPORT_INFO[reportType] || REPORT_INFO[REPORT_TYPES.DAILY_WORK_LOG];
  const IconComponent = info.icon;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = { scope };

    if (scope === 'filtered') {
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
        params.dateFrom = filters.fromDate;
        params.workDateFrom = filters.fromDate;
      }
      if (filters.toDate) {
        params.toDate = filters.toDate;
        params.dateTo = filters.toDate;
        params.workDateTo = filters.toDate;
      }
      if (filters.environment?.trim()) params.environment = filters.environment.trim();
      if (filters.workType?.trim()) params.workType = filters.workType.trim();
      if (filters.status?.trim()) params.status = filters.status.trim();
      if (filters.databaseName?.trim()) params.databaseName = filters.databaseName.trim();
      if (filters.objectType?.trim()) params.objectType = filters.objectType.trim();
      if (filters.changeStatus?.trim()) params.changeStatus = filters.changeStatus.trim();
      if (filters.svnCommitId?.trim()) params.svnCommitId = filters.svnCommitId.trim();
    }

    try {
      await exportReport(reportType, params);
      onClose();
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{info.title}</h3>
              <p className="text-xs text-slate-500 font-mono">{info.filename}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Export Scope Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Export Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                  scope === 'all'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="scope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-900">All Records</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 pl-6">
                  Complete dataset, including historical and inactive records.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                  scope === 'filtered'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="scope"
                    value="filtered"
                    checked={scope === 'filtered'}
                    onChange={() => setScope('filtered')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-900">Filtered Records</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 pl-6">
                  Only records matching specified filters (across all pages).
                </span>
              </label>
            </div>
          </div>

          {/* Filter options when scope === 'filtered' */}
          {scope === 'filtered' && (
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Criteria</span>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
                <select
                  name="projectId"
                  value={filters.projectId}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode} - {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date From</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleChange}
                    className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date To</label>
                  <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleChange}
                    className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Text Search */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Search Keyword</label>
                <input
                  type="text"
                  name="search"
                  placeholder="Filter by code, description, or keyword..."
                  value={filters.search}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Report-specific fields */}
              {(reportType === REPORT_TYPES.DAILY_WORK_LOG || reportType === REPORT_TYPES.ALL_REPORTS) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Work Log Status</label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Work Type</label>
                    <select
                      name="workType"
                      value={filters.workType}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">All Types</option>
                      <option value="Development">Development</option>
                      <option value="Bug Fix">Bug Fix</option>
                      <option value="Enhancement">Enhancement</option>
                      <option value="Investigation">Investigation</option>
                      <option value="Testing">Testing</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Learning">Learning</option>
                      <option value="Support">Support</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {(reportType === REPORT_TYPES.CODE_CHANGE_LOG || reportType === REPORT_TYPES.ALL_REPORTS) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Change Status</label>
                    <select
                      name="changeStatus"
                      value={filters.changeStatus}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">All</option>
                      <option value="COMMITTED">Committed</option>
                      <option value="UNCOMMITTED">Uncommitted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">SVN Commit ID</label>
                    <input
                      type="text"
                      name="svnCommitId"
                      placeholder="e.g. r12345"
                      value={filters.svnCommitId}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {(reportType === REPORT_TYPES.DB_CHANGE_LOG || reportType === REPORT_TYPES.ALL_REPORTS) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Database</label>
                    <select
                      name="databaseName"
                      value={filters.databaseName}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">All Databases</option>
                      <option value="PostgreSQL">PostgreSQL</option>
                      <option value="Oracle">Oracle</option>
                      <option value="MySQL">MySQL</option>
                      <option value="SQL Server">SQL Server</option>
                      <option value="MongoDB">MongoDB</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Object Type</label>
                    <select
                      name="objectType"
                      value={filters.objectType}
                      onChange={handleChange}
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">All Types</option>
                      <option value="Table">Table</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Function">Function</option>
                      <option value="Trigger">Trigger</option>
                      <option value="View">View</option>
                      <option value="Sequence">Sequence</option>
                      <option value="Index">Index</option>
                      <option value="Constraint">Constraint</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dialog Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportDialog;
