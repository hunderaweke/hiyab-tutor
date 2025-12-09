import { useState, useEffect } from "react";
import { FaTelegramPlane, FaFacebookF, FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { t, onLanguageChange } from "../i18n";

const Footer = () => {
  const [, setLang] = useState("");

  useEffect(() => {
    return onLanguageChange(() => setLang(Date.now()));
  }, []);

  return (
    <footer className="mt-12 sm:mt-16 border-t border-white/10 bg-[radial-gradient(120%_120%_at_80%_0%,_rgba(29,185,84,0.15),_transparent_60%)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
        <div className="space-y-3 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold">
            Hiyab <span className="text-brand-green">Tutors</span>
          </h3>
          <p className="text-white/70 max-w-sm text-sm sm:text-base mx-auto sm:mx-0">
            Personalized tutoring that helps students grow with confidence and
            curiosity.
          </p>
        </div>

        <div className="text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 text-brand-green">
            {t("footer.quickLinks")}
          </h4>
          <ul className="space-y-2 text-white/80 text-sm sm:text-base">
            <li>
              <a
                href="#home"
                className="hover:text-brand-green transition-colors"
              >
                {t("nav.home")}
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="hover:text-brand-green transition-colors"
              >
                {t("nav.about")}
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className="hover:text-brand-green transition-colors"
              >
                {t("nav.testimonials")}
              </a>
            </li>
            <li>
              <a
                href="#tutors"
                className="hover:text-brand-green transition-colors"
              >
                {t("nav.tutors")}
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:text-brand-green transition-colors"
              >
                {t("nav.contact")}
              </a>
            </li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 text-brand-green">
            {t("nav.contact")}
          </h4>
          <ul className="space-y-2 text-white/80 text-sm sm:text-base">
            <li className="flex items-center gap-3 justify-center sm:justify-start">
              <FiPhone className="text-brand-green flex-shrink-0" />{" "}
              <span>0912345678</span>
            </li>
            <li className="flex items-center gap-3 justify-center sm:justify-start">
              <HiOutlineMail className="text-brand-green flex-shrink-0" />{" "}
              <span>hiyab@gmail.com</span>
            </li>
            <li className="flex items-center gap-3 justify-center sm:justify-start">
              <FaTelegramPlane className="text-brand-green flex-shrink-0" />{" "}
              <span>@telegram</span>
            </li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 text-brand-green">
            {t("footer.followUs")}
          </h4>
          <div className="flex gap-4 text-brand-green text-xl justify-center sm:justify-start">
            <a
              href="#"
              aria-label="Telegram"
              className="hover:opacity-80 transition-opacity"
            >
              <FaTelegramPlane />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="hover:opacity-80 transition-opacity"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:opacity-80 transition-opacity"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between text-white/60 text-xs sm:text-sm gap-3">
          <p className="text-center md:text-left">{t("footer.copyright")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-green transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-brand-green transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
