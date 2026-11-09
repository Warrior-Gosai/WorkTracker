import { describe, it, expect } from 'vitest';
import { projectSchema } from './projectSchemas';

describe('projectSchemas', () => {
  it('should validate valid project data', () => {
    const result = projectSchema.safeParse({
      projectName: 'Core Banking API',
      description: 'API services for account transactions',
      remarks: 'Repository at gitlab.internal/banking-api',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty or whitespace-only project name', () => {
    const result = projectSchema.safeParse({
      projectName: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Project name is required');
  });

  it('should reject project name exceeding 150 characters', () => {
    const result = projectSchema.safeParse({
      projectName: 'A'.repeat(151),
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('must not exceed 150 characters');
  });

  it('should allow optional description and remarks to be empty or omitted', () => {
    const result = projectSchema.safeParse({
      projectName: 'Minimal Project',
    });
    expect(result.success).toBe(true);
  });

  it('should reject description exceeding 2000 characters', () => {
    const result = projectSchema.safeParse({
      projectName: 'Test Project',
      description: 'D'.repeat(2001),
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('must not exceed 2000 characters');
  });
});

