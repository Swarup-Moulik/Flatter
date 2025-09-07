import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

const MessageViewer = ({ messages, currentIndex, setCurrentIndex, onClose }) => {
    const media = messages[currentIndex];
    // Keyboard navigation (← → Esc)
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowLeft")
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
            if (e.key === "ArrowRight")
                setCurrentIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [messages.length, setCurrentIndex, onClose]);
    // Disable scroll & input on mount
    useEffect(() => {
        document.body.style.overflow = "hidden"; // disable scroll & input
        return () => {
            document.body.style.overflow = "auto"; // restore
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            style={{ pointerEvents: "all" }} // intercept clicks          
        >
            {/* Close */}
            <button className="absolute top-5 right-5 text-white cursor-pointer" onClick={onClose}>
                <X className="w-8 h-8" />
            </button>

            {/* Left */}
            {messages.length > 1 && (
                <button
                    className="absolute left-5 text-white"
                    onClick={() =>
                        setCurrentIndex((prev) =>
                            prev > 0 ? prev - 1 : messages.length - 1
                        )
                    }
                >
                    <ChevronLeft className="w-10 h-10 cursor-pointer" />
                </button>
            )}

            {/* Media */}
            <div className="max-w-3xl w-full text-white text-center">
                {media.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                        src={media}
                        controls
                        autoPlay
                        className="w-full max-h-[85vh] object-contain rounded-xl"
                    />
                ) : (
                    <img
                        src={media}
                        alt="Message Media"
                        className="w-full max-h-[85vh] object-contain rounded-xl"
                    />
                )}
            </div>

            {/* Right */}
            {messages.length > 1 && (
                <button
                    className="absolute right-5 text-white"
                    onClick={() =>
                        setCurrentIndex((prev) =>
                            prev < messages.length - 1 ? prev + 1 : 0
                        )
                    }
                >
                    <ChevronRight className="w-10 h-10 cursor-pointer" />
                </button>
            )}

            {/* Dots */}
            {messages.length > 1 && (
                <div className="absolute bottom-6 flex gap-2">
                    {messages.map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i === currentIndex ? "bg-white" : "bg-gray-500"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessageViewer;
