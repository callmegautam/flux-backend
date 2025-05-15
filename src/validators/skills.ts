import { z } from 'zod';
import { skillsEnum } from '@/db/schema';

export const skillsSchema = z.object({
    skills: z.array(z.enum(skillsEnum.enumValues)),
});
