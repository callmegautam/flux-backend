import { z } from "zod";

export const packageSchema = z.object({
    name: z.string().min(1, "Package name is required").max(100, "Package name must be less than 100 characters"),
    fileUrl: z.string().url("Invalid file URL").optional(),
    latestVersion: z
        .string()
        .max(50, "Version string too long")
        .regex(/^(\d+\.)?(\d+\.)?(\*|\d+)$/, "Invalid version format"),
    license: z.string().min(1, "License is required").max(100, "License must be less than 100 characters"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(1000, "Description must be less than 1000 characters"),
    readme: z.string().min(1, "Readme is required"),
});

export type PackageSchema = z.infer<typeof packageSchema>;
