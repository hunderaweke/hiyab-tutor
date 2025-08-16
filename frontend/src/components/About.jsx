const About = () => {
  return (
    <section
      id="about"
      className="container mx-auto my-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 px-4"
    >
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold my-8 lg:my-16">
          Who are We <span className="text-brand-green">?</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-extralight max-w-3xl">
          At Hiyab Tutors, we believe that every student deserves access to the
          right support — someone who understands their challenges, inspires
          their curiosity, and guides them toward real progress. Founded with a
          deep commitment to academic excellence and accessibility, our platform
          connects families with trusted, qualified tutors across a wide range
          of subjects.
        </p>
      </div>
      <div className="grid grid-rows-2 gap-4 md:gap-5 max-h-fit max-w-full z-10">
        <div className="grid grid-cols-2 gap-4 md:gap-5">
          <div className="bg-main rounded-md p-6 md:p-8 lg:p-10 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold">2+</h1>
            <p className="text-sm md:text-base lg:text-xl">
              Years of Experience
            </p>
          </div>
          <div className="bg-brand-green text-main rounded-md p-6 md:p-8 lg:p-10 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold">100+</h1>
            <p className="text-sm md:text-base lg:text-xl">Trusting Families</p>
          </div>
        </div>
        <div className="bg-white text-main items-center p-6 md:p-8 lg:p-10 rounded-md text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold">1000+</h1>
          <p className="text-sm md:text-base lg:text-xl">
            Successful Students Exceeding in Academics
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
