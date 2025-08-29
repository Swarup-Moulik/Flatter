import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Sparkle, TextIcon, Upload, X } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import api from '../api/axios';

const StoryModal = ({ setShowModal, fetchStories }) => {
    const bgColors = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ca8a04', '#0d9488'];
    const [mode, setMode] = useState('text');
    const [background, setBackground] = useState(bgColors[0]);
    const [text, setText] = useState('');
    const [media, setMedia] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const { getToken } = useAuth();
    const MAX_VIDEO_DURATION = 60; //seconds
    const MAX_VIDEO_SIZE = 50; //MB
    const handleMediaUpload = (e) => {
        const files = Array.from(e.target.files || []);
        let validFiles = [];
        let previews = [];
        if (media.length + files.length > 10) {
            toast.error("You can upload a maximum of 10 images/videos");
            return;
        }
        files.forEach((file) => {
            if (file.type.startsWith("video")) {
                if (file.size > MAX_VIDEO_SIZE * 1024 * 1024) {
                    toast.error(`${file.name} exceeds 50MB`);
                    return;
                }
                const video = document.createElement("video");
                video.preload = "metadata";
                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src);
                    if (video.duration > MAX_VIDEO_DURATION) {
                        toast.error(`${file.name} longer than 60s`);
                    } else {
                        validFiles.push(file);
                        previews.push(URL.createObjectURL(file));
                        setMode("media");
                        // ✅ append once loaded
                        setMedia((prev) => [...prev, file]);
                        setPreviewUrls((prev) => [...prev, URL.createObjectURL(file)]);
                    }
                };
                video.src = URL.createObjectURL(file);
            } else if (file.type.startsWith("image")) {
                validFiles.push(file);
                previews.push(URL.createObjectURL(file));
                setMode("media");
            }
        });
        // ✅ append non-video files in one go
        if (validFiles.length > 0) {
            setMedia((prev) => [...prev, ...validFiles]);
            setPreviewUrls((prev) => [...prev, ...previews]);
        }
        setText("");
    };
    const handleCreateStory = async () => {
        if (mode === 'text' && !text.trim()) {
            throw new Error("Please enter some text");
        }
        let formData = new FormData();
        formData.append('content', text);
        media.forEach((file) => {
            formData.append("media", file);
        });
        formData.append('background_color', background);
        const token = await getToken();
        try {
            const { data } = await api.post('/api/story/create', formData, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setShowModal(false);
                toast.success('Story Created Successfully');
                fetchStories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    return (
        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Create Story</h2>
                    <span className='w-10'></span>
                </div>
                <div className='rounded-lg h-96 flex items-center justify-center relative'
                    style={{ backgroundColor: mode === "text" ? background : "transparent" }}>
                    {mode === 'text' && (
                        <textarea className='bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none'
                            placeholder="What's on your mind ?" onChange={(e) => setText(e.target.value)} value={text} />
                    )}
                    {mode === 'media' && previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 max-h-full overflow-y-auto p-2 no-scrollbar">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="relative group">
                                    {media[i].type.startsWith('image') ? (
                                        <img
                                            src={url}
                                            className="object-contain h-40 rounded"
                                            alt="preview"
                                        />
                                    ) : (
                                        <video
                                            src={url}
                                            className="object-contain h-40 rounded"
                                            controls
                                        />
                                    )}

                                    {/* X button appears on hover */}
                                    <button
                                        onClick={() => {
                                            const newMedia = [...media];
                                            const newPreviews = [...previewUrls];
                                            newMedia.splice(i, 1);
                                            newPreviews.splice(i, 1);
                                            setMedia(newMedia);
                                            setPreviewUrls(newPreviews);
                                        }}
                                        className='absolute hidden group-hover:flex top-0 left-0 right-0 bottom-0 bg-black/20
                                            rounded-lg items-center justify-center transition-all duration-300'
                                    >
                                        <X className='w-5 h-5 text-white cursor-pointer' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className='flex mt-4 gap-2'>
                    {bgColors.map((color) => (
                        <button key={color} className='w-6 h-6 rounded-full ring cursor-pointer' style={{ backgroundColor: color }}
                            onClick={() => setBackground(color)} />
                    ))}
                </div>
                <div className='flex gap-2 mt-4'>
                    <button onClick={() => { setMode('text'); setMedia([]); setPreviewUrls([]) }} className={`flex-1 flex items-center 
                    justify-center gap-2 p-2 rounded ${mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'} cursor-pointer`}>
                        <TextIcon size={18} /> Text
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'media' ?
                        'bg-white text-black' : 'bg-zinc-800'} cursor-pointer`}>
                        <input type="file" accept='image/*, video/*' multiple className='hidden' onChange={handleMediaUpload} />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>
                <button onClick={() => toast.promise(handleCreateStory(), { loading: 'Saving...' })} className='flex items-center 
                justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r active:scale-95 transition cursor-pointer
                from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'>
                    <Sparkle size={18} /> Create Story
                </button>
            </div>
        </div>
    )
}

export default StoryModal
