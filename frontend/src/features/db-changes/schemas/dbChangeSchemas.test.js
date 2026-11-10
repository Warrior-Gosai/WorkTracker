import { describe, it, expect } from 'vitest';
import { createDbChangeSchema, updateDbChangeSchema } from './dbChangeSchemas';

describe('dbChangeSchemas', () => {
  describe('createDbChangeSchema', () => {
    it('should validate valid create DB change data', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'LOCAL',
        databaseName: 'PostgreSQL',
        objectType: 'Table',
        objectName: 'app_user',
        whatChanged: 'Added constraint',
        whyChanged: 'Security requirement',
        affectedObject: 'auth_token',
        remarks: 'No migration issues',
      });
      expect(result.success).toBe(true);
    });

    it('should validate valid DB change with optional fields omitted or empty', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'UAT',
        databaseName: 'Oracle',
        objectType: 'Procedure',
        objectName: 'sp_recalculate_work_hours',
        whyChanged: 'Fix calculation bug',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing or non-positive workLogId', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 0,
        environment: 'LOCAL',
        databaseName: 'PostgreSQL',
        objectType: 'Table',
        objectName: 'app_user',
        whyChanged: 'Security requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a daily work log');
    });

    it('should reject invalid environment', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'STAGING',
        databaseName: 'PostgreSQL',
        objectType: 'Table',
        objectName: 'app_user',
        whyChanged: 'Security requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid environment');
    });

    it('should reject invalid database platform', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'LOCAL',
        databaseName: 'Cassandra',
        objectType: 'Table',
        objectName: 'app_user',
        whyChanged: 'Security requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid database platform');
    });

    it('should reject invalid object type', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'LOCAL',
        databaseName: 'PostgreSQL',
        objectType: 'UnknownType',
        objectName: 'app_user',
        whyChanged: 'Security requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid object type');
    });

    it('should reject blank objectName', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'LOCAL',
        databaseName: 'PostgreSQL',
        objectType: 'Table',
        objectName: '   ',
        whyChanged: 'Security requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Object name is required');
    });

    it('should reject blank whyChanged', () => {
      const result = createDbChangeSchema.safeParse({
        workLogId: 10,
        environment: 'LOCAL',
        databaseName: 'PostgreSQL',
        objectType: 'Table',
        objectName: 'app_user',
        whyChanged: '   ',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Why changed / business reason is required');
    });
  });

  describe('updateDbChangeSchema', () => {
    it('should validate valid update DB change data', () => {
      const result = updateDbChangeSchema.safeParse({
        environment: 'LIVE',
        databaseName: 'MySQL',
        objectType: 'Trigger',
        objectName: 'trg_audit',
        whatChanged: 'Updated trigger body',
        whyChanged: 'Compliance audit',
        affectedObject: 'audit_table',
        remarks: 'Deployed to live',
      });
      expect(result.success).toBe(true);
    });

    it('should reject update with blank whyChanged', () => {
      const result = updateDbChangeSchema.safeParse({
        environment: 'LIVE',
        databaseName: 'MySQL',
        objectType: 'Trigger',
        objectName: 'trg_audit',
        whyChanged: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Why changed / business reason is required');
    });
  });
});
