import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    password: z.string({ message: 'Password is required' }).min(5, { message: 'Password is required' }).optional(),
    firebaseToken: z.string({ message: 'Firebase token is required' }).optional()
});

export const configurationsSchema = z.object({
    averageRentaDays: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(365, 'Must be less than or equal to 365')
            .int('Please enter a whole number'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    concessionFee: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(1000, 'Must be less than or equal to 1000')
            .int('Please enter a whole number'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    concessionPercentage: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(10000, 'Must be less than or equal to 100'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    registrationFee: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(1000, 'Must be less than or equal to 1000')
            .int('Please enter a whole number'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    stateTax: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(1000, 'Must be less than or equal to 1000')
            .int('Please enter a whole number'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    upCharge: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .max(1000, 'Must be less than or equal to 1000')
            .int('Please enter a whole number'),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ])
});
