import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);
const password = z.string().min(8, 'Password must be at least 8 characters').max(128);

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password: password.regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number'),
});

export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required').max(128) });
