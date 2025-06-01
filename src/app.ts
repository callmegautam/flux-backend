import express from "express";
import { Request, Response } from "express";
// import { clerkClient, clerkMiddleware } from '@clerk/express';
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./config/env";
import morgan from "morgan";
import globalErrorHandler from "./middlewares/error-handler.middleware";
import { fetchPackageData } from "./utils/package-utils";

const app = express();

const isProduction = env.NODE_ENV === "PRODUCTION";

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ? Clerk
// app.use(clerkMiddleware());

app.get("/", async (_: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Flux Backend API",
        data: null,
    });
});

// Temporary route for testing
// app.get("/test", async (_: Request, res: Response) => {
//     const response = await fetchPackageData("atarhi");

//     if (!response) {
//         console.log("Failed to fetch package data");
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch package data",
//             data: null,
//         });
//     }

//     console.log(response);
//     console.log("Package data fetched successfully:");

//     return res.status(200).json({
//         success: true,
//         message: "Test Route",
//         data: null,
//     });
// });

app.use("*", (_: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        message: "API Not Found",
        data: null,
    });
});

app.use(globalErrorHandler);

export { app };
