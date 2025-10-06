import express from "express";
import { protect } from '../middleware/auth.js';
import { addComment, getComments, likeComment } from "../controllers/commentController.js";

const commentRouter = express.Router();

commentRouter.post("/:postId", protect, addComment);
commentRouter.get("/:postId", protect, getComments);
commentRouter.put("/like/:commentId", protect, likeComment);

export default commentRouter;