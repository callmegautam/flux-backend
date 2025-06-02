import { z } from "zod";

const schema = z.object({
    NODE_ENV: z.enum(["DEVELOPMENT", "PRODUCTION"]).default("DEVELOPMENT"),
    PORT: z.coerce.number().default(3000),
    CORS_ORIGIN: z.string(),
    DB_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.string(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),
    AWS_S3_BUCKET: z.string(),
});

export default schema.parse(process.env);
