import express from "express";
import {
  getMatches,
  swipeRight,
  swipeLeft,
  getUserProfiles,
} from "../controllers/match.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/swipe-right/:likedUserId", protectRoute, swipeRight);
router.post("/swipe-left/:dislikedUserId", protectRoute, swipeLeft);
router.get("/", protectRoute, getMatches);
router.get("/user-profiles", protectRoute, getUserProfiles);

export default router;
