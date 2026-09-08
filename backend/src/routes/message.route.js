import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:matchId", getMessages);
router.post("/", sendMessage);

export default router;
