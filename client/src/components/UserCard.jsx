import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { fetchUser } from '../features/user/userSlice';

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Check if the current user is following the user in the card
    const isFollowing = currentUser?.following.includes(user._id);
    const handleFollow = async () => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/follow', { id: user._id }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                dispatch(fetchUser(token));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    const handleConnectionRequest = async () => {
        if (currentUser.connections.includes(user._id)) {
            return navigate(`/messages/${user._id}`);
        }
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/connect', { id: user._id }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);             
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    const handleUnfollow = async (userId) => {
        try {
          const token = await getToken();
          const { data } = await api.post('/api/user/unfollow', { id: userId }, { headers: { Authorization: `Bearer ${token}` } });
          if (data.success) {
            toast.success(data.message);
            dispatch(fetchUser(token));
          } else {
            toast(data.message);
          }
        } catch (error) {
          toast.error(error.message);
        }
    };
    return (
        <div key={user._id} className='p-4 pt-6 flex flex-col justify-between w-72 shadow bg-background rounded-lg'>
            <div className='text-center'>
                <img src={user.profile_picture} className='rounded-full w-16 shadow-md mx-auto' alt="User Profile Picture" />
                <p className='mt-4 font-semibold'>{user.full_name}</p>
                {user.username && <p className='text-foreground/85 font-light'>@{user.username}</p>}
                {user.bio && <p className='text-foreground mt-2 text-center text-sm px-4'>{user.bio}</p>}
            </div>
            <div className='flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs'>
                <div className='flex items-center gap-1 border rounded-full px-3 py-1'>
                    <MapPin className='w-4 h-4' /> {user.location}
                </div>
                <div className='flex items-center gap-1 border rounded-full px-3 py-1'>
                    <span>{user.followers.length}</span> Followers
                </div>
            </div>
            <div className='flex mt-4 gap-2'>
                {/* Follow Button */}
                <button
                    className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 
                    to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'
                    onClick={isFollowing ? () => handleUnfollow(user._id) : handleFollow}
                >
                    {isFollowing ? (
                        <>
                            <UserPlus className='w-4 h-4' /> Unfollow
                        </>
                    ) : (
                        <>
                            <UserPlus className='w-4 h-4' /> Follow
                        </>
                    )}
                </button>
                {/* Connection Request Button / Message Button */}
                <button className='flex justify-center items-center w-16 text-slate-500 group rounded-md cursor-pointer transition
                active:scale-95 border border-border/70' onClick={handleConnectionRequest}>
                    {currentUser?.connections.includes(user._id) ?
                        <MessageCircle className='w-5 h-5 group-hover:scale-105 transition' />
                        :
                        <Plus className='w-5 h-5 group-hover:scale-105 transition' />
                    }
                </button>
            </div>
        </div>
    )
}

export default UserCard
