import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, FolderKanban, Loader2 } from 'lucide-react';
import { useProjects, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import ProjectTable from '../components/ProjectTable';
import ProjectFormModal from '../components/ProjectFormModal';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import useDebounce from '../../../hooks/useDebounce';

export const ProjectListPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [statusFilter, setStatusFilter] = useState(''); // '' = all, '1' = active, '0' = inactive
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Reset page to 0 on search or filter change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  // Query parameters
  const queryParams = {
    page,
    size,
    sortBy,
    direction,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(statusFilter !== '' ? { status: Number(statusFilter) } : {}),
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useProjects(queryParams);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setDirection('desc');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleModalSubmit = async (values) => {
    if (editingProject) {
      await updateMutation.mutateAsync({
        projectId: editingProject.projectId,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    handleCloseModal();
  };

  const projects = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Projects
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              {totalElements} {totalElements === 1 ? 'project' : 'projects'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Create, filter, and organize project workspaces
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

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            icon={Plus}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by project name or code (e.g. PRJ-000001)..."
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

          {/* Status Filter Dropdown */}
          <div className="sm:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2 text-sm bg-white text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            >
              <option value="">All Statuses (Active & Inactive)</option>
              <option value="1">Active Projects Only</option>
              <option value="0">Inactive Projects Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Alert
          type="error"
          title="Failed to load projects"
          message={error?.response?.data?.message || error?.message || 'An unexpected error occurred.'}
        />
      )}

      {/* Loading state skeleton / spinner */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading projects...</p>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <ProjectTable
            projects={projects}
            sortBy={sortBy}
            direction={direction}
            onSort={handleSort}
            onEdit={handleOpenEditModal}
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

      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectListPage;

