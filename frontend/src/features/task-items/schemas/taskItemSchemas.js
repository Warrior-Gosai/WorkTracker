import { z } from 'zod';

export const validTaskTypes = [
  'FEATURE_DEVELOPMENT',
  'NEW_DEVELOPMENT',
  'BUG_FIX',
  'ISSUE_DEFECT',
  'ENHANCEMENT',
  'TECHNICAL_IMPROVEMENT',
  'MAINTENANCE',
  'RESEARCH_INVESTIGATION',
  'OTHER',
];

export const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const validStatuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export const createTaskItemSchema = z.object({
  projectId: z.coerce
    .number()
    .positive('Please select a project'),
  taskType: z
    .string()
    .refine((val) => validTaskTypes.includes(val), {
      message: 'Please select a valid task type',
    }),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  priority: z
    .string()
    .refine((val) => validPriorities.includes(val), {
      message: 'Please select a valid priority',
    })
    .default('MEDIUM'),
  status: z
    .string()
    .refine((val) => validStatuses.includes(val), {
      message: 'Please select a valid status',
    })
    .default('OPEN'),
  remarks: z
    .string()
    .max(2000, 'Remarks must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

export const updateTaskItemSchema = z.object({
  taskType: z
    .string()
    .refine((val) => validTaskTypes.includes(val), {
      message: 'Please select a valid task type',
    }),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  priority: z
    .string()
    .refine((val) => validPriorities.includes(val), {
      message: 'Please select a valid priority',
    }),
  remarks: z
    .string()
    .max(2000, 'Remarks must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

export const updateTaskStatusSchema = z.object({
  status: z
    .string()
    .refine((val) => validStatuses.includes(val), {
      message: 'Please select a valid workflow status',
    }),
});
