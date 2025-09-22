import imagekit from "../configs/imagekit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/connection.js";
import Post from "../models/post.js";
import User from "../models/user.js";
import fs from 'fs';

//Get user data from userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            })
        }
        res.json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Update user data from userId
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        let { username, bio, location, full_name, languages } = req.body;
        let { native, fluent, learning } = req.body;
        const tempUser = await User.findById(userId);
        !username && (username = tempUser.username);
        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                //Username won't be changed if it already exists
                username = tempUser.username;
            }
        }
        const safeFullName = full_name?.trim() || [tempUser.first_name, tempUser.last_name]
            .map(name => name?.trim())
            .filter(Boolean)
            .join(" ") || tempUser.username;
        const updatedData = {
            username,
            bio,
            location,
            full_name: safeFullName
        }
        // 👇 Handle languages if provided
        if (native || fluent || learning) {
            try {
                updatedData.languages = {
                    native: native ? JSON.parse(native) : tempUser.languages.native,
                    fluent: fluent ? JSON.parse(fluent) : tempUser.languages.fluent,
                    learning: learning ? JSON.parse(learning) : tempUser.languages.learning
                };
            } catch (err) {              
                updatedData.languages = tempUser.languages; // fallback
            }
        }
        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];
        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '512' }
                ]
            })
            updatedData.profile_picture = url;
        }
        if (cover) {
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            })
            updatedData.cover_photo = url;
        }
        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        res.json({
            success: true,
            user,
            message: "Profile Updated Successfully"
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Find users using email, username, location and name
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { input, filter } = req.body;
        const query = {};
        // text search
        if (input && input.trim()) {
            query.$or = [
                { username: new RegExp(input, "i") },
                { full_name: new RegExp(input, "i") },
                { bio: new RegExp(input, "i") },
                { location: new RegExp(input, "i") },
            ];
        }
        // language filter
        if (filter && filter.languages?.length > 0) {
            if (filter.type === "native") {
                query["languages.native"] = { $in: filter.languages };
            } else if (filter.type === "fluent") {
                query["languages.fluent"] = { $in: filter.languages };
            }
        }
        const allUsers = await User.find(query);
        const filteredUsers = allUsers.filter(user => user._id !== userId);
        res.json({
            success: true,
            users: filteredUsers
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Follow user
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        if (user.following.includes(id)) {
            return res.json({
                success: false,
                message: 'You are already following this user.'
            })
        }
        user.following.push(id);
        await user.save();
        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();
        res.json({
            success: true,
            message: 'Now you are following this user.'
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        user.following = user.following.filter(user => user !== id);
        await user.save();
        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId);
        await toUser.save();
        res.json({
            success: true,
            message: 'Now you are not following this user.'
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;
        //Check if the user has sent more than 24 connections request in the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({ from_user_id: userId, createdAt: { $gt: last24Hours } });
        if (connectionRequests >= 20) {
            return res.json({
                success: false,
                message: 'You have sent more than 20 connection request in the last 24 hours.'
            })
        }
        //Check if users are already connected
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId },
            ]
        })
        if (!connection) {
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })
            await inngest.send({
                name: 'app/connection-request',
                data: { connectionId: newConnection._id }
            })
            return res.json({
                success: true,
                message: 'Connection Request Sent Successfully.'
            })
        } else if (connection && connection.status === 'accepted') {
            return res.json({
                success: false,
                message: 'You are already connected.'
            })
        }
        return res.json({
            success: false,
            message: 'Connection Request Pending'
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Get User Connections
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();

        const user = await User.findById(userId).populate('connections followers following');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        const connections = user.connections;
        const following = user.following;
        const followers = user.followers;
        const incomingPending = await Connection.find({
            to_user_id: userId,
            status: 'pending'
        }).populate('from_user_id');

        const outgoingPending = await Connection.find({
            from_user_id: userId,
            status: 'pending'
        }).populate('to_user_id');
        const pendingConnections = {
            incoming: incomingPending.map(c => c.from_user_id),
            outgoing: outgoingPending.map(c => c.to_user_id)
        };
        res.json({
            success: true,
            connections,
            followers,
            following,
            pendingConnections
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId });
        if (!connection) {
            res.json({
                success: false,
                message: 'Connection Not Found.'
            })
        }
        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();
        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();
        connection.status = 'accepted';
        await connection.save();
        res.json({
            success: true,
            message: 'Connection Accepted Successfully.'
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Cancel Accept Request
export const cancelRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body; // id = other user's id

        // Find the pending connection (either sent or received)
        const connection = await Connection.findOneAndDelete({
            $or: [
                { from_user_id: userId, to_user_id: id, status: 'pending' },  // you sent
                { from_user_id: id, to_user_id: userId, status: 'pending' }   // you received
            ]
        });
        if (!connection) {
            return res.json({
                success: false,
                message: 'No pending connection found.'
            });
        }
        res.json({
            success: true,
            message: 'Connection request cancelled successfully.'
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

//Get User Profiles
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId);
        if (!profile) {
            return res.json({
                success: false,
                message: 'Profile Not Found.'
            })
        }
        const posts = await Post.find({ user: profileId }).populate('user');
        res.json({
            success: true,
            profile,
            posts
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        })
    }
}

//Remove Connection
export const removeConnection = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body; // id = other user's id

        // Check if there’s an accepted connection between these two
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id, status: 'accepted' },
                { from_user_id: id, to_user_id: userId, status: 'accepted' }
            ]
        });

        if (!connection) {
            return res.json({
                success: false,
                message: 'No active connection found.'
            });
        }

        // Remove each other from "connections" array
        await User.findByIdAndUpdate(userId, { $pull: { connections: id } });
        await User.findByIdAndUpdate(id, { $pull: { connections: userId } });

        // Delete the connection document
        await Connection.findByIdAndDelete(connection._id);

        res.json({
            success: true,
            message: 'Connection removed successfully.'
        });
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};
