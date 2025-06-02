import axios from "axios";
import env from "@/config/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fetchPackageData } from "@/utils/index";

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
