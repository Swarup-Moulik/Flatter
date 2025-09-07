import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Message from '../models/message.js';
import User from '../models/user.js';

//Create an empty object to store server side event connections.
const connections = {};

//Controller function for server side event endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New Client connected :- ', userId);

    //Set server side event headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //Add the client's response object to the connections object
    connections[userId] = res;

    //Send an initial event to the client
    res.write(`log: Connected to SSE stream\n\n`);

    //Handle Client Disconnection
    req.on('close', () => {
        //Remove the client's response object from the connections array
        delete connections[userId];
        console.log('Client disconnected');
    })
}

//Send Message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const files = req.files;
        let message_type = [];
        let media_url = [];

        // Include text type if text exists
        if (text) message_type.push('text');

        // Process media files
        if (files?.length) {
            for (const file of files) {
                const fileBuffer = fs.readFileSync(file.path);
                const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: file.originalname,
                    folder: "posts",
                });

                if (file.mimetype.startsWith("image/")) {
                    media_url.push(imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: "auto" },
                            { format: "webp" },
                            { width: "1280" },
                        ],
                    }));
                    message_type.push('image');
                } else if (file.mimetype.startsWith("video/")) {
                    media_url.push(response.url);
                    message_type.push('video');
                }
            }
        }

        // Create the final message
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
            status: 'sent'
        });

        res.json({
            success: true,
            message,
        });

        const messageWithUserData = await Message.findById(message._id).populate('from_user_id');
        if(connections[to_user_id]){
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
        }

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

//Get chat messages
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ],
            deleted_for: { $ne: userId }
        }).sort({ createdAt: -1 })
        //Mark messages as seen
        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });
        res.json({
            success: true,
            messages
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Recent Messages
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();

        // ✅ fetch current user with connections
        const currentUser = await User.findById(userId).select("connections");

        // ✅ fetch messages sent to this user
        const messages = await Message.find({ to_user_id: userId })
            .populate("from_user_id to_user_id")
            .sort({ createdAt: -1 });

        // ✅ filter only messages from connected users
        const filteredMessages = messages.filter((msg) =>
            currentUser.connections.includes(
                msg.from_user_id._id.toString() === userId
                    ? msg.to_user_id._id.toString()
                    : msg.from_user_id._id.toString()
            )
        );

        res.json({
            success: true,
            messages: filteredMessages, // return filtered
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message,
        });
    }
};

// Unsend Messages
export const unsendChatMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        const messages = await Message.findByIdAndDelete(messageId);
        res.json({
            success: true,
            message: 'Message unsent'
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Delete for reciever
export const deleteRecieverMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { messageId } = req.body;
        const message = await Message.findById(messageId);
        if (!message) return res.json({ success: false, message: "Message not found" });
        if (!message.deleted_for.includes(userId)) {
            message.deleted_for.push(userId);
            await message.save();
        }
        res.json({ success: true, message: "Message deleted for you" });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};
