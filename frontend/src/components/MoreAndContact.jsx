import { useCallback, useEffect, useState } from "react";
import { t, onLanguageChange, getCurrentLanguage } from "../i18n";
import useEmblaCarousel from "embla-carousel-react";
import { FaTelegramPlane } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import bag from "../assets/download.jpg";

const MoreCard = ({
  title = "Zoe Gifts",
  desc = "The perfect gift for every soul you cherish.",
  image = bag,
  websiteUrl,
}) => (
  <div
    className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer group"
    onClick={() => websiteUrl && window.open(websiteUrl, "_blank")}
  >
    <img
      loading="lazy"
      src={image}
      alt={title}
      className="h-52 sm:h-60 md:h-64 w-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
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
      <span className="text-white/60 text-sm">{t(label)}</span>
      <span className="text-lg">{value}</span>
    </div>
  </div>
);

const MoreAndContact = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch other services from backend
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/v1/other-services/?limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data = await response.json();
        const currentLang = getCurrentLanguage();

        // Map services with translated content
        const mappedServices = (data.data || []).map((service) => {
          const translation =
            service.translations?.find(
              (tr) => tr.language_code === currentLang
            ) || service.translations?.[0];

          return {
            id: service.id,
            title: translation?.name || "Service",
            desc: translation?.description || translation?.tag_line || "",
            image: service.image ? `/api/v1/${service.image}` : bag,
            websiteUrl: service.website_url,
          };
        });

        setServices(mappedServices);
      } catch (err) {
        console.error("Services fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

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
    <section
      id="contact"
      className="container mx-auto mt-16 sm:mt-20 md:mt-24 px-4 sm:px-6 lg:px-8"
    >
      {/* More By Hiyab */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 lg:mb-10 px-2 lg:px-0">
        {t("more.title")}
      </h2>
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center h-[280px] bg-gray-100 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[280px] bg-red-50 rounded-2xl">
            <p className="text-red-600">
              {t("services.error", "Failed to load services")}
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] bg-gray-100 rounded-2xl">
            <p className="text-gray-500">
              {t("services.empty", "No services available")}
            </p>
          </div>
        ) : (
          <div className="embla embla--more embla--fade-right embla--fade-left">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container gap-4 md:gap-6">
                {services.map((service) => (
                  <div key={service.id} className="embla__slide">
                    <MoreCard
                      title={service.title}
                      desc={service.desc}
                      image={service.image}
                      websiteUrl={service.websiteUrl}
                    />
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
        )}
      </div>

      {/* Contact Us */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 lg:mb-10 mt-16 sm:mt-20 px-2 lg:px-0">
        {t("more.contactTitle")} <span className="text-brand-green" />
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 h-[250px] sm:h-[300px] md:h-[360px]">
          {/* Replace with real map embed if needed */}
          <iframe
            title="Hiyab Map"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.858254997836!2d39.266!3d8.540!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAdama!5e0!3m2!1sen!2set!4v1700000000000"
          />
        </div>
        <div className="space-y-5 sm:space-y-6 md:space-y-8 px-2 lg:px-0">
          <ContactItem
            icon={<FaTelegramPlane />}
            label="more.phone"
            value="@telegram"
          />
          <ContactItem
            icon={<FiPhone />}
            label="more.phone"
            value="0912345678"
          />
          <ContactItem
            icon={<HiOutlineMail />}
            label="more.email"
            value="hiyab@gmail.com"
          />
        </div>
      </div>
    </section>
  );
};

export default MoreAndContact;
