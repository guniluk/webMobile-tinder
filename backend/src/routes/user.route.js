import express from "express";
import { getUserById, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/:userId", getUserById);
router.put("/:userId", updateUser);

export default router;
