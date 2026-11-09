import { describe, it, expect } from 'vitest';
import { createWorkLogSchema, updateWorkLogSchema } from './workLogSchemas';

describe('workLogSchemas', () => {
  describe('createWorkLogSchema', () => {
    it('should validate valid create work log data', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workDate: '2026-11-09',
        environment: 'LOCAL',
        workType: 'DEVELOPMENT',
        taskRequirement: 'Implement Work Log module',
        workDescription: 'Created entities, DTOs, controllers, and tests',
        purposeReason: 'Excel migration requirement',
        technologyArea: 'Spring Boot 3, React',
        startTime: '09:00',
        endTime: '18:00',
        status: 'COMPLETED',
        problemBlocker: '',
        solutionResolution: '',
        testingVerification: 'All unit tests passing',
        resultOutcome: 'Feature operational',
        pendingNextAction: '',
        notesRemarks: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing or non-positive taskItemId', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 0,
        workType: 'DEVELOPMENT',
        taskRequirement: 'Implement requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a task item');
    });

    it('should reject blank taskRequirement', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        taskRequirement: '   ',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Task requirement is required');
    });

    it('should reject invalid workType', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'UNKNOWN_TYPE',
        taskRequirement: 'Valid requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid work type');
    });

    it('should reject invalid environment', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        environment: 'PRODUCTION',
        taskRequirement: 'Valid requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid environment');
    });

    it('should reject invalid status', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        status: 'CLOSED',
        taskRequirement: 'Valid requirement',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid status');
    });

    it('should accept when both startTime and endTime are empty', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        taskRequirement: 'Valid requirement',
        startTime: '',
        endTime: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject when only startTime is provided', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        taskRequirement: 'Valid requirement',
        startTime: '09:00',
        endTime: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Start time and end time must either both be provided or both be empty'
      );
    });

    it('should reject when only endTime is provided', () => {
      const result = createWorkLogSchema.safeParse({
        taskItemId: 10,
        workType: 'DEVELOPMENT',
        taskRequirement: 'Valid requirement',
        startTime: '',
        endTime: '17:00',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Start time and end time must either both be provided or both be empty'
      );
    });
  });

  describe('updateWorkLogSchema', () => {
    it('should validate valid update data without requiring taskItemId', () => {
      const result = updateWorkLogSchema.safeParse({
        workDate: '2026-11-10',
        environment: 'UAT',
        workType: 'BUG_FIXING',
        taskRequirement: 'Updated Requirement',
        startTime: '10:00',
        endTime: '12:00',
        status: 'IN_PROGRESS',
      });
      expect(result.success).toBe(true);
    });

    it('should reject update data with only one time field populated', () => {
      const result = updateWorkLogSchema.safeParse({
        workType: 'BUG_FIXING',
        taskRequirement: 'Updated Requirement',
        startTime: '10:00',
        endTime: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe(
        'Start time and end time must either both be provided or both be empty'
      );
    });
  });
});

