import { Request, Response } from "express";
import db from "@/db";
import { packages, versions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    uploadPackageTarballToS3,
    fetchPackageData,
    isPackageExists,
    savePackageData,
    asyncHandler,
} from "@/utils/index";

// TODO : ADD LOGIC OF VERSION HANDLING
export const getPackage = asyncHandler(async (req: Request, res: Response) => {
    const { packageName, version } = req.body;

    if (!packageName || !version) {
        return res.status(400).json({ success: false, message: "Package name and version are required", data: null });
    }

    const packageExists = await isPackageExists(packageName, version);

    // console.log(`data: ${packageExists}`);

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

    res.status(200).json({
        success: true,
        message: "Package data fetched successfully",
        data: packageData.versions[version].dist.tarball,
    });

    const fileUrl = await uploadPackageTarballToS3(packageName, version);

    if (!fileUrl) {
        return console.log(`Failed to upload package tarball for ${packageName}`);
    }

    await savePackageData(packageData);

    const packageDataFromDb = await db.select().from(packages).where(eq(packages.name, packageName)).limit(1);

    await db.insert(versions).values({ packageId: packageDataFromDb[0].id, version: version, fileUrl }).returning();

    console.log(`Package ${packageName} data saved successfully with file URL: ${fileUrl}`);
});
