import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import moment from 'moment';
import StoryModal from './StoryModal';
import StoryViewer from './StoryViewer';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewStoryGroup, setViewStoryGroup] = useState(null); // <-- group state
    const { getToken } = useAuth();
    const fetchStories = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/story/get', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) setStories(data.stories);
            else toast(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };
    useEffect(() => {
        fetchStories();
    }, []);
    return (
        <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
            <div className="flex gap-4 pb-5">
                {/* Add a Story Card */}
                <div
                    onClick={() => setShowModal(true)}
                    className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg 
                    transition-all duration-200 border-2 border-dashed border-rose-700 bg-background"
                >
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="size-10 bg-orange-700 rounded-full flex items-center justify-center mb-3">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-foreground text-center">Create Story</p>
                    </div>
                </div>

                {/* Story Cards */}
                {stories.map((storyGroup, index) => {
                    const firstStory = storyGroup.stories[0]; // preview only first story

                    return (
                        <div
                            key={index}
                            onClick={() => setViewStoryGroup(storyGroup)} // <-- open group
                            className="relative rounded-lg shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
                        >
                            {/* Profile picture overlay */}
                            <img
                                src={storyGroup.user.profile_picture}
                                alt="Profile Picture"
                                className="absolute w-8 h-8 top-3 left-3 z-10 ring ring-gray-100 rounded-full shadow"
                            />
                            <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
                                {moment(firstStory.createdAt).fromNow()}
                            </p>

                            {/* Preview depending on media type */}
                            <div className="absolute inset-0 z-1 rounded-lg overflow-hidden">
                                {firstStory.media_type === 'text' ? (
                                    <div
                                        className="h-full w-full flex justify-center items-center p-2 text-white font-semibold text-center text-xs"
                                        style={{ backgroundColor: firstStory.background_color }}
                                    >
                                        {firstStory.content?.slice(0, 20)}...
                                    </div>
                                ) : firstStory.media_type === 'image' ? (
                                    <img
                                        src={firstStory.media_url}
                                        className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                                        alt="Story"
                                    />
                                ) : (
                                    <video
                                        src={firstStory.media_url}
                                        className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}


                {/* Add Story Modal */}
                {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />}

                {/* View Story Modal */}
                {viewStoryGroup && (
                    <StoryViewer viewStoryGroup={viewStoryGroup} setViewStoryGroup={setViewStoryGroup} />
                )}
            </div>
        </div>
    )
}
export default StoriesBar;
