import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckSquare, Edit3, ShieldCheck, Hash, FolderKanban } from 'lucide-react';
import { createTaskItemSchema, updateTaskItemSchema } from '../schemas/taskItemSchemas';
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskConstants';
import projectService from '../../projects/services/projectService';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

export const TaskItemFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  taskItem = null, // If provided, Edit mode; otherwise, Create mode
}) => {
  const isEditMode = Boolean(taskItem);
  const [activeProjects, setActiveProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(isEditMode ? updateTaskItemSchema : createTaskItemSchema),
    defaultValues: {
      projectId: '',
      taskType: 'FEATURE_DEVELOPMENT',
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      remarks: '',
    },
  });

  // Load active projects for project dropdown in create mode
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setIsLoadingProjects(true);
      projectService
        .getProjects({ status: 1, size: 100, sortBy: 'projectName', direction: 'asc' })
        .then((res) => {
          setActiveProjects(res.content || []);
        })
        .catch((err) => {
          console.error('Failed to load active projects:', err);
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    }
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (taskItem) {
      reset({
        taskType: taskItem.taskType || 'FEATURE_DEVELOPMENT',
        title: taskItem.title || '',
        description: taskItem.description || '',
        priority: taskItem.priority || 'MEDIUM',
        remarks: taskItem.remarks || '',
      });
    } else {
      reset({
        projectId: '',
        taskType: 'FEATURE_DEVELOPMENT',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        remarks: '',
      });
    }
  }, [taskItem, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values) => {
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl p-6 sm:p-7 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isEditMode ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {isEditMode ? <Edit3 className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditMode ? 'Edit Task Item' : 'Create New Task Item'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditMode
                    ? 'Update task type, title, priority or notes'
                    : 'Add a new feature, defect or technical improvement task'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Read-only metadata in Edit Mode */}
          {isEditMode && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="font-mono font-semibold text-slate-800">{taskItem.taskItemCode}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700 truncate">{taskItem.projectName || taskItem.projectCode}</span>
              </div>
            </div>
          )}

          {/* Code notice in Create Mode */}
          {!isEditMode && (
            <div className="mt-4 p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Task Item Code is auto-generated using database sequence (format: <code className="font-mono font-semibold">TASK-000001</code>).
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-5 space-y-4" noValidate>
            {/* Project Selection (Create mode only) */}
            {!isEditMode && (
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectId"
                  disabled={isLoadingProjects}
                  className={`block w-full rounded-lg border py-2.5 px-3 text-sm bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${
                    errors.projectId ? 'border-red-400' : 'border-slate-300'
                  }`}
                  {...register('projectId')}
                >
                  <option value="">{isLoadingProjects ? 'Loading active projects...' : 'Select an active project...'}</option>
                  {activeProjects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode} — {p.projectName}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.projectId.message}</p>
                )}
              </div>
            )}

            {/* Task Type & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="taskType" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Task Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="taskType"
                  className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  {...register('taskType')}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.taskType && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.taskType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  {...register('priority')}
                >
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <Input
              label="Title"
              name="title"
              type="text"
              required
              placeholder="e.g. Implement refresh token rotation API"
              helperText="Maximum 200 characters."
              error={errors.title?.message}
              {...register('title')}
            />

            {/* Workflow status (Create mode only) */}
            {!isEditMode && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Initial Workflow Status
                </label>
                <select
                  id="status"
                  className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  {...register('status')}
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.status.message}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Detailed task scope, technical context, acceptance criteria..."
                className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1.5">
                Remarks
              </label>
              <textarea
                id="remarks"
                rows={2}
                placeholder="Optional notes, JIRA / SVN reference, or blockers..."
                className="block w-full rounded-lg border border-slate-300 py-2.5 px-3.5 text-sm bg-white text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                {...register('remarks')}
              />
              {errors.remarks && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.remarks.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={isEditMode && !isDirty}>
                {isEditMode ? 'Save Changes' : 'Create Task Item'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskItemFormModal;

