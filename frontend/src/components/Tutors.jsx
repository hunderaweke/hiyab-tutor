import { useCallback, useEffect, useState } from "react";
import { t, onLanguageChange } from "../i18n";
import useEmblaCarousel from "embla-carousel-react";
import TutorCard from "./TutorCard";

const Tutors = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLang] = useState("");

  useEffect(() => {
    return onLanguageChange(() => setLang(Date.now()));
  }, []);

  // Fetch verified tutors from backend
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/v1/tutors/?verified=true&limit=20");
        if (!response.ok) {
          throw new Error("Failed to fetch tutors");
        }
        const data = await response.json();
        setTutors(data.data || []);
      } catch (err) {
        console.error("Tutors fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  const next = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const prev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);

  return (
    <section
      id="tutors"
      className="container mx-auto mt-16 sm:mt-20 md:mt-24 lg:mt-28 px-4 sm:px-6 lg:px-8"
    >
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lg:mb-10 text-center lg:text-left px-2 lg:px-0">
        {t("tutors.title")}{" "}
        <span className="text-brand-green">{t("tutors.titleHighlight")}</span>
      </h2>
      <p className="text-base sm:text-lg md:text-xl font-light max-w-3xl mb-8 text-center lg:text-left px-2 lg:px-0">
        {t("tutors.subtitle")}
      </p>
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[400px] bg-red-50 rounded-2xl">
            <p className="text-red-600">
              {t("tutors.error", "Failed to load tutors")}
            </p>
          </div>
        ) : tutors.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-2xl">
            <p className="text-gray-500">
              {t("tutors.empty", "No tutors available at the moment")}
            </p>
          </div>
        ) : (
          <div className="embla embla--tutors embla--equal embla--fade-right embla--fade-left">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container gap-2 justify-center">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="embla__slide flex justify-center"
                  >
                    <TutorCard
                      name={`${tutor.first_name || ""} ${
                        tutor.last_name || ""
                      }`.trim()}
                      degree={
                        tutor.education_level || "Education Level Not Specified"
                      }
                      experience={`${tutor.day_per_week || 0} days/week, ${
                        tutor.hr_per_day || 0
                      } hrs/day`}
                      location={tutor.address || "Location Not Specified"}
                      image={tutor.image ? `/api/v1/${tutor.image}` : undefined}
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
                width="48"
                height="48"
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
          </div>
        )}
      </div>
    </section>
  );
};

export default Tutors;
