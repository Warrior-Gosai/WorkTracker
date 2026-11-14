import { useState } from 'react';
import { toast } from 'react-toastify';
import exportService from '../services/exportService';

export const REPORT_TYPES = {
  DAILY_WORK_LOG: 'DAILY_WORK_LOG',
  DB_CHANGE_LOG: 'DB_CHANGE_LOG',
  CODE_CHANGE_LOG: 'CODE_CHANGE_LOG',
  ALL_REPORTS: 'ALL_REPORTS',
};

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  const exportReport = async (reportType, params = {}) => {
    if (isExporting) return;

    setIsExporting(true);
    setActiveReport(reportType);

    try {
      let downloadedFilename = '';

      switch (reportType) {
        case REPORT_TYPES.DAILY_WORK_LOG:
          downloadedFilename = await exportService.exportDailyWorkLog(params);
          break;
        case REPORT_TYPES.DB_CHANGE_LOG:
          downloadedFilename = await exportService.exportDbChangeLog(params);
          break;
        case REPORT_TYPES.CODE_CHANGE_LOG:
          downloadedFilename = await exportService.exportCodeChangeLog(params);
          break;
        case REPORT_TYPES.ALL_REPORTS:
          downloadedFilename = await exportService.exportAllReports(params);
          break;
        default:
          throw new Error('Unknown report type: ' + reportType);
      }

      toast.success(`Successfully downloaded ${downloadedFilename}`);
      return downloadedFilename;
    } catch (err) {
      toast.error(err.message || 'Export failed. Please try again.');
      throw err;
    } finally {
      setIsExporting(false);
      setActiveReport(null);
    }
  };

  return {
    isExporting,
    activeReport,
    exportReport,
  };
}

export default useExport;

