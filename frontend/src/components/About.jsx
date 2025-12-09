import { useState, useEffect } from "react";
import { t, onLanguageChange } from "../i18n";

const About = () => {
  const [, setLang] = useState("");

  useEffect(() => {
    return onLanguageChange(() => setLang(Date.now()));
  }, []);

  return (
    <section
      id="about"
      className="container mx-auto my-12 sm:my-16 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-24 px-4 sm:px-6 lg:px-8"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold my-6 sm:my-8 lg:my-16 px-2 lg:px-0">
          {t("about.title")} <span className="text-brand-green">?</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-extralight max-w-3xl px-2 lg:px-0 leading-relaxed">
          {t("about.description")}
        </p>
      </div>
      <div className="grid grid-rows-2 gap-4 md:gap-5 max-h-fit max-w-full z-10">
        <div className="grid grid-cols-2 gap-4 md:gap-5">
          <div className="bg-main rounded-md p-5 sm:p-6 md:p-8 lg:p-10 text-center flex flex-col items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold">
              2+
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl mt-2">
              {t("about.yearsExperience")}
            </p>
          </div>
          <div className="bg-brand-green text-main rounded-md p-5 sm:p-6 md:p-8 lg:p-10 text-center flex flex-col items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold">
              100+
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl mt-2">
              {t("about.trustingFamilies")}
            </p>
          </div>
        </div>
        <div className="bg-white text-main p-5 sm:p-6 md:p-8 lg:p-10 rounded-md text-center flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold">
            1000+
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-xl mt-2">
            {t("about.successfulStudents")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
