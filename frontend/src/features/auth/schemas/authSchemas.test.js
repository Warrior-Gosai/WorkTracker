import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './authSchemas';

describe('authSchemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse({
        usernameOrEmail: 'testuser',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty usernameOrEmail', () => {
      const result = loginSchema.safeParse({
        usernameOrEmail: '   ',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Username or email is required');
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        usernameOrEmail: 'testuser',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Password is required');
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      username: 'adminuser',
      email: 'admin@devworktracker.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };

    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        username: 'ab',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('between 3 and 100 characters');
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('between 8 and 72 characters');
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Passwords do not match');
    });
  });
});

