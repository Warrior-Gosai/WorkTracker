import { z } from 'zod';

export const validWorkTypes = [
  'DEVELOPMENT',
  'BUG_FIXING',
  'TESTING',
  'DEBUGGING',
  'INVESTIGATION',
  'ENHANCEMENT',
  'DOCUMENTATION',
  'DEPLOYMENT',
  'MAINTENANCE',
  'OTHER',
];

export const validEnvironments = ['LOCAL', 'UAT', 'LIVE'];
export const validWorkStatuses = ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'ON_HOLD'];

const baseWorkLogShape = {
  workDate: z
    .string()
    .min(1, 'Work date is required')
    .default(() => new Date().toISOString().split('T')[0]),
  environment: z
    .string()
    .refine((val) => validEnvironments.includes(val), {
      message: 'Please select a valid environment',
    })
    .default('LOCAL'),
  workType: z
    .string()
    .refine((val) => validWorkTypes.includes(val), {
      message: 'Please select a valid work type',
    }),
  taskRequirement: z
    .string()
    .trim()
    .min(1, 'Task requirement is required'),
  workDescription: z.string().optional().or(z.literal('')),
  purposeReason: z.string().optional().or(z.literal('')),
  technologyArea: z.string().max(200, 'Technology / Area must not exceed 200 characters').optional().or(z.literal('')),
  startTime: z.string().optional().or(z.literal('')),
  endTime: z.string().optional().or(z.literal('')),
  status: z
    .string()
    .refine((val) => validWorkStatuses.includes(val), {
      message: 'Please select a valid status',
    })
    .default('IN_PROGRESS'),
  problemBlocker: z.string().optional().or(z.literal('')),
  solutionResolution: z.string().optional().or(z.literal('')),
  testingVerification: z.string().optional().or(z.literal('')),
  resultOutcome: z.string().optional().or(z.literal('')),
  pendingNextAction: z.string().optional().or(z.literal('')),
  notesRemarks: z.string().optional().or(z.literal('')),
};

const validateTimePair = (data) => {
  const hasStart = Boolean(data.startTime && data.startTime.trim() !== '');
  const hasEnd = Boolean(data.endTime && data.endTime.trim() !== '');
  return (hasStart && hasEnd) || (!hasStart && !hasEnd);
};

export const createWorkLogSchema = z
  .object({
    taskItemId: z.coerce.number().positive('Please select a task item'),
    ...baseWorkLogShape,
  })
  .refine(validateTimePair, {
    message: 'Start time and end time must either both be provided or both be empty',
    path: ['endTime'],
  });

export const updateWorkLogSchema = z
  .object(baseWorkLogShape)
  .refine(validateTimePair, {
    message: 'Start time and end time must either both be provided or both be empty',
    path: ['endTime'],
  });

