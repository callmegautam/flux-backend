import { z } from "zod";

export const packageSchema = z.object({
    name: z.string(),
    fileUrl: z.string().url().optional(),
    latestVersion: z.string().max(50),
    license: z.string().max(50),
    description: z.string(),
    readme: z.string(),
});
