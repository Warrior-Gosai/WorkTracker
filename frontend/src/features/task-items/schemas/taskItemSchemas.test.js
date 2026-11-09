import { describe, it, expect } from 'vitest';
import {
  createTaskItemSchema,
  updateTaskItemSchema,
  updateTaskStatusSchema,
} from './taskItemSchemas';

describe('taskItemSchemas', () => {
  describe('createTaskItemSchema', () => {
    it('should validate valid create task item data', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 1,
        taskType: 'FEATURE_DEVELOPMENT',
        title: 'Build Authentication Module',
        description: 'Implement JWT access token and cookie refresh',
        priority: 'HIGH',
        status: 'OPEN',
        remarks: 'Sprint 1 deliverable',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing or non-positive projectId', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 0,
        taskType: 'BUG_FIX',
        title: 'Fix issue',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a project');
    });

    it('should reject blank title', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 1,
        taskType: 'BUG_FIX',
        title: '   ',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Title is required');
    });

    it('should reject invalid task type', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 1,
        taskType: 'INVALID_TYPE',
        title: 'Title',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid task type');
    });

    it('should reject invalid priority', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 1,
        taskType: 'BUG_FIX',
        title: 'Title',
        priority: 'URGENT',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid priority');
    });

    it('should apply defaults for priority (MEDIUM) and status (OPEN)', () => {
      const result = createTaskItemSchema.safeParse({
        projectId: 1,
        taskType: 'ENHANCEMENT',
        title: 'Title',
      });
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe('MEDIUM');
      expect(result.data.status).toBe('OPEN');
    });
  });

  describe('updateTaskItemSchema', () => {
    it('should validate valid update task item data', () => {
      const result = updateTaskItemSchema.safeParse({
        taskType: 'BUG_FIX',
        title: 'Updated Bug Title',
        priority: 'CRITICAL',
        description: 'New details',
        remarks: 'New remarks',
      });
      expect(result.success).toBe(true);
    });

    it('should reject update with missing priority', () => {
      const result = updateTaskItemSchema.safeParse({
        taskType: 'BUG_FIX',
        title: 'Updated Title',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskStatusSchema', () => {
    it('should validate valid status change', () => {
      const result = updateTaskStatusSchema.safeParse({
        status: 'COMPLETED',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status value', () => {
      const result = updateTaskStatusSchema.safeParse({
        status: 'RESOLVED',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a valid workflow status');
    });
  });
});

