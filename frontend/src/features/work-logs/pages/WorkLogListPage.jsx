import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import { useWorkLogs } from '../hooks/useWorkLogs';
import { WorkLogTable } from '../components/WorkLogTable';
import { WORK_TYPES, WORK_ENVIRONMENTS, WORK_STATUSES } from '../constants/workLogConstants';
import { projectService } from '../../projects/services/projectService';
import { taskItemService } from '../../task-items/services/taskItemService';

export const WorkLogListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskItemId, setSelectedTaskItemId] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [workDateFrom, setWorkDateFrom] = useState('');
  const [workDateTo, setWorkDateTo] = useState('');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('workDate');
  const [direction, setDirection] = useState('desc');

  const [projectsList, setProjectsList] = useState([]);
  const [taskItemsList, setTaskItemsList] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load projects for filter dropdown
  useEffect(() => {
    let isMounted = true;
    projectService.getProjects({ size: 100, sortBy: 'projectName', direction: 'asc' })
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

  // Load task items for filter dropdown (optionally filtered by project)
  useEffect(() => {
    let isMounted = true;
    const params = { size: 100, sortBy: 'title', direction: 'asc' };
    if (selectedProjectId) {
      params.projectId = selectedProjectId;
    }
    taskItemService.getTaskItems(params)
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
    environment: selectedEnvironment || undefined,
    workType: selectedWorkType || undefined,
    status: selectedStatus || undefined,
    workDateFrom: workDateFrom || undefined,
    workDateTo: workDateTo || undefined,
    page,
    size: pageSize,
    sortBy,
    direction,
  };

  const { data, isLoading, isError, error } = useWorkLogs(queryParams);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setDirection('desc');
    }
    setPage(0);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProjectId('');
    setSelectedTaskItemId('');
    setSelectedEnvironment('');
    setSelectedWorkType('');
    setSelectedStatus('');
    setWorkDateFrom('');
    setWorkDateTo('');
    setPage(0);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(selectedProjectId) ||
    Boolean(selectedTaskItemId) ||
    Boolean(selectedEnvironment) ||
    Boolean(selectedWorkType) ||
    Boolean(selectedStatus) ||
    Boolean(workDateFrom) ||
    Boolean(workDateTo);

  const workLogs = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Work Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {totalElements}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track daily development activities, time spent, requirements, and outcomes.
          </p>
        </div>

        <Link
          to="/work-logs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Log</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or requirement..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Project Dropdown */}
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedTaskItemId('');
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Task Item Dropdown */}
          <div>
            <select
              value={selectedTaskItemId}
              onChange={(e) => {
                setSelectedTaskItemId(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Task Items</option>
              {taskItemsList.map((t) => (
                <option key={t.taskItemId} value={t.taskItemId}>
                  {t.taskItemCode}: {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Work Type Dropdown */}
          <div>
            <select
              value={selectedWorkType}
              onChange={(e) => {
                setSelectedWorkType(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Work Types</option>
              {WORK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Environment */}
          <div>
            <select
              value={selectedEnvironment}
              onChange={(e) => {
                setSelectedEnvironment(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Environments</option>
              {WORK_ENVIRONMENTS.map((env) => (
                <option key={env.value} value={env.value}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Statuses</option>
              {WORK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={workDateFrom}
              onChange={(e) => {
                setWorkDateFrom(e.target.value);
                setPage(0);
              }}
              title="From Date"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            />
          </div>

          {/* Date To & Reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={workDateTo}
                onChange={(e) => {
                  setWorkDateTo(e.target.value);
                  setPage(0);
                }}
                title="To Date"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content State */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading work logs...</p>
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
          <p className="font-semibold">Failed to load work logs</p>
          <p className="text-sm mt-1">{error?.message || 'Please try again later'}</p>
        </div>
      ) : (
        <>
          <WorkLogTable
            workLogs={workLogs}
            sortBy={sortBy}
            direction={direction}
            onSort={handleSort}
          />

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <span>
                  Showing <span className="font-medium text-slate-700">{page * pageSize + 1}</span> to{' '}
                  <span className="font-medium text-slate-700">
                    {Math.min((page + 1) * pageSize, totalElements)}
                  </span>{' '}
                  of <span className="font-medium text-slate-700">{totalElements}</span> entries
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="px-2 py-1 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden"
                  >
                    {[10, 25, 50, 100].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="inline-flex items-center -space-x-px rounded-lg border border-slate-200 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-l-lg transition-colors border-r border-slate-200 inline-flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" />
                  <span>Previous</span>
                </button>
                <span className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border-r border-slate-200">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-r-lg transition-colors inline-flex items-center"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkLogListPage;
