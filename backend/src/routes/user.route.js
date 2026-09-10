import express from "express";
import { getUserById, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/update", protectRoute, updateProfile);
router.get("/:userId", protectRoute, getUserById);

export default router;
