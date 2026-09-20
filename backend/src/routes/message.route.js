import express from 'express';
import {
  getConversation,
  sendMessage,
} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', protectRoute, sendMessage);
router.get('/conversation/:userId', protectRoute, getConversation);

export default router;
