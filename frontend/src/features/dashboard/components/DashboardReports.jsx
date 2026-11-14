import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Archive,
  Download,
  Filter,
  ArrowRight,
  Clock,
  Database,
  FileCode2,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import { useExport, REPORT_TYPES } from '../../reports/hooks/useExport';
import { ExportDialog } from '../../reports/components/ExportDialog';

export const DashboardReports = () => {
  const { isExporting, exportReport } = useExport();

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    reportType: REPORT_TYPES.DAILY_WORK_LOG,
    initialScope: 'filtered',
  });

  const openFilterDialog = (reportType) => {
    setDialogState({
      isOpen: true,
      reportType,
      initialScope: 'filtered',
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleQuickDownloadAll = (reportType) => {
    exportReport(reportType, { scope: 'all' });
  };

  const reportItems = [
    {
      type: REPORT_TYPES.DAILY_WORK_LOG,
      title: 'Daily Work Log',
      filename: '01_Daily_Work_Log.xlsx',
      icon: Clock,
      cols: '22 Cols',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      type: REPORT_TYPES.DB_CHANGE_LOG,
      title: 'DB Change Log',
      filename: '02_DB_Change_Log.xlsx',
      icon: Database,
      cols: '12 Cols',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      type: REPORT_TYPES.CODE_CHANGE_LOG,
      title: 'Code Change Log',
      filename: '03_Code_File_Change_Log.xlsx',
      icon: FileCode2,
      cols: '13 Cols',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      type: REPORT_TYPES.ALL_REPORTS,
      title: 'All Reports (ZIP)',
      filename: 'DevWork_Tracker_Reports.zip',
      icon: Archive,
      cols: '3 Workbooks',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel Reports & Downloads</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download database records into the original Excel workbook templates with formulas and sheets preserved.
          </p>
        </div>
        <Link
          to={ROUTES.REPORTS}
          className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>Central Reports Page</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {reportItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.cols}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5" title={item.filename}>
                  {item.filename}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openFilterDialog(item.type)}
                  disabled={isExporting}
                  className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
                  title="Choose filters and export"
                >
                  <Filter className="w-3 h-3 text-slate-500" />
                  <span>Filtered</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDownloadAll(item.type)}
                  disabled={isExporting}
                  className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-2 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
                  title="Export all records"
                >
                  <Download className="w-3 h-3" />
                  <span>All</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ExportDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        reportType={dialogState.reportType}
        initialScope={dialogState.initialScope}
      />
    </div>
  );
};

export default DashboardReports;

