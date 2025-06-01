import db from "@/db";
import { packages } from "@/db/schema";
import { packageSchema } from "@/validators/package";
import axios from "axios";
import { eq } from "drizzle-orm";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from "fs";

export const npmAPIBaseURL = "https://registry.npmjs.org/";

export const npmAPI = axios.create({
    baseURL: npmAPIBaseURL,
    timeout: 5000,
});

export const pipelineAsync = promisify(pipeline);

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

        return result[0];
    } catch (error) {
        console.error(`Error saving package data: ${error}`);
        return null;
    }
};

export const isPackageExists = async (packageName: string) => {
    try {
        const result = await db.select().from(packages).where(eq(packages.name, packageName)).limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0];
    } catch (error) {
        console.error(`Error checking package existence: ${error}`);
        return false;
    }
};

export const downloadPackageTarball = async (packageName: string, customVersion: any = null) => {
    try {
        const packageData = await fetchPackageData(packageName);

        if (!packageData || !packageData["dist-tags"]?.latest) {
            console.error(`Package ${packageName} not found or has no versions`);
            return null;
        }

        const version = customVersion ?? packageData["dist-tags"].latest;
        if (!packageData.versions[version]?.dist?.tarball) {
            console.error(`Package ${packageName} has no tarball`);
            return null;
        }

        const filePath = path.join(process.cwd(), "_temp", `${packageName}-${version}.tgz`);

        const response = await axios({
            url: packageData.versions[version].dist.tarball,
            responseType: "stream",
        });

        const writer = fs.createWriteStream(filePath);

        await pipelineAsync(response.data, writer);

        console.log(`Package ${packageName} version ${version} downloaded successfully`);

        return filePath;
    } catch (error) {
        console.error(`Error downloading package tarball: ${error}`);
        return null;
    }
};

export const uploadToS3 = async (file: any) => {};
