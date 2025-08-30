import express from 'express';
import { acceptConnectionRequest, cancelRequest, discoverUsers, followUser, getUserConnections, getUserData, getUserProfiles, 
    removeConnection, 
    sendConnectionRequest, unfollowUser, updateUserData } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { getUserRecentMessages } from '../controllers/messageController.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', upload.fields([{name: 'profile', maxCount: 1}, {name: 'cover', maxCount: 1}]), protect, updateUserData);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.post('/cancel-request', protect, cancelRequest);
userRouter.get('/connections', protect, getUserConnections);
userRouter.post('/profiles', protect, getUserProfiles);
userRouter.get('/recent-messages', protect, getUserRecentMessages);
userRouter.post('/remove-connection', protect, removeConnection);

export default userRouter;