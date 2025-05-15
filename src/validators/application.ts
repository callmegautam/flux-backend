import { jobApplicationStatusEnum } from '@/db/schema';
import { z } from 'zod';

export const statusSchema = z.object({
    status: z.enum(jobApplicationStatusEnum.enumValues),
});
