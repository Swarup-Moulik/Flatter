import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.post('/get', protect, getChatMessages);


export default messageRouter;