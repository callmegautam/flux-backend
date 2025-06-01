import asyncHandler from "@/utils/asyncHandler";
import {
    fetchPackageData,
    isPackageExists,
    savePackageData,
} from "@/utils/package-utils";
import { Request, Response } from "express";

export const getPackage = asyncHandler(async (req: Request, res: Response) => {
    const packageName = req.params.name;

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

    const packageData = await fetchPackageData(packageName);
    if (!packageData) {
        return console.log(`Package ${packageName} not found on npm registry`);
    }

    const savedPackage = await savePackageData(packageData);

    if (!savedPackage) {
        return console.log(`Failed to save package data for ${packageName}`);
    }

    // TODO: add logic to upload tarball to S3 or any other storage service and update fileUrl
});
