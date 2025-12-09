import { FaPlay } from "react-icons/fa";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import placeholderThumbnail from "../assets/download.jpg";

const VideoCard = forwardRef(
  ({ video, thumbnail, name = "Testimonial" }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef(null);

    const videoSrc = video ? `/api/v1/${video}` : null;
    const thumbnailSrc = thumbnail ? `/api/v1/${thumbnail}` : placeholderThumbnail;

    // Expose pause method to parent
    useImperativeHandle(ref, () => ({
      pause: () => {
        if (videoRef.current && isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
    }));

    // Preload video when component mounts
    useEffect(() => {
      if (videoSrc && videoRef.current) {
        videoRef.current.load();
      }
    }, [videoSrc]);

    const handlePlayPause = () => {
      if (!videoRef.current || !videoSrc) return;

      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setIsPlaying(true);
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
          setHasError(true);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    };

    const handleVideoLoaded = () => {
      setIsLoading(false);
    };

    const handleVideoError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    return (
      <div className="video-card relative overflow-hidden rounded-xl bg-white/5">
        {/* Thumbnail (shown when not playing) */}
        {!isPlaying && (
          <>
            <img
              loading="lazy"
              src={thumbnailSrc}
              alt={name}
              className="h-full w-full object-cover"
            />
            {/* Play button overlay */}
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!videoSrc || hasError}
              className="video-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full bg-brand-green text-main shadow-lg opacity-0 transition-opacity duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Play testimonial"
            >
              <FaPlay className="ml-1" />
            </button>
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm p-4 text-center">
                Video unavailable
              </div>
            )}
          </>
        )}

        {/* Video player (shown when playing) */}
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            className={`h-full w-full object-cover ${
              isPlaying ? "block" : "hidden"
            }`}
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            onEnded={() => setIsPlaying(false)}
            onPlaying={() => setIsLoading(false)}
            controls={isPlaying}
            preload="metadata"
          />
        )}

        {/* Loading spinner - only show when loading and not yet playing */}
        {isLoading && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-green border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  }
);

VideoCard.displayName = "VideoCard";

export default VideoCard;
