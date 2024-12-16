import { z } from 'zod';

export const requiredNumberSchema = z.union([
    z.coerce.number({
        message: 'Must be a number'
    }),
    z.literal('').refine(() => false, {
        message: 'This field is required'
    })
]);

export const requiredWholeNumberSchema = z.union([
    z.coerce
        .number({
            message: 'Must be a number'
        })
        .int('Please enter a whole number'),
    z.literal('').refine(() => false, {
        message: 'This field is required'
    })
]);
