import { z } from 'zod';
import { DB_ENVIRONMENTS, DATABASE_NAMES, OBJECT_TYPES } from '../constants/dbChangeConstants';

export const validEnvironments = DB_ENVIRONMENTS.map((e) => e.value);
export const validDatabases = DATABASE_NAMES;
export const validObjectTypes = OBJECT_TYPES;

export const createDbChangeSchema = z.object({
  workLogId: z.coerce.number().positive('Please select a daily work log'),
  environment: z
    .string()
    .refine((val) => validEnvironments.includes(val), {
      message: 'Please select a valid environment',
    })
    .default('LOCAL'),
  databaseName: z
    .string()
    .refine((val) => validDatabases.includes(val), {
      message: 'Please select a valid database platform',
    })
    .default('PostgreSQL'),
  objectType: z
    .string()
    .refine((val) => validObjectTypes.includes(val), {
      message: 'Please select a valid object type',
    })
    .default('Table'),
  objectName: z
    .string()
    .trim()
    .min(1, 'Object name is required')
    .max(200, 'Object name cannot exceed 200 characters'),
  whatChanged: z.string().optional().or(z.literal('')),
  whyChanged: z
    .string()
    .trim()
    .min(1, 'Why changed / business reason is required'),
  affectedObject: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});

export const updateDbChangeSchema = z.object({
  environment: z
    .string()
    .refine((val) => validEnvironments.includes(val), {
      message: 'Please select a valid environment',
    }),
  databaseName: z
    .string()
    .refine((val) => validDatabases.includes(val), {
      message: 'Please select a valid database platform',
    }),
  objectType: z
    .string()
    .refine((val) => validObjectTypes.includes(val), {
      message: 'Please select a valid object type',
    }),
  objectName: z
    .string()
    .trim()
    .min(1, 'Object name is required')
    .max(200, 'Object name cannot exceed 200 characters'),
  whatChanged: z.string().optional().or(z.literal('')),
  whyChanged: z
    .string()
    .trim()
    .min(1, 'Why changed / business reason is required'),
  affectedObject: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});
