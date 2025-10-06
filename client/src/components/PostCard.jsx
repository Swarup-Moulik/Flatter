import { BadgeCheck, EllipsisVertical, Heart, MessageCircle, Share2, Trash } from 'lucide-react'
import moment from 'moment'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import PostViewer from "./PostViewer";

const PostCard = ({ post }) => {
    const [likes, setLikes] = useState(post.likes_count);
    const [visible, setVisible] = useState(false);
    const [showPost, setShowPost] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const menuRef = useRef(null);
    const currentUser = useSelector((state) => state.user.value);
    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { user } = useUser();
    const isMine = post.user._id === user.id;
    const fetchComments = async (id) => {
        try {
            const { data } = await api.get(`/api/comments/${id}`);
            if (data.success) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleAddComment = async (e) => {
        e.preventDefault();
        console.log("Adding comment:", newComment);
        if (!newComment.trim()) return;
        
        try {
            const token = await getToken();
            const { data } = await api.post(
                `/api/comments/${post._id}`,
                {
                    text: newComment,
                    userFullName: user.fullName,         
                    userProfilePicture: user.imageUrl
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setComments((prev) => [data.comment, ...prev]);
                setNewComment("");
            }
        } catch (err) {
            toast.error("Failed to add comment");
        }
    };
    const handleLikeComment = async (commentId) => {
        try {
            const token = await getToken();
            const res = await api.put(`/api/comments/like/${commentId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === commentId
                            ? {
                                ...c,
                                likes: c.likes.includes(currentUser._id)
                                    ? c.likes.filter((id) => id !== currentUser._id)
                                    : [...c.likes, currentUser._id],
                            }
                            : c
                    )
                );
            }
        } catch (err) {
            toast.error("Failed to like comment");
        }
    };

    // 🆕 Fetch comments when toggled
    useEffect(() => {
        fetchComments(post._id);
    }, [post._id]);

    // Close menu when clicking outside
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
                setLikes((prev) =>
                    prev.includes(currentUser._id)
                        ? prev.filter((id) => id !== currentUser._id)
                        : [...prev, currentUser._id]
                );
            } else {
                toast(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

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
    };
    return (
        <div className='bg-background rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div className='flex justify-between '>
                <div
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                    className='inline-flex items-center gap-3 cursor-pointer'
                >
                    <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow' alt="User Profile" />
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
                            className="cursor-pointer -my-2 -mr-3 hover:text-primary/80 opacity-25 group-hover:opacity-100 transition-all duration-300"
                            onClick={() => setVisible(!visible)}
                        />
                        {visible && (
                            <div className="absolute right-0 mt-2 w-32 bg-background shadow-lg rounded-lg p-2 text-foreground z-10">
                                <button
                                    className="flex items-center gap-2 hover:text-primary text-sm cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    <Trash className='w-5 h-5 text-red-600' /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Content */}
            {post.content && (
                <div
                    className='text-foreground text-sm whitespace-pre-line'
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                />
            )}
            {/* Media (click to open viewer) */}
            <div className={`grid ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                {post.media_urls.map((media, index) => {
                    const isVideo = media.match(/\.(mp4|webm|ogg)$/i);
                    return isVideo ? (
                        <video
                            key={index}
                            src={media}
                            controls
                            className={`w-full h-48 object-cover rounded-lg ${post.media_urls.length === 1 && 'col-span-2 h-auto'}`}
                            onClick={() => { setShowPost(true); setCurrentIndex(index); }}
                        />
                    ) : (
                        <img
                            key={index}
                            src={media}
                            alt="Post Media"
                            className={`w-full h-48 object-cover rounded-lg ${post.media_urls.length === 1 && 'col-span-2 h-auto'}`}
                            onClick={() => { setShowPost(true); setCurrentIndex(index); }}
                        />
                    );
                })}
            </div>
            {/* Actions */}
            <div className='flex items-center gap-4 text-foreground/85 text-sm pt-2 border-t'>
                <div className='flex items-center gap-1'>
                    <Heart
                        className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
                        onClick={handleLike}
                    />
                    <span>{likes.length}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <MessageCircle className='w-4 h-4 cursor-pointer' onClick={() => { setShowComments((p) => !p); fetchComments(post._id); }} />
                    <span>{comments.length}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <Share2 className='w-4 h-4 cursor-pointer' />
                    <span>7</span>
                </div>
            </div>
            {/* Comment Section */}
            {showComments && (
                <div className="border-t pt-3 space-y-3">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {comments.length > 0 ? (
                            comments.map((c) => (
                                <div key={c._id} className="flex items-start gap-2">
                                    <img
                                        src={c.user?.profile_picture}
                                        alt=""
                                        className="w-7 h-7 rounded-full"
                                    />
                                    <div>
                                        <span className="text-sm font-medium">{c.user?.full_name}</span>{" "}
                                        <span className="text-sm text-foreground/70">{c.text}</span>
                                    </div>
                                    {/* Like button for each comment */}
                                    <div className="flex items-center gap-1 text-sm text-foreground/70">
                                        <Heart
                                            onClick={() => handleLikeComment(c._id)}
                                            className={`w-4 h-4 cursor-pointer ${c.likes?.includes(currentUser._id) ? "text-red-500 fill-red-500" : ""
                                                }`}
                                        />
                                        <span>{c.likes?.length || 0}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-foreground/60">No comments yet</p>
                        )}
                    </div>
                    {/* Add comment */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent border rounded-lg px-3 py-1 text-sm focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="text-primary text-sm font-medium hover:underline cursor-pointer"
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
            {/* Fullscreen Viewer */}
            {showPost && (
                <PostViewer
                    posts={post.media_urls}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    onClose={() => setShowPost(false)}
                    postId={post._id}
                />
            )}
        </div>
    )
}

export default PostCard;
