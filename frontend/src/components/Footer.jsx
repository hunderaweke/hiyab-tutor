import { FaTelegramPlane, FaFacebookF, FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[radial-gradient(120%_120%_at_80%_0%,_rgba(29,185,84,0.15),_transparent_60%)]">
      <div className="container mx-auto px-4 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div className="space-y-3">
          <h3 className="text-3xl font-bold">
            Hiyab <span className="text-brand-green">Tutors</span>
          </h3>
          <p className="text-white/70 max-w-sm">
            Personalized tutoring that helps students grow with confidence and
            curiosity.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3 text-brand-green">
            Explore
          </h4>
          <ul className="space-y-2 text-white/80">
            <li>
              <a href="#home" className="hover:text-brand-green">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-brand-green">
                About
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-brand-green">
                Testimonials
              </a>
            </li>
            <li>
              <a href="#tutors" className="hover:text-brand-green">
                Tutors
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-brand-green">
                Contact
              </a>
            </li>
            <li>
              <Link to="/book-tutor" className="hover:text-brand-green">
                Book Tutor
              </Link>
            </li>
            <li>
              <Link to="/apply-tutor" className="hover:text-brand-green">
                Apply as Tutor
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3 text-brand-green">
            Contact
          </h4>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-center gap-3">
              <FiPhone className="text-brand-green" /> <span>0912345678</span>
            </li>
            <li className="flex items-center gap-3">
              <HiOutlineMail className="text-brand-green" />{" "}
              <span>hiyab@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <FaTelegramPlane className="text-brand-green" />{" "}
              <span>@telegram</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3 text-brand-green">
            Follow
          </h4>
          <div className="flex gap-4 text-brand-green text-xl">
            <a href="#" aria-label="Telegram" className="hover:opacity-80">
              <FaTelegramPlane />
            </a>
            <a href="#" aria-label="Facebook" className="hover:opacity-80">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram" className="hover:opacity-80">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto py-5 flex flex-col md:flex-row items-center justify-between text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Hiyab Tutors. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="#" className="hover:text-brand-green">
              Privacy
            </a>
            <a href="#" className="hover:text-brand-green">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
