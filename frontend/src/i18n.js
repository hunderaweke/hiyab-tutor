const translations = {
  en: {
    testimonials: {
      title: "What our Clients Say About Us?",
      subtitle:
        "Hear directly from students and parents who’ve experienced the Hiyab Tutors difference. These real stories show how the right support can change everything.",
    },
    more: {
      title: "More By Hiyab",
      contactTitle: "Contact Us",
    },
  },
  am: {
    testimonials: {
      title: "የደንበኞቻችን እንዴት ሲናገሩ?",
      subtitle:
        "በHiyab Tutors ያገኙትን ተማሪዎች እና ወላጆች በቀጥታ ያድርጉትን ማስማር ይህ እውነታን ይገልጻል።",
    },
    more: {
      title: "ተጨማሪ በHiyab",
      contactTitle: "አካል እና የግንኙነት መረጃ",
    },
  },
};

let current = "en";
const listeners = new Set();
export const setLanguage = (lang) => {
  if (translations[lang]) {
    current = lang;
    listeners.forEach((cb) => cb(current));
  }
};
export const t = (path) => {
  const parts = path.split(".");
  let node = translations[current];
  for (const p of parts) {
    if (!node) return path;
    node = node[p];
  }
  return node || path;
};
export const onLanguageChange = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
export default { t, setLanguage, onLanguageChange };
