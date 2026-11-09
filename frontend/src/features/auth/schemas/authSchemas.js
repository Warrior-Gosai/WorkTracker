import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .trim()
    .min(1, 'Username or email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be between 3 and 100 characters')
      .max(100, 'Username must be between 3 and 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must not exceed 255 characters'),
    password: z
      .string()
      .min(8, 'Password must be between 8 and 72 characters')
      .max(72, 'Password must be between 8 and 72 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

