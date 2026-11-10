import { z } from 'zod';

export const createPendingTaskSchema = z.object({
  projectId: z.coerce
    .number({
      required_error: 'Please select a project',
      invalid_type_error: 'Please select a project',
    })
    .positive('Please select a project'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
    .default('PENDING'),
  dueDate: z.string().trim().optional().nullable().or(z.literal('')),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const updatePendingTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  dueDate: z.string().trim().optional().nullable().or(z.literal('')),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const updatePendingTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Status is required',
  }),
});
