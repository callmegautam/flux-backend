import db from "@/db";
import { packages } from "@/db/schema";
import { packageSchema } from "@/validators/package";
import axios from "axios";

export const npmAPIBaseURL = "https://registry.npmjs.org/";

export const npmAPI = axios.create({
    baseURL: npmAPIBaseURL,
    timeout: 5000,
});

export const fetchPackageData = async (packageName: string) => {
    try {
        const response = await npmAPI.get(packageName);
        return response.data;
    } catch (error) {
        console.error(`Error fetching package data: ${error}`);
        return null;
    }
};

export const savePackageData = async (packageInfo: any) => {
    try {
        const latestVersion = packageInfo["dist-tags"].latest;
        const rawData = {
            name: packageInfo._id ?? packageInfo.name,
            latest: latestVersion,
            license:
                packageInfo.versions[latestVersion]?.license ??
                packageInfo.license,
            description:
                packageInfo.versions[latestVersion]?.description ??
                packageInfo.description,
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

        return result[0];
    } catch (error) {
        console.error(`Error saving package data: ${error}`);
        return null;
    }
};
