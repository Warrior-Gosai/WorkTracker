import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { usePendingTasks, useUpdatePendingTaskStatus } from '../hooks/usePendingTasks';
import { PendingTaskTable } from '../components/PendingTaskTable';
import { PendingTaskStatusModal } from '../components/PendingTaskStatusModal';
import {
  PENDING_TASK_PRIORITIES,
  STATUS_FILTER_OPTIONS,
  OVERDUE_FILTER_OPTIONS,
} from '../constants/pendingTaskConstants';
import { projectService } from '../../projects/services/projectService';

export const PendingTaskListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOverdue, setSelectedOverdue] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('dueDate');
  const [direction, setDirection] = useState('asc');

  const [projectsList, setProjectsList] = useState([]);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const statusMutation = useUpdatePendingTaskStatus();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load projects for project filter
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

  // Build query params
  const queryParams = {
    search: debouncedSearch || undefined,
    projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
    priority: selectedPriority || undefined,
    status: selectedStatus || undefined,
    overdue: selectedOverdue !== '' ? selectedOverdue === 'true' : undefined,
    dueDateFrom: dueDateFrom || undefined,
    dueDateTo: dueDateTo || undefined,
    page,
    size: pageSize,
    sortBy,
    direction,
  };

  const { data: pageData, isLoading, isError, error } = usePendingTasks(queryParams);

  const tasks = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setDirection(field === 'dueDate' ? 'asc' : 'desc');
    }
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProjectId('');
    setSelectedPriority('');
    setSelectedStatus('');
    setSelectedOverdue('');
    setDueDateFrom('');
    setDueDateTo('');
    setSortBy('dueDate');
    setDirection('asc');
    setPage(0);
  };

  const handleOpenStatusModal = (task) => {
    setSelectedTaskForStatus(task);
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (newStatus) => {
    if (!selectedTaskForStatus) return;
    try {
      await statusMutation.mutateAsync({
        pendingTaskId: selectedTaskForStatus.pendingTaskId,
        data: { status: newStatus },
      });
      setIsStatusModalOpen(false);
      setSelectedTaskForStatus(null);
    } catch (err) {
      // toast is handled in mutation hook
    }
  };

  const hasActiveFilters = Boolean(
    debouncedSearch ||
      selectedProjectId ||
      selectedPriority ||
      selectedStatus ||
      selectedOverdue !== '' ||
      dueDateFrom ||
      dueDateTo
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pending Tasks
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage independent project follow-ups, reminders, and action items
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-0">
          <Link
            to="/pending-tasks/new"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Pending Task
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Search & Filters</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, title, description, remarks, project name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Selects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Project Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} - {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              {PENDING_TASK_PRIORITIES.map((pr) => (
                <option key={pr.value} value={pr.value}>
                  {pr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              {STATUS_FILTER_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Overdue Status
            </label>
            <select
              value={selectedOverdue}
              onChange={(e) => {
                setSelectedOverdue(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              {OVERDUE_FILTER_OPTIONS.map((ov) => (
                <option key={ov.value} value={ov.value}>
                  {ov.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date From */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Due Date From
            </label>
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => {
                setDueDateFrom(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Due Date To */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Due Date To
            </label>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => {
                setDueDateTo(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>Error loading pending tasks:</strong>{' '}
          {error?.response?.data?.message || error.message || 'Please check your connection.'}
        </div>
      )}

      {/* Main Table */}
      <PendingTaskTable
        tasks={tasks}
        isLoading={isLoading}
        sortBy={sortBy}
        direction={direction}
        onSort={handleSort}
        onOpenStatusModal={handleOpenStatusModal}
      />

      {/* Pagination Footer */}
      {!isLoading && totalElements > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span>
              Showing{' '}
              <strong className="text-slate-900 font-semibold">
                {page * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 font-semibold">
                {Math.min((page + 1) * pageSize, totalElements)}
              </strong>{' '}
              of <strong className="text-slate-900 font-semibold">{totalElements}</strong> items
            </span>

            <span className="text-slate-300">|</span>

            <div className="flex items-center space-x-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Status Modal */}
      <PendingTaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedTaskForStatus(null);
        }}
        onSubmit={handleStatusSubmit}
        isLoading={statusMutation.isPending}
        pendingTask={selectedTaskForStatus}
      />
    </div>
  );
};

export default PendingTaskListPage;
