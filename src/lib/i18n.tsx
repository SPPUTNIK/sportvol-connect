import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr" | "ar";

export const languages: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "EN", native: "English" },
  { code: "fr", label: "FR", native: "Français" },
  { code: "ar", label: "AR", native: "العربية" },
];

type Dict = {
  nav: { mission: string; events: string; journey: string; stories: string; faq: string; join: string; menu: string; tagline: string };
  hero: {
    eyebrow: string;
    titleLines: [string, string];
    titleAccent: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: { value: string; label: string }[];
    watchTitle: string;
    watchSub: string;
  };
};

export const dict: Record<Lang, Dict> = {
  en: {
    nav: {
      mission: "Mission",
      events: "Events",
      journey: "Journey",
      stories: "Stories",
      faq: "FAQ",
      join: "Join now",
      menu: "Toggle menu",
      tagline: "Morocco",
    },
    hero: {
      eyebrow: "Together, every event is possible",
      titleLines: ["Morocco's Largest", "Sports Volunteer"],
      titleAccent: "Platform",
      lead: "Join thousands of passionate volunteers creating unforgettable sporting events across Morocco — from Rabat's marathon lanes to the Atlas climbs.",
      ctaPrimary: "Become a volunteer",
      ctaSecondary: "Organize an event",
      stats: [
        { value: "12,400+", label: "Active volunteers" },
        { value: "310", label: "Events staffed" },
        { value: "64", label: "Partner federations" },
        { value: "148K", label: "Volunteer hours" },
      ],
      watchTitle: "Watch the impact",
      watchSub: "90 seconds inside a race day",
    },
  },
  fr: {
    nav: {
      mission: "Mission",
      events: "Événements",
      journey: "Parcours",
      stories: "Témoignages",
      faq: "FAQ",
      join: "Rejoindre",
      menu: "Ouvrir le menu",
      tagline: "Maroc",
    },
    hero: {
      eyebrow: "Ensemble, chaque événement est possible",
      titleLines: ["La plus grande", "plateforme de bénévoles"],
      titleAccent: "sportifs du Maroc",
      lead: "Rejoignez des milliers de bénévoles passionnés qui créent des événements sportifs inoubliables partout au Maroc — des avenues du marathon de Rabat aux sommets de l'Atlas.",
      ctaPrimary: "Devenir bénévole",
      ctaSecondary: "Organiser un événement",
      stats: [
        { value: "12 400+", label: "Bénévoles actifs" },
        { value: "310", label: "Événements encadrés" },
        { value: "64", label: "Fédérations partenaires" },
        { value: "148K", label: "Heures de bénévolat" },
      ],
      watchTitle: "Voir l'impact",
      watchSub: "90 secondes au cœur d'une course",
    },
  },
  ar: {
    nav: {
      mission: "رسالتنا",
      events: "الفعاليات",
      journey: "المسار",
      stories: "قصص",
      faq: "أسئلة شائعة",
      join: "انضم الآن",
      menu: "فتح القائمة",
      tagline: "المغرب",
    },
    hero: {
      eyebrow: "معًا، كل حدث ممكن",
      titleLines: ["أكبر منصة", "للمتطوعين"],
      titleAccent: "الرياضيين بالمغرب",
      lead: "انضم إلى آلاف المتطوعين الشغوفين الذين يصنعون فعاليات رياضية لا تُنسى في جميع أنحاء المغرب — من مسارات ماراطون الرباط إلى قمم الأطلس.",
      ctaPrimary: "كن متطوعًا",
      ctaSecondary: "نظّم فعالية",
      stats: [
        { value: "+12,400", label: "متطوع نشيط" },
        { value: "310", label: "فعالية مؤطرة" },
        { value: "64", label: "جامعة شريكة" },
        { value: "148K", label: "ساعة تطوع" },
      ],
      watchTitle: "شاهد الأثر",
      watchSub: "٩٠ ثانية داخل يوم السباق",
    },
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; dir: "rtl" | "ltr"; t: Dict };

const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, dir: "ltr", t: dict.en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sportvol-lang") as Lang | null;
    if (saved && saved in dict) setLang(saved);
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("sportvol-lang", lang);
  }, [lang, dir]);

  return (
    <I18nContext.Provider value={{ lang, setLang, dir, t: dict[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
