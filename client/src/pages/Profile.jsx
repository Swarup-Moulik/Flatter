import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import moment from 'moment';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [showEdit, setShowEdit] = useState(false);
  const { getToken } = useAuth();
  const currentUser = useSelector((state)=>state.user.value);
  const fetchUser = async (profileId) => {
    const token = await getToken();
    try {
      const { data } = await api.post('/api/user/profiles', {profileId}, {headers: {Authorization: `Bearer ${token}`}});
      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }    
  }
  useEffect(() => {
    if (profileId) {
      fetchUser(profileId);
    } else {
      fetchUser(currentUser._id);
    }
  }, [profileId, currentUser])
  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gradient-to-b from-transition1 to-background p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-background rounded-2xl shadow overflow-hidden'>
          {/* Cover Photo */}
          <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src={user.cover_photo} className='w-full h-full object-cover' alt="Cover Photo" />}
          </div>
          {/* User Info */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>
        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-background rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {['Posts', 'Media', 'Likes'].map((tab) => (
              <button key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
              ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-foreground hover:text-primary'}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          {/* Posts */}
          {activeTab === 'Posts' && (
            <div className='mt-6 flex flex-col items-center gap-6'>
              {posts.map((post)=>(
                <PostCard key={post._id} post={post}/>
              ))}
            </div>
          )}
          {/* Media */}
          {activeTab === 'Media' && (
            <div className='flex flex-wrap mt-6 max-w-6xl'>
              {posts.filter((post)=>post.image_urls.length > 0).map((post)=>(
                <>
                  {post.image_urls.map((image, index)=>(
                    <Link target='_blank' to={image} key={image} className='relative group'>
                      <img src={image} key={index} className='w-64 aspect-video object-cover' alt="Post Pics"/>
                      <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-background opacity-0 transition
                      duration-300 group-hover:opacity-100'>Posted {moment(post.createdAt).fromNow()}</p>
                    </Link>
                  ))}
                </>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit}/>}
    </div>
  ) : (
    <Loading />
  )
}

export default Profile
