import db from "@/db";
import { packages } from "@/db/schema";
import asyncHandler from "@/utils/asyncHandler";
import { fetchPackageData, isPackageExists, savePackageData, uploadPackageTarballToS3 } from "@/utils/package-utils";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

// TODO : ADD LOGIC OF VERSION HANDLING
export const getPackage = asyncHandler(async (req: Request, res: Response) => {
    console.log("Received request to get package data");

    const { packageName, version } = req.body;

    if (!packageName) {
        return res.status(400).json({ error: "Package name is required" });
    }

    const packageExists = await isPackageExists(packageName);
    if (packageExists) {
        return res.status(200).json({
            success: true,
            message: "Package found",
            data: packageExists.fileUrl,
        });
    }

    const packageData = await fetchPackageData(packageName);
    if (!packageData) {
        return res.status(404).json({
            success: false,
            message: "Package not found",
            data: null,
        });
    }

    console.log(`Tarball URL for package ${packageName}:`, packageData.versions[version]?.dist?.tarball);

    res.status(200).json({
        success: true,
        message: "Package data fetched successfully",
        data: packageData.versions[version].dist.tarball,
    });

    // TODO: add logic to upload tarball to S3 or any other storage service and update fileUrl

    const fileUrl = await uploadPackageTarballToS3(packageName, version);

    if (!fileUrl) {
        return console.log(`Failed to upload package tarball for ${packageName}`);
    }

    await savePackageData(packageData);

    const packageInfo = await db.update(packages).set({ fileUrl }).where(eq(packages.name, packageName)).returning();

    console.log(packageInfo);
});
