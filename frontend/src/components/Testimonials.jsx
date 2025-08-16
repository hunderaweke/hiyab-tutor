import { useCallback, useEffect, useMemo, useState } from "react";
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

  const slides = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
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
  const textTestimonials = [
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
  return (
    <section
      id="testimonials"
      className="container mx-auto px-4 lg:px-6 mt-20 lg:mt-28 relative"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="space-y-5 text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
            What our <span className="text-brand-green">Clients</span> Say About
            Us?
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-light max-w-xl mx-auto lg:mx-0">
            Hear directly from students and parents who’ve experienced the Hiyab
            Tutors difference. These real stories show how the right support can
            change everything.
          </p>
        </div>
        <div className="embla embla--video embla--fade-right relative">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container flex ">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`embla__slide mx-2 ${
                    index === selectedIndex ? "is-selected" : ""
                  }`}
                  onClick={() => onSlideClick(index)}
                >
                  <VideoCard />
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
