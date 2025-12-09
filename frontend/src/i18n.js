const translations = {
  en: {
    // Navbar
    nav: {
      home: "Home",
      about: "About",
      testimonials: "Testimonials",
      tutors: "Tutors",
      contact: "Contact",
      applyTutor: "Apply as Tutor",
      bookTutor: "Book Tutor",
    },
    // Hero Section
    hero: {
      title: "Your Child's",
      titleHighlight: "Learning",
      titleEnd: "Journey Starts Here.",
      subtitle:
        "Hyab Tutors connects students with qualified, caring tutors for every subject and every level — all in one place.",
      workingWith: "Working With",
      families: "Families",
      students: "Students",
      professionalTutors: "Professional Tutors",
      tutorsDescription:
        "Professional Tutors who have shown great impact on their students",
    },
    // About Section
    about: {
      title: "Who are We",
      description:
        "At Hyab Tutors, we believe that every student deserves access to the right support — someone who understands their challenges, inspires their curiosity, and guides them toward real progress. Founded with a deep commitment to academic excellence and accessibility, our platform connects families with trusted, qualified tutors across a wide range of subjects.",
      yearsExperience: "Years of Experience",
      trustingFamilies: "Trusting Families",
      successfulStudents: "Successful Students Exceeding in Academics",
    },
    testimonials: {
      title: "What our Clients Say About Us?",
      subtitle:
        "Hear directly from students and parents who've experienced the Hyab Tutors difference. These real stories show how the right support can change everything.",
    },
    // Tutors Section
    tutors: {
      title: "Meet Our",
      titleHighlight: "Tutors",
      subtitle:
        "Our tutors are highly qualified educators passionate about helping students succeed.",
    },
    // More & Contact
    more: {
      title: "More By Hyab",
      contactTitle: "Contact Us",
      email: "Email",
      phone: "Phone",
      address: "Address",
    },
    // Footer
    footer: {
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      copyright: "© 2024 Hyab Tutors. All rights reserved.",
    },
  },
  am: {
    // Navbar - Amharic
    nav: {
      home: "መነሻ",
      about: "ስለ እኛ",
      testimonials: "አስታየቶች",
      tutors: "አስጠኚዎች",
      contact: "አግኙን",
      applyTutor: "እንደ እስጠኚ ያመልክቱ",
      bookTutor: "አስጠኚ ይያዙ",
    },
    // Hero Section - Amharic
    hero: {
      title: "የልጅዎ",
      titleHighlight: "የትምህርት",
      titleEnd: "ጉዞ እዚህ ይጀምራል።",
      subtitle:
        "ሕያብ አስጠኚዎች ተማሪዎችን ለእያንዳንዱ ትምህርት እና ደረጃ ብቁ እና ተንከባካቢ አስጠኚዎችን ያገናኛል ሁሉም በአንድ ቦታ።",
      workingWith: "ፍሬዎቻችን",
      families: "ቤተሰቦች",
      students: "ተማሪዎች",
      professionalTutors: "ባለሙያ አስጠኚዎች",
      tutorsDescription: "በተማሪዎቻቸው ላይ ትልቅ ተጽዕኖ ያሳዩ የተመሰከረላቸው አስጠኚዎች",
    },
    // About Section - Amharic
    about: {
      title: "እኛ ማን ነን",
      description:
        "በሕያብ አስጠኚዎች፣ እያንዳንዱ ተማሪ ትክክለኛውን ድጋፍ ማግኘት እንዳለበት እናምናለን። ፈተናዎቻቸውን የሚረዱ፣ ጉጉትን የሚያነቃቁ እና ወደ እውነተኛ እድገት የሚመራቸው። በአካዳሚክ ትምህርት ምርጫነት እና ተደራሽነት ላይ ጥልቅ ቁርጠኝነት የተመሰረተ ስርዓታችን ቤተሰቦችን በተለያዩ የትምህርት ዘርፎች ውስጥ ከታመኑ ብቁ አስጠኚዎች ጋር ያገናኛል።",
      yearsExperience: "ዓመታት ልምድ",
      trustingFamilies: "የሚተማመኑብን ቤተሰቦች",
      successfulStudents: "በትምህርት ዘርፍ ጎልተው የሚታዩ ስኬታማ ተማሪዎች",
    },
    // Testimonials - Amharic
    testimonials: {
      title: "ደንበኞቻችን ስለ እኛ ምን ይላሉ?",
      subtitle:
        "የሕያብ አስጠኚዎችን ልዩነት ያጋጠሙ ተማሪዎች እና ወላጆች በቀጥታ ይስማዏቸው። እነዚህ እውነተኛ ታሪኮች ትክክለኛው ድጋፍ ሁሉንም ነገር መለወጥ እንደሚችል ያሳያሉ።",
    },
    // Tutors Section - Amharic
    tutors: {
      title: "የእኛን",
      titleHighlight: "አስጠኚዎች",
      subtitle: "የእኛ አስጠኚዎች ተማሪዎች እንዲሳኩ የሚረዳ ጉጉ ሆነው የተማሩ ብቁ አስጠኚዎች ናቸው።",
    },
    // More & Contact - Amharic
    more: {
      title: "ተጨማሪ በሕያብ",
      contactTitle: "አግኙን",
      email: "ኢሜይል",
      phone: "ስልክ",
      address: "አድራሻ",
    },
    // Footer - Amharic
    footer: {
      quickLinks: "ፈጣን አገናኞች",
      followUs: "ይከተሉን",
      copyright: "© 2024 ሕያብ አስጠኚዎች። ሁሉም መብቶች የተጠበቁ ናቸው።",
    },
  },
};

let current = "en";
const listeners = new Set();

export const setLanguage = (lang) => {
  if (translations[lang]) {
    current = lang;
    // Persist language preference
    localStorage.setItem("preferred_language", lang);
    listeners.forEach((cb) => cb(current));
  }
};

export const getCurrentLanguage = () => current;

// Initialize language from localStorage on load
const savedLang = localStorage.getItem("preferred_language");
if (savedLang && translations[savedLang]) {
  current = savedLang;
}

export const t = (path, fallback) => {
  const parts = path.split(".");
  let node = translations[current];
  for (const p of parts) {
    if (!node) return fallback || path;
    node = node[p];
  }
  return node || fallback || path;
};

export const onLanguageChange = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export default { t, setLanguage, getCurrentLanguage, onLanguageChange };
