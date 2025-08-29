import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from_user_id: {type: String, ref: 'User', required: true},
    to_user_id: {type: String, ref: 'User', required: true},
    text: {type: String, trim: true},
    message_type: [{type: String, enum:['text', 'image', 'video']}],
    media_url: [{type: String}],
    seen: {type: Boolean, default: false},
    deleted_for: [{ type: String, ref: 'User' }],
    status: { type: String, enum: ['sending', 'sent'], default: 'sending' }
}, {timestamps: true, minimize: false})

const Message = mongoose.model('Message', messageSchema);

export default Message;