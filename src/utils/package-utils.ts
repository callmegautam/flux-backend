import db from "@/db";
import { packages } from "@/db/schema";
import { packageSchema } from "@/validators/package";
import axios from "axios";
import { eq } from "drizzle-orm";
import { promisify } from "util";
import { pipeline } from "stream";
import env from "@/config/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const npmAPIBaseURL = "https://registry.npmjs.org/";

export const npmAPI = axios.create({
    baseURL: npmAPIBaseURL,
    timeout: 5000,
});

export const pipelineAsync = promisify(pipeline);

export const fetchPackageData = async (packageName: string) => {
    try {
        // const response = await npmAPI.get(packageName);
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

// export const downloadPackageTarball = async (packageName: string, customVersion: any = null) => {
//     try {
//         const packageData = await fetchPackageData(packageName);

//         if (!packageData || !packageData["dist-tags"]?.latest) {
//             console.error(`Package ${packageName} not found or has no versions`);
//             return null;
//         }

//         const version = customVersion ?? packageData["dist-tags"].latest;
//         if (!packageData.versions[version]?.dist?.tarball) {
//             console.error(`Package ${packageName} has no tarball`);
//             return null;
//         }

//         const filePath = path.join(process.cwd(), "_temp", `${packageName}-${version}.tgz`);

//         const response = await axios({
//             url: packageData.versions[version].dist.tarball,
//             responseType: "stream",
//         });

//         const writer = fs.createWriteStream(filePath);

//         await pipelineAsync(response.data, writer);

//         console.log(`Package ${packageName} version ${version} downloaded successfully`);

//         return filePath;
//     } catch (error) {
//         console.error(`Error downloading package tarball: ${error}`);
//         return null;
//     }
// };

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = env.AWS_S3_BUCKET;

export const uploadPackageTarballToS3 = async (packageName: string, customVersion: string | null = null) => {
    try {
        const packageData = await fetchPackageData(packageName);

        if (!packageData || !packageData["dist-tags"]?.latest) {
            console.error(`Package ${packageName} not found or has no versions`);
            return null;
        }

        const version = customVersion ?? packageData["dist-tags"].latest;
        const tarballUrl = packageData.versions[version]?.dist?.tarball;

        if (!tarballUrl) {
            console.error(`Package ${packageName}@${version} has no tarball`);
            return null;
        }

        const response = await axios.get(tarballUrl, { responseType: "stream" });
        const contentLength = parseInt(response.headers["content-length"], 10);

        console.log(`Content length: ${contentLength}`);

        if (!contentLength || isNaN(contentLength)) {
            console.error(`Missing or invalid content length for ${packageName}@${version}`);
            return null;
        }

        const objectKey = `${packageName}/${packageName}-${version}.tgz`;

        let body;
        let contentType = "application/gzip";

        if (contentLength < 8192) {
            const bufferResponse = await axios.get(tarballUrl, { responseType: "arraybuffer" });
            body = Buffer.from(bufferResponse.data);
        } else {
            const streamResponse = await axios.get(tarballUrl, { responseType: "stream" });
            body = streamResponse.data;
        }

        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
                Body: body,
                ContentType: contentType,
                ContentLength: contentLength,
            })
        );

        const publicUrl = `https://${BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${objectKey}`;

        console.log(`✅ Uploaded ${packageName}@${version} to S3`);
        console.log(`🌐 Public URL: ${publicUrl}`);

        return publicUrl;
    } catch (error) {
        console.error("❌ Error uploading package tarball to S3:", error);
        return null;
    }
};
