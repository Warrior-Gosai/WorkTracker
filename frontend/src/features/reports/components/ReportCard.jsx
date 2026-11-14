import React from 'react';
import { Download, Filter, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';

export const ReportCard = ({
  title,
  description,
  filename,
  columnCount,
  icon: IconComponent = FileSpreadsheet,
  accentColor = 'emerald',
  onExportAll,
  onExportFiltered,
  isExporting = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col justify-between">
      <div className="p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{filename}</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {columnCount} Columns
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mt-4 leading-relaxed">
          {description}
        </p>

        {/* Feature Tags */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Original template preserved
          </span>
          <span className="inline-flex items-center text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Formulas & styles intact
          </span>
          <span className="inline-flex items-center text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Instructions sheet included
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExportFiltered}
          disabled={isExporting}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filtered Records...</span>
        </button>

        <button
          type="button"
          onClick={onExportAll}
          disabled={isExporting}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>All Records</span>
        </button>
      </div>
    </div>
  );
};

export default ReportCard;

