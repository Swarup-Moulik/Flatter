import { BadgeCheck, EllipsisVertical, Heart, MessageCircle, Share2, Trash } from 'lucide-react'
import moment from 'moment'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
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
    const { user } = useUser();
    const isMine = post.user._id === user.id;
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
    //Post Delete
    const handleDelete = async () => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/post/delete-post', { postId: post._id }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                navigate(0);
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
                        <div className='text-foreground/70 text-sm'>{moment(post.createdAt).fromNow()}</div>
                    </div>
                </div>
                {isMine && (
                    <div className="relative group text-primary/80" onMouseLeave={() => setVisible(false)}>
                        <EllipsisVertical
                            className="cursor-pointer -my-2 -mr-3 hover:text-primary/80 opacity-25 group-hover:opacity-100 
                        transition-all duration-300"
                            onClick={() => setVisible(!visible)}
                        />
                        {visible && (
                            <div className="absolute right-0 mt-2 w-32 bg-background shadow-lg rounded-lg p-2 text-foreground z-10">
                                <button className="flex items-center gap-2 hover:text-primary text-sm cursor-pointer" onClick={handleDelete}>
                                    <Trash className='w-5 h-5 text-red-600' /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Content */}
            {post.content && <div className='text-foreground text-sm whitespace-pre-line' dangerouslySetInnerHTML={{
                __html:
                    postWithHashtags
            }} />}
            {/* Media */}
            <div className={`grid ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                {post.media_urls.map((media, index) => {
                    const isVideo = media.match(/\.(mp4|webm|ogg)$/i);
                    return isVideo ? (
                        <video
                            key={index}
                            src={media}
                            controls
                            className={`w-full h-48 object-cover rounded-lg ${post.media_urls.length === 1 && 'col-span-2 h-auto'}`}
                        />
                    ) : (
                        <img
                            key={index}
                            src={media}
                            alt="Post Media"
                            className={`w-full h-48 object-cover rounded-lg ${post.media_urls.length === 1 && 'col-span-2 h-auto'}`}
                        />
                    );
                })}
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

export default PostCard;