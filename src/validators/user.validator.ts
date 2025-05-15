import { course } from '@/db/schema';
import { z } from 'zod';

const MAX_URL_LENGTH = 200;

export const registerUserSchema = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes'),

    name: z
        .string({ required_error: 'Name is required' })
        .min(1, 'Name cannot be empty')
        .max(50, 'Name is too long'),

    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
});

export const loginUserSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
});

export const updateUserSchema = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes'),

    name: z
        .string({ required_error: 'Name is required' })
        .min(1, 'Name cannot be empty')
        .max(50, 'Name is too long'),

    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),

    course: z.enum(course.enumValues),

    collegeId: z
        .number({ required_error: 'CollegeId is required' })
        .min(1, 'CollegeId cannot be empty')
        .max(50, 'CollegeId is too long'),

    githubUrl: z
        .string({ required_error: 'GithubUrl is required' })
        .url('GithubUrl must be a valid URL')
        .max(MAX_URL_LENGTH, `GithubUrl is too long (max ${MAX_URL_LENGTH} characters)`),

    resumeUrl: z
        .string({ required_error: 'ResumeUrl is required' })
        .url('ResumeUrl must be a valid URL')
        .max(MAX_URL_LENGTH, `ResumeUrl is too long (max ${MAX_URL_LENGTH} characters)`),

    avatarUrl: z
        .string({ required_error: 'AvatarUrl is required' })
        .url('AvatarUrl must be a valid URL')
        .max(MAX_URL_LENGTH, `AvatarUrl is too long (max ${MAX_URL_LENGTH} characters)`),

    admissionYear: z.number({ required_error: 'AdmissionYear is required' }),

    currentYear: z.number({ required_error: 'CurrentYear is required' }),

    gradYear: z.number({ required_error: 'GradYear is required' }),
});
