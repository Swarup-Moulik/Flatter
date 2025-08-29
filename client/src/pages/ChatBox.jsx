import React, { useRef, useState, useEffect } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { Image, SendHorizontal, EllipsisVertical, Trash, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const connections = useSelector((state) => state.connections.connections);
  const [visible, setVisible] = useState(null);
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  }
  const sendMessage = async () => {
    try {
      if (!text && media.length === 0) return;
      const token = await getToken();
      const formData = new FormData();
      formData.append('to_user_id', userId);
      formData.append('text', text);
      media.forEach((file) => formData.append('media', file));
      let toastId = null;
      // Only show toast if there are media files
      if (media.length > 0) {
        toastId = toast.loading('Sending media...');
      }
      const { data } = await api.post('/api/message/send', formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setText('');
        setMedia([]);
        dispatch(addMessage(data.message));
        // Update toast to success
        if (toastId) {
          toast.success('Media sent!', { id: toastId });
          toastId = null;
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  const unsendMessage = async (id) => {
    try {
      const token = await getToken();
      const { data } = await api.post('/api/message/unsend', { messageId: id }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchMessages({ token, userId }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  const deleteReceiverMessage = async (id) => {
    try {
      const token = await getToken();
      const { data } = await api.post('/api/message/hide', { messageId: id }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchMessages({ token, userId }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
  }, [messages])
  useEffect(() => {
    fetchUserMessages();
    return () => {
      dispatch(resetMessages())
    }
  }, [userId])
  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId);
      setUser(user);
    }
  }, [connections, userId])
  // Close menu when clicking outside (for touch/mobile)
  useEffect(() => {
    function handleClickOutside(e) {
      // close if clicking anywhere outside
      if (!e.target.closest(".message-menu")) {
        setVisible(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  // Handle file selection
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (media.length + files.length > 10) {
      toast.error("You can only send up to 10 media files at once.");
      return;
    }
    setMedia((prev) => [...prev, ...files]);
  };
  return user && (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-transition1 to-background border-b 
      border-border/70'>
        <img src={user.profile_picture} alt="User Profile Picture" className='size-8 rounded-full' />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-foreground -mt-1.5'>@{user.username}</p>
        </div>
      </div>
      <div className='p-5 md:px-10 h-full overflow-y-scroll bg-gradient-to-b from-transition1 to-background'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => (
            <div key={index} className={`flex flex-col ${message.to_user_id !== user._id ? 'items-start' : 'items-end'}`}>
              <div className={`flex gap-0.5 ${message.to_user_id !== user._id ? 'flex-row-reverse' : ''}`}>
                <div className="relative group text-primary/80 message-menu" onMouseLeave={() => setVisible(null)}>
                  <EllipsisVertical
                    className={`cursor-pointer hover:text-primary/80 opacity-25 group-hover:opacity-100 absolute top-2
                  ${message.to_user_id !== user._id ? 'left-0' : 'right-0'} transition-all duration-300`}
                    onClick={() => setVisible(visible === message._id ? null : message._id)}
                  />
                  {visible === message._id && (
                    <div className={`absolute top-0 bg-background shadow-lg rounded-lg p-2 text-foreground z-10 mx-6 -mt-2 w-37
                       ${message.to_user_id !== user._id ? 'left-0' : 'right-0'}`}>
                      <button className="flex items-center gap-2 hover:text-primary text-sm">
                        {message.to_user_id === user._id ? (
                          <div onClick={() => unsendMessage(message._id)} className='flex gap-1 cursor-pointer'>
                            <Trash className='w-5 h-5 text-red-600' /> Unsend
                          </div>

                        ) : (
                          <div onClick={() => deleteReceiverMessage(message._id)} className='flex gap-1 cursor-pointer'>
                            <Trash className='w-5 h-5 text-red-600' /> Delete from me
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className={`p-2 text-sm max-w-sm bg-background text-foreground rounded-lg shadow 
                  ${message.to_user_id !== user._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                  {message.media_url?.length > 0 &&
                    message.media_url.map((url, i) => {
                      // pick only the non-text types, aligned with media_url
                      const type = message.message_type.filter(t => t !== 'text')[i];
                      if (type === 'image') {
                        return (
                          <img
                            key={i}
                            src={url}
                            className="w-full max-w-sm rounded-lg mb-1"
                            alt="Message media"
                          />
                        );
                      }
                      if (type === 'video') {
                        return (
                          <video
                            key={i}
                            src={url}
                            controls
                            className="w-full max-w-sm rounded-lg mb-1"
                          />
                        );
                      }
                      return null;
                    })}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Media Preview */}
      {media.length > 0 && (
        <div className="flex gap-2 px-4 pt-2 overflow-x-auto bg-background h-35 justify-center">
          {media.map((file, index) => (
            <div key={index} className="relative group/profile">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ) : null}
              <button
                type="button"
                className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center"
                onClick={() => setMedia(media.filter((_, i) => i !== index))}
              >
                <X className='w-5 h-5 text-white cursor-pointer' />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Input Bar */}
      <div className="px-4 pt-2 bg-background z-100">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-background w-full max-w-xl mx-auto border border-border/70 shadow mb-5 rounded-full">
          <input
            type="text"
            className="flex-1 outline-none text-foreground"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <label htmlFor="mediaInput">
            <Image className="size-7 text-foreground/85 cursor-pointer" />
            <input
              type="file"
              id="mediaInput"
              accept="image/*,video/*"
              hidden
              multiple
              onChange={handleMediaChange}
            />
          </label>
          <button
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 p-2 active:scale-95 cursor-pointer text-white rounded-full"
            onClick={sendMessage}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
