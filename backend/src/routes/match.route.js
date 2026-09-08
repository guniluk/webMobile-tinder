import express from "express";
import {
  getMatches,
  createMatch,
  deleteMatch,
} from "../controllers/match.controller.js";

const router = express.Router();

router.get("/:userId", getMatches);
router.post("/", createMatch);
router.delete("/:matchId", deleteMatch);

export default router;
