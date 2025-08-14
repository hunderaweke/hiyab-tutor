import { useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import TutorCard from "./TutorCard";

const Tutors = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const tutors = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  const next = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const prev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);

  return (
    <section id="tutors" className="container mx-auto mt-28 px-4 lg:px-6">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 lg:mb-10 text-center lg:text-left">Our <span className="text-brand-green">Tutors</span></h2>
      <div className="relative">
        <div className="embla embla--tutors embla--equal embla--fade-right embla--fade-left">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container gap-2 justify-center">
              {tutors.map((t) => (
                <div key={t} className="embla__slide flex justify-center">
                  <TutorCard />
                </div>
              ))}
            </div>
          </div>
          <button onClick={prev} className="embla-prev-btn" aria-label="Previous">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30 10L16 24l14 14" />
            </svg>
          </button>
          <button onClick={next} className="embla-next-btn" aria-label="Next">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10l14 14-14 14" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Tutors;


