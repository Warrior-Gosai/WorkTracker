import { z } from 'zod';

export const projectSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(150, 'Project name must not exceed 150 characters'),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  remarks: z
    .string()
    .max(2000, 'Remarks must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

export const createProjectSchema = projectSchema;
export const updateProjectSchema = projectSchema;

