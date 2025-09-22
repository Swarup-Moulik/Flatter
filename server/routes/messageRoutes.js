import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { correctMessage, deleteRecieverMessage, getChatMessages, sendMessage, sseController, unsendChatMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.array('media', 10), protect, sendMessage);
messageRouter.post('/get', protect, getChatMessages);
messageRouter.post('/unsend', protect, unsendChatMessage);
messageRouter.post('/hide', protect, deleteRecieverMessage);
messageRouter.post('/correct', protect, correctMessage);

export default messageRouter;