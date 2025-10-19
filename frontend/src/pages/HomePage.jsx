import Hero from "../components/Hero";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import Tutors from "../components/Tutors";
import MoreAndContact from "../components/MoreAndContact";
import Footer from "../components/Footer";
import Analytics from "../components/Analytics";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo =
      location?.state?.scrollTo ||
      (window.location.hash ? window.location.hash.replace("#", "") : null);
    if (scrollTo) {
      // small timeout to ensure elements mounted
      setTimeout(() => {
        const el = document.getElementById(scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
    // Clear state after use to avoid repeated scrolling
    if (location.state && location.state.scrollTo) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);
  return (
    <>
      <Hero />
      <About />
      <Analytics />
      <Testimonials />
      <Tutors />
      <MoreAndContact />
      <Footer />
    </>
  );
};

export default HomePage;
