import { BadgeCheck, Delete, EllipsisVertical, Heart, MessageCircle, Share2, Trash } from 'lucide-react'
import moment from 'moment'
import React, { useState, useRef, useEffect } from 'react'
import { dummyUserData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
    const [likes, setLikes] = useState(post.likes_count);
    const [visible, setVisible] = useState(false);
    const menuRef = useRef(null);
    const currentUser = useSelector((state) => state.user.value);
    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');
    const navigate = useNavigate();
    const { getToken } = useAuth();
    // Close menu when clicking outside (for touch/mobile)
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);
    const handleLike = async () => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/post/like', { postId: post._id }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                setLikes((prev) => {
                    if (prev.includes(currentUser._id)) {
                        return prev.filter((id) => id !== currentUser._id);
                    } else {
                        return [...prev, currentUser._id];
                    }
                })
            } else {
                toast(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    return (
        <div className='bg-background rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div className='flex justify-between '>
                <div onClick={() => navigate(`/profile/${post.user._id}`)} className='inline-flex items-center gap-3 cursor-pointer'>
                    <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow' alt="User Profile Picture" />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span>{post.user.full_name}</span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='text-foreground/70 text-sm'>@{post.user.username} . {moment(post.createdAt).fromNow()}</div>
                    </div>
                </div>
                <div className="relative group text-primary/80" onMouseLeave={() => setVisible(false)}>
                    <EllipsisVertical
                        className="cursor-pointer -my-2 -mr-3 hover:text-primary/80 opacity-0 group-hover:opacity-100 
                        transition-all duration-300"
                        onClick={() => setVisible(!visible)}
                    />
                    {visible && (
                        <div className="absolute right-0 mt-2 w-32 bg-background shadow-lg rounded-lg p-2 text-foreground z-10">
                            <button className="flex items-center gap-2 hover:text-primary text-sm">
                                <Trash className='w-5 h-5 text-red-600' /> Unsend
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Content */}
            {post.content && <div className='text-foreground text-sm whitespace-pre-line' dangerouslySetInnerHTML={{
                __html:
                    postWithHashtags
            }} />}
            {/* Images */}
            <div className='grid grid-cols-2 gap-2'>
                {post.image_urls.map((image, index) => (
                    <img src={image} key={index} alt="Post Image" className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 &&
                        'col-span-2 h-auto'}`} />
                ))}
            </div>
            {/* Actions */}
            <div className='flex items-center gap-4 text-foreground/85 text-sm pt-2 border-t'>
                <div className='flex items-center gap-1'>
                    <Heart className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
                        onClick={handleLike} />
                    <span>{likes.length}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <MessageCircle className='w-4 h-4 cursor-pointer' />
                    <span>12</span>
                </div>
                <div className='flex items-center gap-1'>
                    <Share2 className='w-4 h-4 cursor-pointer' />
                    <span>7</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard
