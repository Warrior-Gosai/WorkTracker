import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Hash,
  FileText,
  MessageSquare,
  ShieldCheck,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { useProjectDetails, useUpdateProject } from '../hooks/useProjects';
import ProjectFormModal from '../components/ProjectFormModal';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { ROUTES } from '../../../constants';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: project, isLoading, isError, error } = useProjectDetails(projectId);
  const updateMutation = useUpdateProject();

  const handleUpdate = async (values) => {
    await updateMutation.mutateAsync({
      projectId,
      data: values,
    });
    setIsEditModalOpen(false);
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
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading project details...</p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.PROJECTS}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <Alert
          type="error"
          title="Project Not Found"
          message={error?.response?.data?.message || 'The requested project could not be located or has been archived.'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.PROJECTS}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          icon={Edit3}
        >
          Edit Project
        </Button>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="sm:flex sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {project.projectCode}
              </span>

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 1
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {project.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {project.projectName}
            </h2>
          </div>
        </div>

        {/* Timestamps Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Created At:</span>
            <span className="font-mono text-slate-700 font-medium">{formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last Updated:</span>
            <span className="font-mono text-slate-700 font-medium">{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3>Project Description</h3>
          </div>
          {project.description ? (
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No description provided for this project.</p>
          )}
        </div>

        {/* Remarks Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-slate-800 font-semibold text-sm">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3>Internal Remarks</h3>
          </div>
          {project.remarks ? (
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.remarks}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No internal remarks recorded.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        project={project}
      />
    </div>
  );
};

export default ProjectDetailPage;

