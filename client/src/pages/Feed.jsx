import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get('/api/post/feed', {headers: {Authorization: `Bearer ${token}`}});
      if (data.success) {
        setFeeds(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }
  useEffect(()=>{
    fetchFeeds();
  }, [])
  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8 
    bg-gradient-to-b from-transition1 to-background'>
      {/* Stories and Post List */}
      <div>
        <StoriesBar />
        <div className='p-4 space-y-6'>
          {feeds.map((post)=>(
            <PostCard key={post._id} post={post}/>
          ))}
        </div>
      </div>
      {/* Right Side Bar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-background text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-primary font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="Sponsored Image"/>
          <p className='text-foreground'>Email Marketing</p>
          <p className='text-foreground/75'>Place for advertisement.</p>
        </div>
        <h1>
          <RecentMessages />
        </h1>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed
