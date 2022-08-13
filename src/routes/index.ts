import { Router } from "express";
import userRoutes from "./userRoutes";
import creditRoutes from "./creditRoutes";
import debitRoutes from "./debitRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/credits", creditRoutes);
router.use("/debits", debitRoutes);

export default router;
