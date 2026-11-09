import { describe, it, expect } from 'vitest';
import {
  createCodeChangeSchema,
  updateCodeChangeSchema,
  codeChangeFileSchema,
} from './codeChangeSchemas';

describe('codeChangeSchemas', () => {
  describe('codeChangeFileSchema', () => {
    it('should validate valid file with required filePath and optional fields', () => {
      const result = codeChangeFileSchema.safeParse({
        layer: 'BACKEND',
        technology: 'Java',
        filePath: 'src/main/java/com/devworktracker/WorkLog.java',
        whatChanged: 'Added code change relation',
        whyChanged: 'Task 8 requirement',
        affectedFiles: 'WorkLogService.java',
        remarks: 'No issues',
      });
      expect(result.success).toBe(true);
    });

    it('should reject file with missing or empty filePath', () => {
      const result = codeChangeFileSchema.safeParse({
        layer: 'FRONTEND',
        filePath: '   ',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('File path is required');
    });

    it('should allow file without optional fields', () => {
      const result = codeChangeFileSchema.safeParse({
        filePath: 'package.json',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createCodeChangeSchema', () => {
    it('should validate valid UNCOMMITTED change without commit ID', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 5,
        changeStatus: 'UNCOMMITTED',
        svnCommitId: '',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'LOCAL',
        remarks: 'Working locally',
        files: [],
      });
      expect(result.success).toBe(true);
    });

    it('should validate valid COMMITTED change with commit ID', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 5,
        changeStatus: 'COMMITTED',
        svnCommitId: 'r1042',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'LIVE',
        remarks: 'Live deploy revision',
        files: [
          {
            layer: 'BACKEND',
            filePath: 'com/devworktracker/entity/CodeChange.java',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject COMMITTED change when commit ID is missing or empty', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 5,
        changeStatus: 'COMMITTED',
        svnCommitId: '',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'LOCAL',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('svnCommitId');
    });

    it('should reject UNCOMMITTED change when commit ID is provided', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 5,
        changeStatus: 'UNCOMMITTED',
        svnCommitId: 'r1042',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'LOCAL',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('svnCommitId');
    });

    it('should reject invalid or missing workLogId', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 0,
        changeStatus: 'UNCOMMITTED',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'LOCAL',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a work log');
    });

    it('should reject invalid environment', () => {
      const result = createCodeChangeSchema.safeParse({
        workLogId: 5,
        changeStatus: 'UNCOMMITTED',
        changeDatetime: '2026-11-09T22:30:00.000Z',
        environment: 'STAGING',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid environment');
    });
  });

  describe('updateCodeChangeSchema', () => {
    it('should validate valid update with COMMITTED and commit ID', () => {
      const result = updateCodeChangeSchema.safeParse({
        changeStatus: 'COMMITTED',
        svnCommitId: 'r1043',
        changeDatetime: '2026-11-09T23:00:00.000Z',
        environment: 'UAT',
        remarks: 'Updated remarks',
      });
      expect(result.success).toBe(true);
    });

    it('should validate valid update with UNCOMMITTED and empty commit ID', () => {
      const result = updateCodeChangeSchema.safeParse({
        changeStatus: 'UNCOMMITTED',
        svnCommitId: '',
        changeDatetime: '2026-11-09T23:00:00.000Z',
        environment: 'LOCAL',
        remarks: 'Still uncommitted',
      });
      expect(result.success).toBe(true);
    });

    it('should reject update with COMMITTED and empty commit ID', () => {
      const result = updateCodeChangeSchema.safeParse({
        changeStatus: 'COMMITTED',
        svnCommitId: '',
        changeDatetime: '2026-11-09T23:00:00.000Z',
        environment: 'LOCAL',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('svnCommitId');
    });

    it('should reject update with UNCOMMITTED and non-empty commit ID', () => {
      const result = updateCodeChangeSchema.safeParse({
        changeStatus: 'UNCOMMITTED',
        svnCommitId: 'r9999',
        changeDatetime: '2026-11-09T23:00:00.000Z',
        environment: 'LOCAL',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('svnCommitId');
    });
  });
});
