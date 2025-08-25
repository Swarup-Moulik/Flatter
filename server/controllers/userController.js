import imagekit from "../configs/imagekit.js";
import Connection from "../models/connection.js";
import User from "../models/user.js";
import fs from 'fs';

//Get user data from userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            res.json({
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
        let { username, bio, location, full_name } = req.body;
        const tempUser = await User.findById(userId);
        !username && (username = tempUser.username);
        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                //Username won't be changed if it already exists
                username = tempUser.username;
            }
        }
        const updatedData = {
            username,
            bio,
            location,
            full_name
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
        const { input } = req.body;
        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
            ]
        })
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
        toUser.following = toUser.followers.filter(user => user !== userId);
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
            await Connection.create({
                from_user_id: userId,
                to_user_id: id
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
        const connections = user.connections;
        const following = user.following;
        const followers = user.followers;
        const pendingConnections = (await Connection.find({ to_user_id: userId, status: 'pending' }).populate('from_user_id')).map(
            connection => connection.from_user_id);
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