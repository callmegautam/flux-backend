import { jobMode, jobType, skillsEnum } from '@/db/schema';
import { z } from 'zod';

export const createJobSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(1, 'Title cannot be empty')
        .max(50, 'Title is too long'),
    // .regex(/^[a-zA-Z0-9_-]+$/, 'Title can only contain letters, numbers, underscores and dashes'),
    description: z
        .string({ required_error: 'Description is required' })
        .min(1, 'Description cannot be empty')
        .max(1000, 'Description is too long'),
    location: z.string().min(1, 'Location cannot be empty').max(100, 'Location is too long'),
    jobType: z.enum(jobType.enumValues),
    jobMode: z.enum(jobMode.enumValues),
    requiredSkills: z.array(z.enum(skillsEnum.enumValues)),
});

export const updateJobSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .min(1, 'Title cannot be empty')
        .max(50, 'Title is too long'),
    // .regex(/^[a-zA-Z0-9_-]+$/, 'Title can only contain letters, numbers, underscores and dashes'),
    description: z
        .string({ required_error: 'Description is required' })
        .min(1, 'Description cannot be empty')
        .max(1000, 'Description is too long'),
    location: z.string().min(1, 'Location cannot be empty').max(100, 'Location is too long'),
    type: z.string(z.enum(jobType.enumValues)),
    requiredSkills: z.array(z.enum(skillsEnum.enumValues)),
});
