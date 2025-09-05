import { BadgeCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const StoryViewer = ({ viewStoryGroup, setViewStoryGroup }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const story = viewStoryGroup?.stories[index];

  useEffect(() => {
    if (!story) return;

    let timer, progressInterval;

    if (story.media_type !== 'video') {
      setProgress(0);
      const duration = 10000; // 10s per story
      const stepTime = 100;
      let elapsed = 0;
      progressInterval = setInterval(() => {
        elapsed += stepTime;
        setProgress((elapsed / duration) * 100);
      }, stepTime);

      timer = setTimeout(() => {
        if (index < viewStoryGroup.stories.length - 1) {
          setIndex(index + 1);
        } else {
          setViewStoryGroup(null);
        }
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [story, index, viewStoryGroup, setViewStoryGroup]);

  if (!story) return null;

  const handleClose = () => setViewStoryGroup(null);

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (index < viewStoryGroup.stories.length - 1) {
      setIndex(index + 1);
      setProgress(0);
    } else {
      setViewStoryGroup(null); // exit when last story ends
    }
  };

  const renderContent = () => {
    switch (story.media_type) {
      case 'image':
        return <img src={story.media_url} className="max-w-full max-h-screen object-contain" alt="Story" />;
      case 'video':
        return (
          <video
            src={story.media_url}
            className="max-h-screen"
            controls
            autoPlay
            onEnded={() => {
              if (index < viewStoryGroup.stories.length - 1) setIndex(index + 1);
              else setViewStoryGroup(null);
            }}
          />
        );
      case 'text':
        return (
          <div
            className="w-md min-h-screen flex items-center justify-center p-8 text-white text-2xl text-center"
            style={{ backgroundColor: story.background_color }}
          >
            {story.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 w-full flex space-x-1 p-2">
        {viewStoryGroup.stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-gray-700 rounded">
            <div
              className="h-full bg-white transition-all duration-100 linear"
              style={{ width: i === index ? `${progress}%` : i < index ? '100%' : '0%' }}
            ></div>
          </div>
        ))}
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 backdrop-blur-2xl rounded bg-black/50">
        <img
          src={viewStoryGroup.user?.profile_picture}
          className="w-8 h-8 rounded-full object-cover border border-white"
          alt="User"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStoryGroup.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      {/* Close */}
      <button onClick={handleClose} className="absolute top-4 right-4 text-white text-3xl">
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* Left Arrow */}
      {index > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Right Arrow */}
      {index < viewStoryGroup.stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full text-white hover:bg-black/70"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Content */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">{renderContent()}</div>
    </div>
  );
};

export default StoryViewer;
