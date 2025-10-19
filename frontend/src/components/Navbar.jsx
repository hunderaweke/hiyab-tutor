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
    <nav className="sticky top-2 z-[999] mx-4 md:mx-10">
      <div className="backdrop-blur-2xl h-16 bg-main/30 text-white border border-white/10 rounded-3xl flex items-center px-4 md:px-8 justify-between">
        <img src={logo} alt="Hiyab Logo" className="w-28 md:w-30" />
        <button
          aria-label="Toggle menu"
          className="md:hidden text-brand-green text-3xl"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/">Home</Link>
          <button
            onClick={() => goToSection("about")}
            className="hover:underline"
          >
            About
          </button>
          <button
            onClick={() => goToSection("testimonials")}
            className="hover:underline"
          >
            Testimonials
          </button>
          <button
            onClick={() => goToSection("tutors")}
            className="hover:underline"
          >
            Tutors
          </button>
          <button
            onClick={() => goToSection("contact")}
            className="hover:underline"
          >
            Contact
          </button>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <select
            name="language_code"
            className="bg-transparent border border-white/10 text-white/90 rounded px-2 py-1"
            onChange={(e) => setLanguage(e.target.value)}
            value={undefined}
          >
            <option value="en">EN</option>
            <option value="am">AM</option>
          </select>
          <Link
            to="/apply-tutor"
            className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm"
          >
            Apply as Tutor
          </Link>
          <Link
            to="/book-tutor"
            className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm"
          >
            Book Tutor
          </Link>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-main/70 backdrop-blur-2xl p-4 space-y-4">
          <Link to="/" className="block" onClick={() => setOpen(false)}>
            Home
          </Link>
          <button
            onClick={() => goToSection("about")}
            className="block text-left w-full"
          >
            About
          </button>
          <button
            onClick={() => goToSection("testimonials")}
            className="block text-left w-full"
          >
            Testimonials
          </button>
          <button
            onClick={() => goToSection("tutors")}
            className="block text-left w-full"
          >
            Tutors
          </button>
          <button
            onClick={() => goToSection("contact")}
            className="block text-left w-full"
          >
            Contact
          </button>
          <div className="flex items-center justify-between">
            <select
              name="language_code"
              className="bg-transparent border border-white/10 text-white/90 rounded px-2 py-1"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="am">AM</option>
            </select>
            <Link
              to="/apply-tutor"
              className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm"
              onClick={() => setOpen(false)}
            >
              Apply as Tutor
            </Link>
            <Link
              to="/book-tutor"
              className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm"
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
