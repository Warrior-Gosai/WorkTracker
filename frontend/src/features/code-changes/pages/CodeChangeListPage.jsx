import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  GitCommit,
  Calendar,
  FileCode2,
  FileSpreadsheet,
} from 'lucide-react';
import { useCodeChanges } from '../hooks/useCodeChanges';
import { CodeChangeTable } from '../components/CodeChangeTable';
import { CommitSearchModal } from '../components/CommitSearchModal';
import { CHANGE_STATUSES, CODE_ENVIRONMENTS } from '../constants/codeChangeConstants';
import { projectService } from '../../projects/services/projectService';
import { taskItemService } from '../../task-items/services/taskItemService';
import { ExportDialog } from '../../reports/components/ExportDialog';
import { REPORT_TYPES } from '../../reports/hooks/useExport';

export const CodeChangeListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskItemId, setSelectedTaskItemId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('changeDatetime');
  const [direction, setDirection] = useState('desc');

  const [projectsList, setProjectsList] = useState([]);
  const [taskItemsList, setTaskItemsList] = useState([]);
  const [isCommitSearchOpen, setIsCommitSearchOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load projects for filter
  useEffect(() => {
    let isMounted = true;
    projectService
      .getProjects({ size: 100, sortBy: 'projectName', direction: 'asc' })
      .then((res) => {
        if (isMounted && res?.content) {
          setProjectsList(res.content);
        }
      })
      .catch((err) => console.error('Failed to load projects for filter', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Load task items for filter (optionally filtered by project)
  useEffect(() => {
    let isMounted = true;
    const params = { size: 100, sortBy: 'title', direction: 'asc' };
    if (selectedProjectId) {
      params.projectId = selectedProjectId;
    }
    taskItemService
      .getTaskItems(params)
      .then((res) => {
        if (isMounted && res?.content) {
          setTaskItemsList(res.content);
        }
      })
      .catch((err) => console.error('Failed to load task items for filter', err));

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const queryParams = {
    search: debouncedSearch || undefined,
    projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
    taskItemId: selectedTaskItemId ? Number(selectedTaskItemId) : undefined,
    changeStatus: selectedStatus || undefined,
    environment: selectedEnvironment || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    size: pageSize,
    sortBy,
    direction,
  };

  const { data, isLoading, isError, error } = useCodeChanges(queryParams);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setDirection('desc');
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProjectId('');
    setSelectedTaskItemId('');
    setSelectedStatus('');
    setSelectedEnvironment('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      selectedProjectId ||
      selectedTaskItemId ||
      selectedStatus ||
      selectedEnvironment ||
      dateFrom ||
      dateTo
  );

  const codeChanges = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Code Change Log</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track committed revisions, uncommitted changes, and modified files linked to daily work logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCommitSearchOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <GitCommit className="w-4 h-4 text-slate-500" />
            <span>Exact SVN Search</span>
          </button>

          <Link
            to="/code-changes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Code Change</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code (CC-...) or SVN commit ID..."
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedTaskItemId('');
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Task Item Filter */}
          <div>
            <select
              value={selectedTaskItemId}
              onChange={(e) => {
                setSelectedTaskItemId(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Tasks</option>
              {taskItemsList.map((t) => (
                <option key={t.taskItemId} value={t.taskItemId}>
                  {t.taskItemCode}: {t.title.length > 25 ? `${t.title.substring(0, 25)}...` : t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {CHANGE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Environment Filter */}
          <div>
            <select
              value={selectedEnvironment}
              onChange={(e) => {
                setSelectedEnvironment(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All Environments</option>
              {CODE_ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap text-slate-600">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Range:</span>
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <p className="font-semibold">Failed to load code changes</p>
          <p className="mt-0.5 text-xs text-red-600">{error?.message || 'Unknown error occurred.'}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-slate-500">Loading code changes...</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <span className="font-semibold text-slate-700">{codeChanges.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> code changes
            </span>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-0.5 border border-slate-200 rounded bg-white text-slate-700 text-xs focus:outline-hidden"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <CodeChangeTable
            codeChanges={codeChanges}
            sortBy={sortBy}
            direction={direction}
            onSort={handleSort}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-slate-600">
                Page <span className="font-medium text-slate-900">{page + 1}</span> of{' '}
                <span className="font-medium text-slate-900">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SVN Commit Search Modal */}
      <CommitSearchModal
        isOpen={isCommitSearchOpen}
        onClose={() => setIsCommitSearchOpen(false)}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType={REPORT_TYPES.CODE_CHANGE_LOG}
        initialScope={hasActiveFilters ? 'filtered' : 'all'}
        initialFilters={{
          search: debouncedSearch,
          projectId: selectedProjectId,
          taskItemId: selectedTaskItemId,
          changeStatus: selectedStatus,
          environment: selectedEnvironment,
          dateFrom,
          dateTo,
        }}
      />
    </div>
  );
};

export default CodeChangeListPage;
