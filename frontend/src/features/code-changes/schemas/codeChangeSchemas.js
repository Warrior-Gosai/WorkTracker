import { z } from 'zod';

export const validChangeStatuses = ['COMMITTED', 'UNCOMMITTED'];
export const validEnvironments = ['LOCAL', 'UAT', 'LIVE'];

export const codeChangeFileSchema = z.object({
  codeChangeFileId: z.number().optional(),
  layer: z.string().max(50).optional().or(z.literal('')),
  technology: z.string().max(100).optional().or(z.literal('')),
  filePath: z
    .string()
    .trim()
    .min(1, 'File path is required'),
  whatChanged: z.string().optional().or(z.literal('')),
  whyChanged: z.string().optional().or(z.literal('')),
  affectedFiles: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});

const validateCommitStatus = (data) => {
  const isCommitted = data.changeStatus === 'COMMITTED';
  const hasCommitId = Boolean(data.svnCommitId && data.svnCommitId.trim() !== '');

  if (isCommitted) {
    return hasCommitId;
  }
  // If UNCOMMITTED, commit ID must be empty
  return !hasCommitId;
};

export const createCodeChangeSchema = z
  .object({
    workLogId: z.coerce.number().positive('Please select a work log'),
    changeStatus: z
      .string()
      .refine((val) => validChangeStatuses.includes(val), {
        message: 'Please select a valid change status',
      })
      .default('UNCOMMITTED'),
    svnCommitId: z.string().optional().or(z.literal('')),
    changeDatetime: z
      .string()
      .min(1, 'Change date & time is required')
      .default(() => new Date().toISOString()),
    environment: z
      .string()
      .refine((val) => validEnvironments.includes(val), {
        message: 'Please select a valid environment',
      })
      .default('LOCAL'),
    remarks: z.string().optional().or(z.literal('')),
    files: z.array(codeChangeFileSchema).default([]),
  })
  .refine(validateCommitStatus, {
    message: 'SVN Commit ID is required for COMMITTED status and must be empty for UNCOMMITTED',
    path: ['svnCommitId'],
  });

export const updateCodeChangeSchema = z
  .object({
    changeStatus: z
      .string()
      .refine((val) => validChangeStatuses.includes(val), {
        message: 'Please select a valid change status',
      }),
    svnCommitId: z.string().optional().or(z.literal('')),
    changeDatetime: z.string().min(1, 'Change date & time is required'),
    environment: z
      .string()
      .refine((val) => validEnvironments.includes(val), {
        message: 'Please select a valid environment',
      }),
    remarks: z.string().optional().or(z.literal('')),
  })
  .refine(validateCommitStatus, {
    message: 'SVN Commit ID is required for COMMITTED status and must be empty for UNCOMMITTED',
    path: ['svnCommitId'],
  });
