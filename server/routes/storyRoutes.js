import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { addUserStory, getStories } from '../controllers/storyController.js';

const storyRouter = express.Router();

storyRouter.post('/create', upload.array('media', 10), protect, addUserStory);
storyRouter.get('/get', protect, getStories);

export default storyRouter;