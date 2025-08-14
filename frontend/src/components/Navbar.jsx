import { useState } from "react";
import logo from "../assets/hiyab-logo.svg";
const Navbar = () => {
  const [open, setOpen] = useState(false);
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
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#tutors">Tutors</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-5">
          <select name="language_code" className="bg-transparent">
            <option value="en">EN</option>
            <option value="am">AM</option>
          </select>
          <a href="/book-tutor" className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm">
            Book Tutor
          </a>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/10 bg-main/70 backdrop-blur-2xl p-4 space-y-4">
          <a href="#home" className="block">Home</a>
          <a href="#about" className="block">About</a>
          <a href="#testimonials" className="block">Testimonials</a>
          <a href="#tutors" className="block">Tutors</a>
          <a href="#contact" className="block">Contact</a>
          <div className="flex items-center justify-between">
            <select name="language_code" className="bg-transparent">
              <option value="en">EN</option>
              <option value="am">AM</option>
            </select>
            <a href="/book-tutor" className="font-bold text-brand-green border-2 px-3 py-1 rounded-sm">
              Book Tutor
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
