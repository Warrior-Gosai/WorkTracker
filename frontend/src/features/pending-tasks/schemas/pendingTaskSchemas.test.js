import { describe, it, expect } from 'vitest';
import {
  createPendingTaskSchema,
  updatePendingTaskSchema,
  updatePendingTaskStatusSchema,
} from './pendingTaskSchemas';

describe('createPendingTaskSchema', () => {
  it('should validate valid data with defaults', () => {
    const input = {
      projectId: 1,
      title: 'Review production logs',
    };

    const result = createPendingTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('MEDIUM');
      expect(result.data.status).toBe('PENDING');
      expect(result.data.projectId).toBe(1);
    }
  });

  it('should coerce string projectId to number', () => {
    const input = {
      projectId: '42',
      title: 'Review database indexes',
    };

    const result = createPendingTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectId).toBe(42);
    }
  });

  it('should fail when projectId is missing or non-positive', () => {
    const missing = { title: 'No project' };
    expect(createPendingTaskSchema.safeParse(missing).success).toBe(false);

    const zero = { projectId: 0, title: 'Zero project' };
    expect(createPendingTaskSchema.safeParse(zero).success).toBe(false);

    const negative = { projectId: -5, title: 'Negative project' };
    expect(createPendingTaskSchema.safeParse(negative).success).toBe(false);
  });

  it('should fail when title is missing or empty', () => {
    const emptyTitle = { projectId: 1, title: '   ' };
    expect(createPendingTaskSchema.safeParse(emptyTitle).success).toBe(false);

    const missingTitle = { projectId: 1 };
    expect(createPendingTaskSchema.safeParse(missingTitle).success).toBe(false);
  });

  it('should fail when title exceeds 200 characters', () => {
    const input = {
      projectId: 1,
      title: 'A'.repeat(201),
    };
    expect(createPendingTaskSchema.safeParse(input).success).toBe(false);
  });

  it('should accept valid priority, status, and due date', () => {
    const input = {
      projectId: 2,
      title: 'Valid task with explicit fields',
      description: 'Some description',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: '2026-11-20',
      remarks: 'Some remark',
    };

    const result = createPendingTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('CRITICAL');
      expect(result.data.status).toBe('IN_PROGRESS');
      expect(result.data.dueDate).toBe('2026-11-20');
    }
  });

  it('should reject invalid priority or status', () => {
    const badPriority = {
      projectId: 1,
      title: 'Title',
      priority: 'URGENT',
    };
    expect(createPendingTaskSchema.safeParse(badPriority).success).toBe(false);

    const badStatus = {
      projectId: 1,
      title: 'Title',
      status: 'OPEN',
    };
    expect(createPendingTaskSchema.safeParse(badStatus).success).toBe(false);
  });
});

describe('updatePendingTaskSchema', () => {
  it('should validate valid update data', () => {
    const input = {
      title: 'Updated title',
      priority: 'HIGH',
      status: 'ON_HOLD',
      dueDate: '2026-12-01',
      description: 'Updated desc',
      remarks: 'Updated remarks',
    };

    const result = updatePendingTaskSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should fail update when title is missing or blank', () => {
    const input = {
      title: '  ',
      priority: 'HIGH',
      status: 'ON_HOLD',
    };

    expect(updatePendingTaskSchema.safeParse(input).success).toBe(false);
  });
});

describe('updatePendingTaskStatusSchema', () => {
  it('should validate allowed status transitions', () => {
    ['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].forEach((st) => {
      const result = updatePendingTaskStatusSchema.safeParse({ status: st });
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid status', () => {
    const result = updatePendingTaskStatusSchema.safeParse({ status: 'INVALID_STATUS' });
    expect(result.success).toBe(false);
  });
});
