import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  GitCommit,
  Calendar,
  Clock,
  Layers,
  FolderGit2,
  FileCode,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  useCodeChangeDetails,
  useAddCodeChangeFile,
  useUpdateCodeChangeFile,
  useDeleteCodeChangeFile,
} from '../hooks/useCodeChanges';
import { CHANGE_STATUSES, CODE_ENVIRONMENTS } from '../constants/codeChangeConstants';
import FileFormModal from '../components/FileFormModal';
import DeleteFileModal from '../components/DeleteFileModal';

export const CodeChangeDetailPage = () => {
  const { codeChangeId } = useParams();
  const { data: codeChange, isLoading, isError, error } = useCodeChangeDetails(codeChangeId);

  const addFileMutation = useAddCodeChangeFile();
  const updateFileMutation = useUpdateCodeChangeFile();
  const deleteFileMutation = useDeleteCodeChangeFile();

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFileForEdit, setSelectedFileForEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const getStatusBadge = (val) => {
    const found = CHANGE_STATUSES.find((s) => s.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const getEnvironmentBadge = (val) => {
    const found = CODE_ENVIRONMENTS.find((e) => e.value === val);
    const color = found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {found ? found.label : val}
      </span>
    );
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        weekday: 'short',
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

  // Open modal to add file
  const handleOpenAddFile = () => {
    setSelectedFileForEdit(null);
    setIsFileModalOpen(true);
  };

  // Open modal to edit file
  const handleOpenEditFile = (file) => {
    setSelectedFileForEdit(file);
    setIsFileModalOpen(true);
  };

  // Handle file form submit (add or edit)
  const handleFileFormSubmit = (fileData) => {
    if (selectedFileForEdit) {
      updateFileMutation.mutate(
        {
          codeChangeId,
          fileId: selectedFileForEdit.codeChangeFileId,
          fileData,
        },
        {
          onSuccess: () => {
            setIsFileModalOpen(false);
            setSelectedFileForEdit(null);
          },
        }
      );
    } else {
      addFileMutation.mutate(
        {
          codeChangeId,
          fileData,
        },
        {
          onSuccess: () => {
            setIsFileModalOpen(false);
          },
        }
      );
    }
  };

  // Open delete file modal
  const handleOpenDeleteFile = (file) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete file
  const handleConfirmDeleteFile = () => {
    if (!fileToDelete) return;
    deleteFileMutation.mutate(
      {
        codeChangeId,
        fileId: fileToDelete.codeChangeFileId,
      },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading code change details...</p>
      </div>
    );
  }

  if (isError || !codeChange) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-base font-semibold text-red-900">Code Change Not Found</h2>
        <p className="text-xs text-red-700">{error?.message || 'Unable to retrieve code change details.'}</p>
        <Link
          to="/code-changes"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Code Changes</span>
        </Link>
      </div>
    );
  }

  const files = codeChange.files || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/code-changes"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {codeChange.codeChangeCode}
              </h1>
              {getStatusBadge(codeChange.changeStatus)}
              {getEnvironmentBadge(codeChange.environment)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Change recorded for {formatDateTime(codeChange.changeDatetime)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/code-changes/${codeChangeId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Code Change</span>
          </Link>
        </div>
      </div>

      {/* Grid: Context & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details Card & Remarks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <GitCommit className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Code Change Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Change Status
                </span>
                <div>{getStatusBadge(codeChange.changeStatus)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  SVN Commit ID
                </span>
                {codeChange.svnCommitId ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs bg-slate-100 text-slate-800 border border-slate-200">
                    <GitCommit className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {codeChange.svnCommitId}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs italic">Uncommitted</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Environment
                </span>
                <div>{getEnvironmentBadge(codeChange.environment)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Change Date & Time
                </span>
                <span className="text-slate-700 text-xs font-medium">
                  {formatDateTime(codeChange.changeDatetime)}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Created At
                </span>
                <span className="text-slate-500 text-xs">{formatDateTime(codeChange.createdAt)}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Last Updated
                </span>
                <span className="text-slate-500 text-xs">{formatDateTime(codeChange.updatedAt)}</span>
              </div>
            </div>

            {/* Remarks */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Remarks
              </span>
              {codeChange.remarks ? (
                <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {codeChange.remarks}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No remarks recorded for this change.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Hierarchy Context Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Hierarchy Context
              </h2>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Project
              </span>
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${codeChange.projectId}`}
                  className="font-semibold text-sm text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                >
                  <span>{codeChange.projectName}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </Link>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                  {codeChange.projectCode}
                </span>
              </div>
            </div>

            {/* Task Item */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Task Item
              </span>
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/task-items/${codeChange.taskItemId}`}
                  className="text-xs text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 group"
                >
                  <span className="font-mono text-slate-600 font-semibold mr-1">
                    {codeChange.taskItemCode}:
                  </span>
                  <span>{codeChange.taskItemTitle}</span>
                </Link>
              </div>
            </div>

            {/* Work Log */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Parent Work Log
              </span>
              <div className="flex items-center justify-between">
                <Link
                  to={`/work-logs/${codeChange.workLogId}`}
                  className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>{codeChange.workLogCode}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  {codeChange.workDate}
                </span>
              </div>
            </div>

            {/* Immutability Note */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Code changes are permanently attached to this Work Log and cannot be reassigned or deleted.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Changed Files Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Changed Files ({files.length})
              </h2>
              <p className="text-xs text-slate-500">
                Individual file records detailing layer, technology, path, and modifications.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File Entry</span>
          </button>
        </div>

        {files.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">No changed files logged</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              File entries are completely optional. Click &quot;Add File Entry&quot; above if you wish to record specific file modifications.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">
                    Layer / Tech
                  </th>
                  <th scope="col" className="py-3 px-4">
                    File Path
                  </th>
                  <th scope="col" className="py-3 px-4">
                    What Changed
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Why Changed
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Affected / Remarks
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {files.map((file) => (
                  <tr key={file.codeChangeFileId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {file.layer || 'COMMON'}
                        </span>
                        {file.technology && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {file.technology}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-800 break-all max-w-xs select-all">
                      {file.filePath}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      {file.whatChanged ? (
                        <p className="line-clamp-2" title={file.whatChanged}>
                          {file.whatChanged}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      {file.whyChanged ? (
                        <p className="line-clamp-2" title={file.whyChanged}>
                          {file.whyChanged}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-500 text-[11px]">
                      {file.affectedFiles && (
                        <div className="truncate" title={`Affected: ${file.affectedFiles}`}>
                          <strong className="text-slate-600">Aff:</strong> {file.affectedFiles}
                        </div>
                      )}
                      {file.remarks && (
                        <div className="truncate italic text-slate-400" title={`Remarks: ${file.remarks}`}>
                          {file.remarks}
                        </div>
                      )}
                      {!file.affectedFiles && !file.remarks && (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFile(file)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit file entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteFile(file)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete file entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit File */}
      <FileFormModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleFileFormSubmit}
        initialData={selectedFileForEdit}
        isPending={addFileMutation.isPending || updateFileMutation.isPending}
      />

      {/* Modal: Delete File Confirmation */}
      <DeleteFileModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleConfirmDeleteFile}
        filePath={fileToDelete?.filePath}
        isPending={deleteFileMutation.isPending}
      />
    </div>
  );
};

export default CodeChangeDetailPage;
