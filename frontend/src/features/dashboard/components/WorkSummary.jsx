import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  PauseCircle,
  Filter,
  X,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_PIE_COLORS = {
  Completed: '#10b981', // emerald-500
  'In Progress': '#3b82f6', // blue-500
  Blocked: '#f43f5e', // rose-500
  'On Hold': '#a855f7', // purple-500
};

export const WorkSummary = ({
  workSummary = {},
  isLoading = false,
  projectsList = [],
  filters = {},
  onFilterChange,
}) => {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');
  const [projectId, setProjectId] = useState(filters.projectId || '');

  const handleApply = (newFrom, newTo, newPrj) => {
    if (onFilterChange) {
      onFilterChange({
        dateFrom: newFrom !== undefined ? newFrom : dateFrom,
        dateTo: newTo !== undefined ? newTo : dateTo,
        projectId: newPrj !== undefined ? newPrj : projectId,
      });
    }
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setProjectId('');
    if (onFilterChange) {
      onFilterChange({ dateFrom: '', dateTo: '', projectId: '' });
    }
  };

  const totalLogs = workSummary.totalWorkLogs ?? 0;
  const totalHours = Number(workSummary.totalHours || 0).toFixed(2);
  const completed = workSummary.completedWorkLogs ?? 0;
  const inProgress = workSummary.inProgressWorkLogs ?? 0;
  const blocked = workSummary.blockedWorkLogs ?? 0;
  const onHold = workSummary.onHoldWorkLogs ?? 0;

  // Pie chart data
  const statusPieData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Blocked', value: blocked },
    { name: 'On Hold', value: onHold },
  ].filter((item) => item.value > 0);

  // Daily hours bar chart data
  const dailyData = (workSummary.dailySummaries || []).map((day) => ({
    date: day.date,
    hours: Number(day.hours || 0),
    logs: day.workLogsCount || 0,
  }));

  const hasActiveFilters = Boolean(dateFrom || dateTo || projectId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Section Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Work & Hours Summary
            </h2>
            <p className="text-xs text-slate-500">
              Analysis of engineering work logs, calculated hours, and workflow distribution
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Project select */}
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              handleApply(undefined, undefined, e.target.value);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Projects</option>
            {projectsList.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectCode} - {p.projectName}
              </option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              handleApply(e.target.value, undefined, undefined);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            title="Start date"
          />

          <span className="text-slate-400">to</span>

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              handleApply(undefined, e.target.value, undefined);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            title="End date"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Hours */}
        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
          <div className="flex items-center space-x-1.5 text-purple-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Total Hours</span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-900">
            {totalHours} <span className="text-xs font-normal text-purple-600 font-sans">hrs</span>
          </div>
        </div>

        {/* Total Work Logs */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Total Logs</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{totalLogs}</div>
        </div>

        {/* Completed */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center space-x-1.5 text-emerald-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900">{completed}</div>
        </div>

        {/* In Progress */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-center space-x-1.5 text-blue-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-900">{inProgress}</div>
        </div>

        {/* Blocked */}
        <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="flex items-center space-x-1.5 text-rose-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Blocked</span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-900">{blocked}</div>
        </div>

        {/* On Hold */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
          <div className="flex items-center space-x-1.5 text-amber-600 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <PauseCircle className="w-3.5 h-3.5" />
            <span>On Hold</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-900">{onHold}</div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Daily Hours Bar Chart (2 cols) */}
        <div className="lg:col-span-2 border border-slate-100 rounded-xl p-4 bg-slate-50/30">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Daily Logged Hours
          </h3>

          {dailyData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    unit="h"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                    formatter={(val) => [`${val} hrs`, 'Hours']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
              <span>No work log hours recorded for the selected filter range.</span>
            </div>
          )}
        </div>

        {/* Status Distribution Donut Chart (1 col) */}
        <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 flex flex-col">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Status Breakdown
          </h3>

          {statusPieData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_PIE_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                    formatter={(val, name) => [`${val} logs`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
              <span>No work log entries found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSummary;
