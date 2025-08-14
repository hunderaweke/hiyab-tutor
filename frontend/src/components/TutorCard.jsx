import { PiGraduationCapDuotone } from "react-icons/pi";
import { BiCalendar } from "react-icons/bi";
import { HiOutlineUser } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import placeholder from "../assets/download.jpg";

const TutorCard = ({
  name = "Sara Teshome",
  degree = "Computer Science(BSC)",
  experience = "2+ Years Experience",
  location = "Adama, Bole",
  image = placeholder,
}) => {
  return (
    <div className="rounded-xl w-full overflow-hidden border border-white/10 shadow-md relative">
      {/* Image area */}
      <div className="relative h-full w-full overflow-hidden">
        <img src={image} alt={name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-main/90 flex flex-col gap-5 via-main/80 to-transparent/95 backdrop-blur-sm px-4 pb-4 pt-5 sm:pt-6" >
        <div className="flex items-center gap-3  text-brand-green">
          <HiOutlineUser className="text-xl" />
          <span className="font-semibold text-white text-lg sm:text-xl">{name}</span>
        </div>
        <div className="flex items-center gap-3 text-white/85">
          <PiGraduationCapDuotone className="text-brand-green text-lg" />
          <span className="text-sm sm:text-base leading-tight">{degree}</span>
        </div>
        <div className="flex items-center gap-3 text-white/85">
          <BiCalendar className="text-brand-green text-lg" />
          <span className="text-sm sm:text-base leading-tight">{experience}</span>
        </div>
        <div className="flex items-center gap-3 text-white/85">
          <MdLocationOn className="text-brand-green text-lg" />
          <span className="text-sm sm:text-base leading-tight">{location}</span>
        </div>
        <button className="mt-3 w-full h-12 sm:h-12 bg-brand-green text-main font-semibold rounded-lg shadow-[0_10px_30px_rgba(29,185,84,0.35)]">
          Book Now
        </button>
        </div>
      </div>

    </div>
  );
};

export default TutorCard;


