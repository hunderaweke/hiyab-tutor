import { FaPlay } from "react-icons/fa";
import thumbnail from "../assets/download.jpg";
const VideoCard = () => {
  return (
    <div className="video-card relative overflow-hidden rounded-xl">
      <img
        loading="lazy"
        src={thumbnail}
        alt=""
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        className="video-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-brand-green text-main shadow-lg opacity-0 transition-opacity duration-300"
        aria-label="Play testimonial"
      >
        <FaPlay />
      </button>
    </div>
  );
};

export default VideoCard;
