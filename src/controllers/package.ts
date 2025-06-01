import asyncHandler from "@/utils/asyncHandler";
import { downloadPackageTarball, fetchPackageData, isPackageExists, savePackageData } from "@/utils/package-utils";
import { Request, Response } from "express";

// TODO : ADD LOGIC OF VERSION HANDLING
export const getPackage = asyncHandler(async (req: Request, res: Response) => {
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

    res.status(404).json({
        success: false,
        message: "Package not found",
        data: null,
    });

    // TODO: add logic to upload tarball to S3 or any other storage service and update fileUrl

    const filePath = await downloadPackageTarball(packageName);
    if (!filePath) {
        console.log(`Failed to download package tarball for ${packageName}`);
    }

    const packageData = await fetchPackageData(packageName);
    if (!packageData) {
        return console.log(`Package ${packageName} not found on npm registry`);
    }

    const savedPackage = await savePackageData(packageData);

    if (!savedPackage) {
        return console.log(`Failed to save package data for ${packageName}`);
    }
});
