import React from "react";
import underline from "../assets/underline.svg";
import studentImage from "../assets/student 1.png";

const Hero = () => {
  return (
    <section className="container mx-auto min-h-[80vh] md:min-h-[90vh] text-center mb-16 relative overflow-hidden mt-8 lg:mt-16">
      <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
        Your Child’s <span className="text-brand-green">Learning</span> Journey
        <br />
        Starts Here.
      </h1>
      <img className="mx-auto mt-2 w-1/2 sm:w-2/5 md:w-1/3" src={underline} alt="Underline" />
      <p className="text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto px-2">
        Hiyab Tutors connects students with qualified, caring tutors for every
        subject and every level — all in one place.
      </p>
      <img src={studentImage} className="hero-student-image mx-auto max-w-[90%] md:max-w-[70%] relative" alt="Student Image 1" />


      <div className="md:block w-fit bg-gray-200/90 rounded-md shadow-lg p-2 md:p-5 md:px-4 text-main md:absolute left-0 lg:left-56 md:top-1/2 -translate-y-1/2">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">Working With</h2>
        <div className="flex gap-10 text-xs md:text-base">
          <p>100+ Families</p>
          <p>100+ Students</p>
        </div>
      </div>
      <div className="md:block bg-gray-200/90 max-w-72 text-left rounded-md shadow-lg p-2 md:p-5 md:px-8 text-main absolute md:absolute lg:right-50 bottom-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">100+</h2>
        <p className="text-sm md:text-base">Professional Tutors who have shown great impact on their students</p>
      </div>
    </section>
  );
};

export default Hero;
