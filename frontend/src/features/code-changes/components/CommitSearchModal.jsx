import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, GitCommit, ArrowRight, AlertCircle } from 'lucide-react';
import codeChangeService from '../services/codeChangeService';

export const CommitSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [commitId, setCommitId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!commitId.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await codeChangeService.searchBySvnCommitId(commitId.trim());
      setResult(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No code change found for this SVN commit ID');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    onClose();
    navigate(`/code-changes/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Exact SVN Commit ID Search</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              SVN Commit ID / Revision
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={commitId}
                onChange={(e) => setCommitId(e.target.value)}
                placeholder="e.g. r1042 or 1042..."
                autoFocus
                className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-mono"
              />
              <button
                type="submit"
                disabled={loading || !commitId.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Performs an indexed exact match lookup across committed changes.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  {result.codeChangeCode}
                </span>
                <span className="font-mono text-xs text-slate-600 font-medium">
                  SVN: {result.svnCommitId}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <p>
                  <strong className="text-slate-800">Project:</strong> {result.projectName} ({result.projectCode})
                </p>
                <p>
                  <strong className="text-slate-800">Task:</strong> [{result.taskItemCode}] {result.taskItemTitle}
                </p>
                <p>
                  <strong className="text-slate-800">Work Log:</strong> {result.workLogCode} - {result.taskRequirement}
                </p>
                <p>
                  <strong className="text-slate-800">Environment:</strong> {result.environment}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleView(result.codeChangeId)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CommitSearchModal;
