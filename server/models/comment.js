import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  user: { type: String, ref: "User", required: true },
  text: { type: String, required: true },
  parentId: { type: String, ref: "Comment", default: null },
  likes: [{ type: String, ref: "User" }], 
  userFullName: { type: String },
  userProfilePicture: { type: String },
}, { timestamps: true });

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default Comment;