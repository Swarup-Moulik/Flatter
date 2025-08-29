import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    user: {type: String, ref: 'User', required: true},
    content: {type: String},
    media_urls: [{type: String}],
    post_type: {type: String, enum: ['text', 'image', 'text_with_image', 'video', 'text_with_video'], require: true},
    likes_count: [{type: String, ref: 'User'}],
}, {timestamps: true, minimize: false})

const Post = mongoose.model('Post', PostSchema);

export default Post;