import React from "react";
import underline from "../assets/underline.svg";
import studentImage from "../assets/student 1.png";

const Hero = () => {
  return (
    <section
      id="home"
      className="container mx-auto min-h-[80vh] md:min-h-[90vh] text-center mb-16 relative overflow-hidden mt-8 lg:mt-16 px-4"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight px-2">
        Your Child's <span className="text-brand-green">Learning</span> Journey
        <br />
        Starts Here.
      </h1>
      <img
        loading="lazy"
        className="mx-auto mt-2 w-1/2 sm:w-2/5 md:w-1/3 max-w-xs"
        src={underline}
        alt="Underline"
      />
      <p className="text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto px-4 mt-4">
        Hiyab Tutors connects students with qualified, caring tutors for every
        subject and every level — all in one place.
      </p>
      <img
        loading="lazy"
        src={studentImage}
        className="hero-student-image mx-auto max-w-[90%] md:max-w-[70%] lg:max-w-[60%] relative mt-8"
        alt="Student Image 1"
      />

      {/* Stats Cards - Responsive positioning */}
      <div className="hidden md:block w-fit bg-gray-200/90 rounded-md shadow-lg p-3 md:p-5 md:px-4 text-main absolute left-4 lg:left-20 xl:left-56 top-[45%] md:top-1/2 transform -translate-y-1/2">
        <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2">
          Working With
        </h2>
        <div className="flex gap-6 lg:gap-10 text-xs md:text-sm lg:text-base">
          <p>100+ Families</p>
          <p>100+ Students</p>
        </div>
      </div>

      <div className="hidden md:block bg-gray-200/90 max-w-[250px] lg:max-w-xs text-left rounded-md shadow-lg p-3 md:p-5 md:px-6 lg:px-8 text-main absolute right-4 lg:right-20 xl:right-40 bottom-16 md:bottom-20 lg:bottom-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">100+</h2>
        <p className="text-xs md:text-sm lg:text-base">
          Professional Tutors who have shown great impact on their students
        </p>
      </div>

      {/* Mobile Stats - Stacked below image */}
      <div className="md:hidden grid grid-cols-2 gap-4 mt-8">
        <div className="bg-gray-200/90 rounded-md shadow-lg p-4 text-main">
          <h3 className="text-lg font-bold mb-1">Working With</h3>
          <p className="text-xs">100+ Families</p>
          <p className="text-xs">100+ Students</p>
        </div>
        <div className="bg-gray-200/90 rounded-md shadow-lg p-4 text-main">
          <h3 className="text-2xl font-bold mb-1">100+</h3>
          <p className="text-xs">Professional Tutors</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
