import { Router } from "express";
import { getPackage } from "@/controllers/package";

const router = Router();

router.post("/package", getPackage);

export default router;
