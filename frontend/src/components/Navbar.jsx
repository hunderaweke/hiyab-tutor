import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setLanguage } from "../i18n";
import logo from "../assets/hiyab-logo.svg";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (sectionId) => {
    setOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/", { state: { scrollTo: sectionId } });
  };
  return (
    <nav className="sticky top-2 z-[999] mx-2 sm:mx-4 md:mx-10">
      <div className="backdrop-blur-2xl h-14 sm:h-16 bg-main/30 text-white border border-white/10 rounded-3xl flex items-center px-3 sm:px-4 md:px-8 justify-between">
        <img src={logo} alt="Hiyab Logo" className="w-24 sm:w-28 md:w-30" />
        <button
          aria-label="Toggle menu"
          className="md:hidden text-brand-green text-2xl sm:text-3xl"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <div className="hidden md:flex gap-4 lg:gap-6 items-center text-sm lg:text-base">
          <Link to="/" className="hover:text-brand-green transition-colors">
            Home
          </Link>
          <button
            onClick={() => goToSection("about")}
            className="hover:text-brand-green transition-colors"
          >
            About
          </button>
          <button
            onClick={() => goToSection("testimonials")}
            className="hover:text-brand-green transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={() => goToSection("tutors")}
            className="hover:text-brand-green transition-colors"
          >
            Tutors
          </button>
          <button
            onClick={() => goToSection("contact")}
            className="hover:text-brand-green transition-colors"
          >
            Contact
          </button>
        </div>
        <div className="hidden md:flex items-center gap-3 lg:gap-5">
          <select
            name="language_code"
            className="bg-transparent border border-white/10 text-white/90 rounded px-2 py-1 text-sm cursor-pointer"
            onChange={(e) => setLanguage(e.target.value)}
            value={undefined}
          >
            <option value="en">EN</option>
            <option value="am">AM</option>
          </select>
          <Link
            to="/apply-tutor"
            className="font-bold text-brand-green border-2 border-brand-green px-2 lg:px-3 py-1 rounded-sm hover:bg-brand-green hover:text-main transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            Apply as Tutor
          </Link>
          <Link
            to="/book-tutor"
            className="font-bold text-main bg-brand-green border-2 border-brand-green px-2 lg:px-3 py-1 rounded-sm hover:bg-transparent hover:text-brand-green transition-colors text-xs lg:text-sm whitespace-nowrap"
          >
            Book Tutor
          </Link>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-main/90 backdrop-blur-2xl p-4 space-y-3 text-sm">
          <Link
            to="/"
            className="block py-2 hover:text-brand-green transition-colors"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <button
            onClick={() => goToSection("about")}
            className="block text-left w-full py-2 hover:text-brand-green transition-colors"
          >
            About
          </button>
          <button
            onClick={() => goToSection("testimonials")}
            className="block text-left w-full py-2 hover:text-brand-green transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={() => goToSection("tutors")}
            className="block text-left w-full py-2 hover:text-brand-green transition-colors"
          >
            Tutors
          </button>
          <button
            onClick={() => goToSection("contact")}
            className="block text-left w-full py-2 hover:text-brand-green transition-colors"
          >
            Contact
          </button>
          <hr className="border-white/10" />
          <div className="flex flex-col gap-3 pt-2">
            <select
              name="language_code"
              className="bg-transparent border border-white/10 text-white/90 rounded px-2 py-2 w-full cursor-pointer"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="am">AM</option>
            </select>
            <Link
              to="/apply-tutor"
              className="font-bold text-center text-brand-green border-2 border-brand-green px-3 py-2 rounded-sm hover:bg-brand-green hover:text-main transition-colors"
              onClick={() => setOpen(false)}
            >
              Apply as Tutor
            </Link>
            <Link
              to="/book-tutor"
              className="font-bold text-center text-main bg-brand-green border-2 border-brand-green px-3 py-2 rounded-sm hover:bg-transparent hover:text-brand-green transition-colors"
              onClick={() => setOpen(false)}
            >
              Book Tutor
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
