import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, CheckSquare, Loader2, FolderKanban } from 'lucide-react';
import {
  useTaskItems,
  useCreateTaskItem,
  useUpdateTaskItem,
  useUpdateTaskStatus,
  useDeactivateTaskItem,
} from '../hooks/useTaskItems';
import projectService from '../../projects/services/projectService';
import TaskItemTable from '../components/TaskItemTable';
import TaskItemFormModal from '../components/TaskItemFormModal';
import TaskStatusModal from '../components/TaskStatusModal';
import DeactivateTaskModal from '../components/DeactivateTaskModal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import useDebounce from '../../../hooks/useDebounce';
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants';

export const TaskItemListPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Filters
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');

  // Active Projects list for filter dropdown
  const [projectsList, setProjectsList] = useState([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTask, setStatusTask] = useState(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivatingTask, setDeactivatingTask] = useState(null);

  // Load active projects for filter dropdown
  useEffect(() => {
    projectService
      .getProjects({ status: 1, size: 100, sortBy: 'projectName', direction: 'asc' })
      .then((res) => {
        setProjectsList(res.content || []);
      })
      .catch((err) => {
        console.error('Failed to load active projects:', err);
      });
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, projectIdFilter, taskTypeFilter, priorityFilter, statusFilter]);

  // Query parameters (active items only)
  const queryParams = {
    page,
    size,
    sortBy,
    direction,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(projectIdFilter ? { projectId: Number(projectIdFilter) } : {}),
    ...(taskTypeFilter ? { taskType: taskTypeFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useTaskItems(queryParams);

  const createMutation = useCreateTaskItem();
  const updateMutation = useUpdateTaskItem();
  const statusMutation = useUpdateTaskStatus();
  const deactivateMutation = useDeactivateTaskItem();

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setDirection('desc');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleOpenStatusModal = (task) => {
    setStatusTask(task);
    setIsStatusModalOpen(true);
  };

  const handleOpenDeactivateModal = (task) => {
    setDeactivatingTask(task);
    setIsDeactivateModalOpen(true);
  };

  const handleFormSubmit = async (values) => {
    if (editingTask) {
      await updateMutation.mutateAsync({
        taskItemId: editingTask.taskItemId,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    setIsFormModalOpen(false);
    setEditingTask(null);
  };

  const handleStatusSubmit = async (newStatus) => {
    if (statusTask) {
      await statusMutation.mutateAsync({
        taskItemId: statusTask.taskItemId,
        status: newStatus,
      });
      setIsStatusModalOpen(false);
      setStatusTask(null);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (deactivatingTask) {
      await deactivateMutation.mutateAsync(deactivatingTask.taskItemId);
      setIsDeactivateModalOpen(false);
      setDeactivatingTask(null);
    }
  };

  const taskItems = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Task Items</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              {totalElements} active {totalElements === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Organize features, bugs, enhancements and active development tasks
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => refetch()}
            disabled={isFetching}
            icon={RefreshCw}
            className={isFetching ? 'animate-spin' : ''}
            title="Refresh list"
          >
            Refresh
          </Button>

          <Button type="button" variant="primary" size="md" onClick={handleOpenCreateModal} icon={Plus}>
            New Task Item
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by task title or code (e.g. TASK-000001)..."
            className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2 text-sm bg-white text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Project Filter */}
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Projects</option>
            {projectsList.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectCode} — {p.projectName}
              </option>
            ))}
          </select>

          {/* Task Type Filter */}
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Task Types</option>
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs bg-white text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Workflow Statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Alert
          type="error"
          title="Failed to load task items"
          message={error?.response?.data?.message || error?.message || 'An unexpected error occurred.'}
        />
      )}

      {/* Loading state skeleton / spinner */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading task items...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <TaskItemTable
            taskItems={taskItems}
            sortBy={sortBy}
            direction={direction}
            onSort={handleSort}
            onEdit={handleOpenEditModal}
            onChangeStatus={handleOpenStatusModal}
            onDeactivate={handleOpenDeactivateModal}
          />

          {/* Pagination */}
          <Pagination
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        </>
      )}

      {/* Create / Edit Modal */}
      <TaskItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        taskItem={editingTask}
      />

      {/* Quick Status Modal */}
      <TaskStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTask(null);
        }}
        onSubmit={handleStatusSubmit}
        isLoading={statusMutation.isPending}
        taskItem={statusTask}
      />

      {/* Deactivate Modal */}
      <DeactivateTaskModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setDeactivatingTask(null);
        }}
        onConfirm={handleDeactivateConfirm}
        isLoading={deactivateMutation.isPending}
        taskItem={deactivatingTask}
      />
    </div>
  );
};

export default TaskItemListPage;

