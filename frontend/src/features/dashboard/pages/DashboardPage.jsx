import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  useDashboardSummary,
  useWorkSummary,
  useProjectSummary,
  usePendingSummary,
  useRecentActivities,
} from '../hooks/useDashboard';
import { projectService } from '../../projects/services/projectService';
import SummaryCards from '../components/SummaryCards';
import QuickActions from '../components/QuickActions';
import WorkSummary from '../components/WorkSummary';
import ProjectSummary from '../components/ProjectSummary';
import PendingTaskSummary from '../components/PendingTaskSummary';
import RecentActivities from '../components/RecentActivities';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import Button from '../../../components/common/Button';

export const DashboardPage = () => {
  const { user } = useAuth();

  // Work summary filter state
  const [workFilters, setWorkFilters] = useState({
    dateFrom: '',
    dateTo: '',
    projectId: '',
  });

  // Active projects for WorkSummary filter dropdown
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    projectService
      .getProjects({ size: 100, sortBy: 'projectName', direction: 'asc' })
      .then((res) => {
        if (isMounted && res?.content) {
          setProjectsList(res.content);
        }
      })
      .catch((err) => console.error('Failed to load projects for dashboard filter:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Queries
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
    isRefetching: isRefetchingSummary,
  } = useDashboardSummary();

  const {
    data: workData,
    isLoading: isLoadingWork,
    refetch: refetchWork,
  } = useWorkSummary(workFilters);

  const {
    data: projectData,
    isLoading: isLoadingProjects,
    refetch: refetchProjects,
  } = useProjectSummary();

  const {
    data: pendingData,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = usePendingSummary();

  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    refetch: refetchActivities,
  } = useRecentActivities(12);

  const handleRefreshAll = () => {
    refetchSummary();
    refetchWork();
    refetchProjects();
    refetchPending();
    refetchActivities();
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.username || 'Developer'}!
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized overview of projects, task items, daily work logs, and database/code changes
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={isRefetchingSummary}
              onClick={handleRefreshAll}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Overall Summary Cards */}
      <SummaryCards summary={summaryData} isLoading={isLoadingSummary} />

      {/* 2. Quick Action Shortcuts */}
      <QuickActions />

      {/* 3. Work Summary & Charts Section */}
      <WorkSummary
        workSummary={workData}
        isLoading={isLoadingWork}
        projectsList={projectsList}
        filters={workFilters}
        onFilterChange={setWorkFilters}
      />

      {/* 4. Two-Column Layout: Project Performance + Pending & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Project Breakdown */}
        <div className="space-y-6">
          <ProjectSummary
            projectSummaries={projectData || []}
            isLoading={isLoadingProjects}
          />
        </div>

        {/* Right: Pending Task Overview & Recent Activity Feed */}
        <div className="space-y-6">
          <PendingTaskSummary
            pendingSummary={pendingData || {}}
            isLoading={isLoadingPending}
          />

          <RecentActivities
            activities={activitiesData || []}
            isLoading={isLoadingActivities}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
