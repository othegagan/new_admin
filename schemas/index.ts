import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: z.string({ message: 'Password is required' }).min(5, { message: 'Password is required' }).optional(),
    firebaseToken: z.string({ message: 'Firebase token is required' }).optional()
});
