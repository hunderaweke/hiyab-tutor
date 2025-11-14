import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { t, onLanguageChange, getCurrentLanguage } from "../i18n";
import useEmblaCarousel from "embla-carousel-react";
import VideoCard from "./VideoCard";
import TextCards from "./TextCards";

const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRefs = useRef([]);

  // Fetch testimonials from backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/testimonials/?limit=50");
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }
        const data = await response.json();
        setTestimonials(data.data || []);
      } catch (err) {
        console.error("Testimonials fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Video testimonials (those with video field)
  const videoTestimonials = useMemo(
    () => testimonials.filter((t) => t.video),
    [testimonials]
  );

  // Text testimonials (derive from translations or static fallback)
  const textTestimonials = useMemo(() => {
    const currentLang = getCurrentLanguage();
    const fromBackend = testimonials
      .filter((t) => !t.video && t.translations && t.translations.length > 0)
      .map((t) => {
        const translation =
          t.translations.find((tr) => tr.language_code === currentLang) ||
          t.translations[0];
        return {
          text: translation?.text || translation?.name || "",
          name: t.name || "Anonymous",
          role: t.role || "Student",
        };
      });

    // Fallback static testimonials if none from backend
    if (fromBackend.length === 0) {
      return [
        {
          text: "I'm a college prep student, and I was struggling with time management and multiple subjects... The tutor I found on Hiyab was more than just a subject expert — it was mentorship.",
          name: "Eyob D.",
          role: "Pre-University Student",
        },
        {
          text: "We've used Hiyab Tutors for over a year now for both our children. Tutors are respectful, punctual, and genuinely invested in helping the kids grow.",
          name: "Parent",
          role: "Pre-University Student",
        },
        {
          text: "My son now feels more confident in math and has even started helping his classmates. The difference is night and day.",
          name: "Parent",
          role: "Pre-University Student",
        },
        {
          text: "This platform truly understands the needs of students and parents. The right support makes all the difference.",
          name: "Eyob D.",
          role: "Pre-University Student",
        },
        {
          text: "They adapt their teaching methods to fit each child's pace. Hiyab Tutors has become a part of our family's academic life.",
          name: "Parent",
          role: "Pre-University Student",
        },
        {
          text: "Organized, supportive, and effective. We saw progress from session one and it kept going.",
          name: "Parent",
          role: "Pre-University Student",
        },
      ];
    }
    return fromBackend;
  }, [testimonials]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();

    // Pause all videos when sliding
    videoRefs.current.forEach((ref) => {
      if (ref && ref.pause) {
        ref.pause();
      }
    });

    setSelectedIndex(newIndex);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  const onSlideClick = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Text testimonials carousel
  const [emblaRefText, emblaApiText] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const scrollNextText = useCallback(() => {
    if (emblaApiText) emblaApiText.scrollNext();
  }, [emblaApiText]);
  const scrollPrevText = useCallback(() => {
    if (emblaApiText) emblaApiText.scrollPrev();
  }, [emblaApiText]);

  // Pause all videos when user scrolls away from section
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRefs.current.forEach((ref) => {
          if (ref && ref.pause) {
            ref.pause();
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const [, setLang] = useState(null);

  useEffect(() => onLanguageChange(() => setLang(Date.now())), []);

  return (
    <section
      id="testimonials"
      className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 lg:mt-28 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-20 items-center">
        <div className="space-y-4 sm:space-y-5 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight px-2 lg:px-0">
            {t("testimonials.title")
              .split(" ")
              .map((word, idx) => (
                <span key={idx} className={idx === 2 ? "text-brand-green" : ""}>
                  {word}{" "}
                </span>
              ))}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-xl mx-auto lg:mx-0 px-2 lg:px-0">
            {t("testimonials.subtitle")}
          </p>
        </div>
        <div className="embla embla--video embla--fade-right relative">
          {loading ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[400px] bg-red-50 rounded-2xl">
              <p className="text-red-600">
                {t("testimonials.error", "Failed to load testimonials")}
              </p>
            </div>
          ) : videoTestimonials.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
              <p className="text-gray-500">
                {t("testimonials.empty", "No video testimonials available")}
              </p>
            </div>
          ) : (
            <>
              <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container flex ">
                  {videoTestimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id || index}
                      className={`embla__slide mx-2 ${
                        index === selectedIndex ? "is-selected" : ""
                      }`}
                      onClick={() => onSlideClick(index)}
                    >
                      <VideoCard
                        ref={(el) => (videoRefs.current[index] = el)}
                        video={testimonial.video}
                        thumbnail={testimonial.thumbnail}
                        name={testimonial.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={scrollNext}
                aria-label="Next"
                className="embla-next-btn cursor-pointer"
              >
                <svg
                  viewBox="0 0 48 48"
                  width="48"
                  height="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 10l14 14-14 14" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {/* Text testimonials carousel */}
      <div className="relative mt-16 lg:mt-24">
        <div className="embla embla--text embla--fade-right embla--fade-left embla--equal">
          <div className="embla__viewport" ref={emblaRefText}>
            <div className="embla__container gap-3 md:gap-4 justify-center">
              {textTestimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`mx-2 embla__slide flex justify-center ${
                    idx === 0 ? "is-selected" : ""
                  }`}
                >
                  <TextCards text={t.text} name={t.name} role={t.role} />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={scrollPrevText}
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
          <button
            onClick={scrollNextText}
            className="embla-next-btn"
            aria-label="Next"
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
              <path d="M18 10l14 14-14 14" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
