import { useCallback, useMemo, useEffect, useState } from "react";
import { t, onLanguageChange } from "../i18n";
import useEmblaCarousel from "embla-carousel-react";
import { FaTelegramPlane } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import bag from "../assets/download.jpg";

const MoreCard = ({
  title = "Zoe Gifts",
  desc = "The perfect gift for every soul you cherish.",
  image = bag,
}) => (
  <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
    <img
      loading="lazy"
      src={image}
      alt={title}
      className="h-52 sm:h-60 md:h-64 w-full object-cover opacity-70"
    />
    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between">
      <h3 className="text-2xl sm:text-3xl font-bold">
        {title.split(" ")[0]}{" "}
        <span className="text-brand-green">{title.split(" ")[1]}</span>
      </h3>
      <p className="max-w-[85%] text-white/85 text-base sm:text-lg leading-snug">
        {desc}
      </p>
    </div>
  </div>
);

const ContactItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 text-white/85">
    <div className="text-brand-green text-xl">{icon}</div>
    <div className="flex flex-col">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="text-lg">{value}</span>
    </div>
  </div>
);

const MoreAndContact = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const moreItems = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
  const next = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const prev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;
    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(autoplayInterval);
  }, [emblaApi]);

  const [, setLang] = useState(null);
  useEffect(() => onLanguageChange(() => setLang(Date.now())), []);

  return (
    <section id="contact" className="container mx-auto mt-24 px-4">
      {/* More By Hiyab */}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 lg:mb-10">
        {t("more.title")} <span className="text-brand-green">Hiyab</span>
      </h2>
      <div className="relative">
        <div className="embla embla--more embla--fade-right embla--fade-left">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container gap-4 md:gap-6">
              {moreItems.map((_, idx) => (
                <div key={idx} className="embla__slide">
                  <MoreCard />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={prev}
            className="embla-prev-btn"
            aria-label="Previous"
          >
            <svg
              viewBox="0 0 48 48"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M30 10L16 24l14 14" />
            </svg>
          </button>
          <button onClick={next} className="embla-next-btn" aria-label="Next">
            <svg
              viewBox="0 0 48 48"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 10l14 14-14 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contact Us */}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 lg:mb-10 mt-20">
        {t("more.contactTitle")} <span className="text-brand-green" />
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 h-[280px] sm:h-[320px] md:h-[360px]">
          {/* Replace with real map embed if needed */}
          <iframe
            title="Hiyab Map"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.858254997836!2d39.266!3d8.540!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAdama!5e0!3m2!1sen!2set!4v1700000000000"
          />
        </div>
        <div className="space-y-6 sm:space-y-8">
          <ContactItem
            icon={<FaTelegramPlane />}
            label="Telegram"
            value="@telegram"
          />
          <ContactItem icon={<FiPhone />} label="Phone" value="0912345678" />
          <ContactItem
            icon={<HiOutlineMail />}
            label="Email"
            value="hiyab@gmail.com"
          />
        </div>
      </div>
    </section>
  );
};

export default MoreAndContact;
