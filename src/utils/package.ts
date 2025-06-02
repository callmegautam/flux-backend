import db from "@/db";
import { packages, versions } from "@/db/schema";
import { packageSchema } from "@/validators/package";
import axios from "axios";
import { and, eq } from "drizzle-orm";
import { promisify } from "util";
import { pipeline } from "stream";

export const npmAPIBaseURL = "https://registry.npmjs.org/";

export const npmAPI = axios.create({
    baseURL: npmAPIBaseURL,
    timeout: 5000,
});

export const pipelineAsync = promisify(pipeline);

/**
 * Fetches package data from the npm registry.
 * @param packageName - The name of the package to fetch data for.
 * @returns A promise that resolves to the package data if found, or null if not found or an error occurs.
 */
export const fetchPackageData = async (packageName: string) => {
    try {
        const response = await npmAPI.get(encodeURIComponent(packageName));
        if (response.status !== 200) {
            console.error(`Error fetching package data: ${response.status}`);
            return null;
        }
        return response.data;
    } catch (error) {
        console.error(`Error fetching package data: ${error}`);
        return null;
    }
};

// TODO: Add logic to handle different package versions AND add them to the database

/**
 * Saves package data to the database.
 * @param packageInfo - The package data to save.
 * @returns A promise that resolves to the saved package data, or null if an error occurs.
 */
export const savePackageData = async (packageInfo: any) => {
    try {
        const latestVersion = packageInfo["dist-tags"].latest;
        console.log(`Latest version for package ${packageInfo.name}: ${latestVersion}`);
        const rawData = {
            name: packageInfo._id ?? packageInfo.name,
            latestVersion: latestVersion,
            license: packageInfo.versions[latestVersion]?.license ?? packageInfo.license,
            description: packageInfo.versions[latestVersion]?.description ?? packageInfo.description,
            readme: packageInfo.readme,
        };

        const { success, data, error } = packageSchema.safeParse(rawData);

        if (!success) {
            console.error(`Validation error: ${error}`);
            return null;
        }

        const result = await db.insert(packages).values(data).returning();

        if (result.length === 0) {
            console.error("Failed to save package data");
            return null;
        }
    } catch (error) {
        console.error(`Error saving package data: ${error}`);
        return null;
    }
};

/**
 * Checks if a package exists in the database.
 * @param packageName - The name of the package to check.
 * @param version - Optional version to check for.
 * @returns A promise that resolves to the package data if it exists, or null if it does not exist or an error occurs.
 */
export const isPackageExists = async (packageName: string, version: string) => {
    try {
        const result = await db.select().from(packages).where(eq(packages.name, packageName)).limit(1);

        if (result.length === 0) {
            return null;
        }

        const isVersionAvailable = await db
            .select()
            .from(versions)
            .where(and(eq(versions.packageId, result[0].id), eq(versions.version, version)))
            .limit(1);

        if (isVersionAvailable.length === 0) {
            console.log(`Version ${version} of package ${packageName} does not exist.`);
            return null;
        }

        return {
            ...result[0],
            version: isVersionAvailable[0].version,
            fileUrl: isVersionAvailable[0].fileUrl,
        };
    } catch (error) {
        console.error(`Error checking package existence: ${error}`);
        return false;
    }
};
