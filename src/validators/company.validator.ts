import { z } from 'zod';
import { verificationStatus } from '@/db/schema';
export const registerCompanySchema = z.object({
    companyName: z
        .string({ required_error: 'Company name is required' })
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name is too long'),

    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),

    domain: z
        .string({ required_error: 'Domain is required' })
        .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Domain must be a valid domain format (e.g., example.com)'),
});

export const loginCompanySchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
});

export const updateCompanySchema = z.object({
    email: z.string().email(),
    companyName: z.string().min(2),
    domain: z.string().min(2),
    description: z.string().optional(),
    website: z.string().url().optional(),
    address: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    isVerified: z.boolean().optional(),
    verificationStatus: z.enum([...verificationStatus.enumValues]).optional(),
});
