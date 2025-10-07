import Comment from "../models/comment.js";

export const addComment = async (req, res) => {
    try {
        const { text, parentId, userFullName, userProfilePicture } = req.body;
        const { postId } = req.params;
        console.log("Req.body:", req.body);

        let comment = await Comment.create({
            postId,
            user: req.userId,
            text,
            parentId: parentId || null,
            userFullName,
            userProfilePicture
        });       
        res.status(201).json({
            success: true,
            comment
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
        res.json({ success: true, comments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const userIdStr = userId.toString();
        const isLiked = comment.likes.some(id => id.toString() === userIdStr);

        if (isLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json({ success: true, message: isLiked ? "Comment unliked" : "Comment liked", comment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}