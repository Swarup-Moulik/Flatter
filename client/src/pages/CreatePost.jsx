import { useState } from 'react'
import { X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async () => {  
    if (!media.length && !content) {
      toast.error('Please add at least one image or text');
      throw new Error("Empty post");
    }
    setLoading(true);

    // detect post type
    let postType = 'text'
    const hasImages = media.some(file => file.type.startsWith('image/'))
    const hasVideos = media.some(file => file.type.startsWith('video/'))
    if (hasImages && hasVideos && content) postType = 'text_with_video' // can refine if you want both
    else if (hasVideos && content) postType = 'text_with_video'
    else if (hasImages && content) postType = 'text_with_image'
    else if (hasVideos) postType = 'video'
    else if (hasImages) postType = 'image'
    else postType = 'text'

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);
      media.forEach(file => formData.append('media', file))
      const token = await getToken();
      const { data } = await api.post('/api/post/add', formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        navigate('/');
      } else {
        console.log(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    setLoading(false);
  }
  return (
    <div className='min-h-screen bg-gradient-to-b from-transition1 via-transition2 to-background'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-primary mb-2'>Create Post</h1>
          <p className='text-foreground'>Share your thoughts with the world.</p>
        </div>
        {/* Form */}
        <div className='max-w-xl bg-background p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
          {/* Header */}
          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <img src={user.profile_picture} className='w-12 h-12 rounded-full shadow' alt="User Profile Picture" />
              <div>
                <h2 className='font-semibold'>{user.full_name}</h2>
                <p className='text-sm text-foreground'>@{user.username}</p>
              </div>
            </div>
            <div className='text-primary/85 text-xs w-25 pt-2'>
              Upto 10 images and media
            </div>
          </div>

          {/* Text Area */}
          <textarea className='w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-foreground/70' placeholder="What's happening ?"
            onChange={(e) => setContent(e.target.value)} value={content} />
          {/* Images */}
          {media.length > 0 && <div className='flex flex-wrap gap-2 mt-4'>
            {media.map((file, index) => (
              <div key={index} className='relative group'>
                {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} className='h-20 rounded-md' alt="Post Media" />
                  ) : (
                    <video src={URL.createObjectURL(file)} className='h-20 rounded-md' controls />
                  )}
                  <div
                    className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'
                    onClick={() => setMedia(media.filter((_, i) => i !== index))}
                  >
                    <X className='w-6 h-6 text-white' />
                  </div>
              </div>
            ))}
          </div>}
          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-border'>
            <label htmlFor='media' className='flex items-center gap-2 text-sm text-foreground hover:text-primary/85 transition cursor-pointer'>
              <Image className='size-6' />
            </label>
            <input type="file" accept='image/*, video/*' hidden id="media" multiple onChange={(e) => {
              const files = Array.from(e.target.files);
              if (media.length + files.length > 10) {
                toast.error("You can upload a maximum of 10 images");
                return;
              }
              setMedia([...media, ...e.target.files])
            }} />
            <button className='text-sm futton active-95 transition  font-medium px-8 py-2 rounded-md' disabled={loading} 
            onClick={() => toast.promise(
              handleSubmit(), { loading: 'Uploading...', success: <p>Post Added</p>, error: <p>Post Not Added</p> }
            )} >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
