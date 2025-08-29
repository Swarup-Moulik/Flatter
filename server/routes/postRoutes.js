import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { addPost, deletePost, getFeedPosts, likePosts } from '../controllers/postController.js';

const postRouter = express.Router();

postRouter.post('/add', upload.array('media', 10), protect, addPost);
postRouter.get('/feed', protect, getFeedPosts);
postRouter.post('/like', protect, likePosts);
postRouter.post('/delete-post', protect, deletePost);

export default postRouter;