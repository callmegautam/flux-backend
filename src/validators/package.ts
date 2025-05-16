import { z } from 'zod';

export const packageSchema = z.object({
    package: z
        .string({ required_error: 'Package is required' })
        .regex(/^[a-zA-Z\-]+$/, { message: 'Invalid package name' }),
    version: z.string({ required_error: 'Version is required' }).regex(/^\d+\.\d+\.\d+$/, {
        message: 'Version must be in the format number.number.number (e.g. 1.0.0)',
    }),
});
