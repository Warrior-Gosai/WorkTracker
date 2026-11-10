export const DB_ENVIRONMENTS = [
  { value: 'LOCAL', label: 'Local', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'UAT', label: 'UAT', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'LIVE', label: 'Live', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export const DATABASE_NAMES = [
  'PostgreSQL',
  'Oracle',
  'MySQL',
  'SQL Server',
  'MongoDB',
  'Other',
];

export const OBJECT_TYPES = [
  'Table',
  'Procedure',
  'Function',
  'Trigger',
  'View',
  'Package',
  'Cursor',
  'Sequence',
  'Index',
  'Constraint',
  'Other',
];

export const OBJECT_TYPE_COLORS = {
  Table: 'bg-blue-50 text-blue-700 border-blue-200',
  Procedure: 'bg-purple-50 text-purple-700 border-purple-200',
  Function: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Trigger: 'bg-amber-50 text-amber-700 border-amber-200',
  View: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Package: 'bg-violet-50 text-violet-700 border-violet-200',
  Cursor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Sequence: 'bg-teal-50 text-teal-700 border-teal-200',
  Index: 'bg-orange-50 text-orange-700 border-orange-200',
  Constraint: 'bg-rose-50 text-rose-700 border-rose-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};
