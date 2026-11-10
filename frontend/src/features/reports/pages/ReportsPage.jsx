import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Archive,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Database,
  FileCode2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ExportDialog } from '../components/ExportDialog';
import { useExport, REPORT_TYPES } from '../hooks/useExport';

export const ReportsPage = () => {
  const { isExporting, exportReport } = useExport();

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    reportType: REPORT_TYPES.DAILY_WORK_LOG,
    initialScope: 'all',
  });

  const openDialog = (reportType, initialScope = 'filtered') => {
    setDialogState({
      isOpen: true,
      reportType,
      initialScope,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleQuickExportAll = (reportType) => {
    exportReport(reportType, { scope: 'all' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Excel Exports</h1>
        <p className="text-sm text-slate-600 mt-1">
          Download standardized Excel workbooks and combined ZIP archives generated directly from PostgreSQL database records.
        </p>
      </div>

      {/* ZIP Export Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Archive className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
            <Archive className="w-3.5 h-3.5" />
            <span>Complete Export Package</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Download All Reports in One ZIP Archive
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Exports all three original Excel workbooks (Daily Work Log, Database Change Log, and Code File Change Log) bundled into a single compressed <code className="text-emerald-300 font-mono text-xs">DevWork_Tracker_Reports.zip</code> archive.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuickExportAll(REPORT_TYPES.ALL_REPORTS)}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download All (Complete ZIP)</span>
            </button>

            <button
              type="button"
              onClick={() => openDialog(REPORT_TYPES.ALL_REPORTS, 'filtered')}
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-xs transition-colors disabled:opacity-50"
            >
              <Filter className="w-4 h-4 text-slate-300" />
              <span>Filtered ZIP Export...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Individual Workbooks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Individual Excel Workbooks</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Original sheet layout, instructions, conditional formats, and formulas are fully preserved.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Daily Work Log */}
          <ReportCard
            title="Daily Work Log"
            filename="01_Daily_Work_Log.xlsx"
            columnCount={22}
            icon={Clock}
            description="Complete daily developer activity logs, task requirements, work types, start/end times, automated duration calculations, and connected change IDs."
            isExporting={isExporting}
            onExportAll={() => handleQuickExportAll(REPORT_TYPES.DAILY_WORK_LOG)}
            onExportFiltered={() => openDialog(REPORT_TYPES.DAILY_WORK_LOG, 'filtered')}
          />

          {/* 2. DB Change Log */}
          <ReportCard
            title="DB Change Log"
            filename="02_DB_Change_Log.xlsx"
            columnCount={12}
            icon={Database}
            description="Database object modifications, table/procedure/trigger definitions, target environments, databases, what/why change details, and work log context."
            isExporting={isExporting}
            onExportAll={() => handleQuickExportAll(REPORT_TYPES.DB_CHANGE_LOG)}
            onExportFiltered={() => openDialog(REPORT_TYPES.DB_CHANGE_LOG, 'filtered')}
          />

          {/* 3. Code/File Change Log */}
          <ReportCard
            title="Code/File Change Log"
            filename="03_Code_File_Change_Log.xlsx"
            columnCount={13}
            icon={FileCode2}
            description="File-level source code modifications with newline-aggregated file details (layers, technologies, paths), SVN commit IDs, and commit status."
            isExporting={isExporting}
            onExportAll={() => handleQuickExportAll(REPORT_TYPES.CODE_CHANGE_LOG)}
            onExportFiltered={() => openDialog(REPORT_TYPES.CODE_CHANGE_LOG, 'filtered')}
          />
        </div>
      </div>

      {/* Preservation & Standards Note */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              Template Integrity & Manual Excel Workflow Compatibility:
            </p>
            <p>
              Exported workbooks are generated using Apache POI on top of the original manual Excel templates. All header columns, instructions worksheets, freeze panes, autofilters, cell borders, number formatting, and formula definitions (e.g. Day names, duration) are strictly preserved.
            </p>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        reportType={dialogState.reportType}
        initialScope={dialogState.initialScope}
      />
    </div>
  );
};

export default ReportsPage;
