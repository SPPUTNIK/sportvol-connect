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
    stats: { value: string; label: string }[];
    watchTitle: string;
    watchSub: string;
  };
  trusted: { label: string };
  mission: {
    eyebrow: string;
    titleLines: [string, string];
    body: string;
    points: [string, string, string];
    cta: string;
    cardLabel: string;
    cardDelta: string;
  };
  why: {
    eyebrow: string;
    titleLine: string;
    titleSub: string;
    items: { title: string; body: string }[];
  };
  events: {
    eyebrow: string;
    titleLines: [string, string];
    prev: string;
    next: string;
    needed: string;
    registered: string;
    apply: string;
    items: { tag: string; title: string; city: string; date: string }[];
  };
  journey: {
    eyebrow: string;
    titleLines: [string, string];
    body: string;
    cta: string;
    steps: { title: string; body: string }[];
  };
  impact: {
    eyebrow: string;
    titleLines: [string, string];
    labels: [string, string, string, string];
    growthEyebrow: string;
    growthBody: string;
  };
  stories: {
    eyebrow: string;
    titleLines: [string, string];
    prev: string;
    next: string;
    items: { quote: string; name: string; role: string }[];
  };
  gallery: {
    eyebrow: string;
    titleLines: [string, string];
    body: string;
    nextSeason: string;
    nextSeasonBody: string;
    browse: string;
  };
  faq: {
    eyebrow: string;
    titleLines: [string, string];
    items: { q: string; a: string }[];
  };
  cta: { eyebrow: string; titleLines: [string, string]; primary: string };
  join: {
    title: string;
    body: string;
    name: string;
    email: string;
    city: string;
    role: string;
    submit: string;
    close: string;
    successTitle: string;
    successBody: string;
  };
  footer: {
    blurb: string;
    newsletter: string;
    placeholder: string;
    subscribe: string;
    sent: string;
    columns: { title: string; links: string[] }[];
    rights: string;
    built: string;
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
      tagline: "Moroccan Sports Volunteers",
    },
    hero: {
      eyebrow: "Together, every event is possible",
      titleLines: ["Morocco's Largest", "Sports Volunteer"],
      titleAccent: "Platform",
      lead: "Join thousands of passionate volunteers creating unforgettable sporting events across Morocco — from Rabat's marathon lanes to the Atlas climbs.",
      ctaPrimary: "Become a volunteer",
      stats: [
        { value: "12,400+", label: "Active volunteers" },
        { value: "310", label: "Events staffed" },
        { value: "64", label: "Partner federations" },
        { value: "148K", label: "Volunteer hours" },
      ],
      watchTitle: "Watch the impact",
      watchSub: "90 seconds inside a race day",
    },
    trusted: { label: "Trusted by" },
    mission: {
      eyebrow: "Our mission",
      titleLines: ["We believe sport runs", "on the people beside it."],
      body: "VolunSport is the operating layer between organizers and the people who make race day happen. Not charity — infrastructure. Built in Morocco, for the clubs, federations and cities shaping its sporting decade.",
      points: [
        "Match volunteers to events by skill, city and availability",
        "Federation-grade scheduling, briefings and accreditation",
        "Verified hours that turn into real certificates",
      ],
      cta: "How it works",
      cardLabel: "Lives impacted",
      cardDelta: "vs last season",
    },
    why: {
      eyebrow: "Why volunteer",
      titleLine: "More than volunteering.",
      titleSub: "A life experience.",
      items: [
        { title: "Leadership", body: "Run zones, brief crews and take real decisions under real pressure." },
        { title: "Network", body: "Stand shoulder to shoulder with federations, clubs and athletes." },
        { title: "Experience", body: "Operations know-how you cannot get from a classroom." },
        { title: "Certificates", body: "Every verified hour becomes a credential you can actually use." },
        { title: "Community", body: "A crew that reunites season after season, city after city." },
        { title: "Career", body: "Direct pipeline into event management and sports-tech roles." },
      ],
    },
    events: {
      eyebrow: "Events",
      titleLines: ["Don't miss the", "next big start line."],
      prev: "Previous events",
      next: "Next events",
      needed: "volunteers needed",
      registered: "registered",
      apply: "Apply",
      items: [
        { tag: "Marathon", title: "Rabat Coastal Marathon", city: "Rabat", date: "12 Oct" },
        { tag: "Football", title: "Atlantic University Cup", city: "Casablanca", date: "19 Oct" },
        { tag: "Cycling", title: "Atlas Ridge Challenge", city: "Marrakech", date: "26 Oct" },
        { tag: "Basketball", title: "Northern League Finals", city: "Tangier", date: "02 Nov" },
      ],
    },
    journey: {
      eyebrow: "Volunteer journey",
      titleLines: ["Your journey", "starts here."],
      body: "Six steps between curiosity and standing on the start line with a crew that counts on you.",
      cta: "Join the community",
      steps: [
        { title: "Register", body: "Create your free profile in under two minutes." },
        { title: "Profile", body: "Tell us your skills, languages and city." },
        { title: "Training", body: "Short online modules per event discipline." },
        { title: "Apply", body: "Pick events that match your availability." },
        { title: "Volunteer", body: "Show up, get briefed, run your zone." },
        { title: "Certify", body: "Verified hours and a signed certificate." },
      ],
    },
    impact: {
      eyebrow: "Our impact",
      titleLines: ["Impact, in numbers", "that keep moving."],
      labels: ["Active volunteers", "Events organized", "Partner organizations", "Volunteer hours"],
      growthEyebrow: "Growth curve",
      growthBody:
        "Four seasons ago VolunSport staffed a single city race. Today it coordinates crews across twelve regions, with retention above 70% year over year.",
    },
    stories: {
      eyebrow: "Volunteer stories",
      titleLines: ["What the crew", "actually says."],
      prev: "Previous story",
      next: "Next story",
      items: [
        {
          quote:
            "I signed up for one weekend at the coastal marathon and ended up leading a hydration zone of nineteen people. It rewired how I see my own city.",
          name: "Yassine El Amrani",
          role: "Volunteer since 2022 · Rabat",
        },
        {
          quote:
            "The briefing packs are better than at events I've been paid to work. Everyone knows their zone before the sun comes up.",
          name: "Salma Bennani",
          role: "Zone lead · Casablanca",
        },
        {
          quote:
            "My certified hours went straight onto my CV. Three months later I was hired by a race organizer in Marrakech.",
          name: "Omar Tazi",
          role: "Volunteer since 2023 · Marrakech",
        },
      ],
    },
    gallery: {
      eyebrow: "Field notes",
      titleLines: ["Race days, from", "the inside."],
      body: "Twelve regions. Nine disciplines. One crew that shows up before sunrise and leaves after the last athlete.",
      nextSeason: "Next season",
      nextSeasonBody: "events already open for volunteer applications across twelve regions.",
      browse: "Browse events",
    },
    faq: {
      eyebrow: "Questions",
      titleLines: ["Everything you", "might ask."],
      items: [
        {
          q: "Do I need sports experience to volunteer?",
          a: "No. Most roles need reliability and a good attitude, not athletic background. Every event includes a short online module and an on-site briefing.",
        },
        {
          q: "How much time does a typical event take?",
          a: "Between four and ten hours, usually across a single day. You choose the shifts that match your availability when you apply.",
        },
        {
          q: "Is volunteering paid?",
          a: "Roles are unpaid, but organizers cover meals, transport in most cities and full kit. Your hours are certified and count toward the VolunSport credential.",
        },
        {
          q: "Can my club or federation list an event?",
          a: "Yes. Organizers get a scheduling workspace, accreditation tools and access to the volunteer pool filtered by skill, language and city.",
        },
        {
          q: "What languages are supported?",
          a: "Darija, Arabic, French and English across briefings, the platform and event documentation.",
        },
      ],
    },
    cta: {
      eyebrow: "Ready when you are",
      titleLines: ["Be part of something", "bigger than the score."],
      primary: "Become a volunteer",
    },
    join: {
      title: "Join VolunSport",
      body: "Create your volunteer profile — we'll match you with events in your city.",
      name: "Full name",
      email: "Email",
      city: "City",
      role: "Preferred role",
      submit: "Create my profile",
      close: "Close",
      successTitle: "You're in!",
      successBody: "Check your inbox — your first event matches are on the way.",
    },
    footer: {
      blurb: "The operating layer connecting volunteers with sporting events across Morocco.",
      newsletter: "Stay updated",
      placeholder: "your@email.com",
      subscribe: "Subscribe",
      sent: "You're on the list. See you at the start line.",
      columns: [
        { title: "Platform", links: ["Events", "Volunteers", "Organizations", "About"] },
        { title: "Resources", links: ["Volunteer guide", "Training", "Journal", "Press"] },
        { title: "Support", links: ["Help center", "Privacy", "Terms", "Cookies"] },
      ],
      rights: "All rights reserved.",
      built: "Built in Casablanca.",
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
      tagline: "Bénévoles sportifs du Maroc",
    },
    hero: {
      eyebrow: "Ensemble, chaque événement est possible",
      titleLines: ["La plus grande", "plateforme de bénévoles"],
      titleAccent: "sportifs du Maroc",
      lead: "Rejoignez des milliers de bénévoles passionnés qui créent des événements sportifs inoubliables partout au Maroc — des avenues du marathon de Rabat aux sommets de l'Atlas.",
      ctaPrimary: "Devenir bénévole",
      stats: [
        { value: "12 400+", label: "Bénévoles actifs" },
        { value: "310", label: "Événements encadrés" },
        { value: "64", label: "Fédérations partenaires" },
        { value: "148K", label: "Heures de bénévolat" },
      ],
      watchTitle: "Voir l'impact",
      watchSub: "90 secondes au cœur d'une course",
    },
    trusted: { label: "Ils nous font confiance" },
    mission: {
      eyebrow: "Notre mission",
      titleLines: ["Le sport avance grâce", "à celles et ceux qui l'entourent."],
      body: "VolunSport est la couche opérationnelle entre les organisateurs et celles et ceux qui font vivre le jour de course. Pas de la charité — de l'infrastructure. Conçu au Maroc, pour les clubs, fédérations et villes qui écrivent sa décennie sportive.",
      points: [
        "Associer les bénévoles aux événements selon compétences, ville et disponibilité",
        "Planification, briefings et accréditation aux standards des fédérations",
        "Des heures vérifiées transformées en véritables certificats",
      ],
      cta: "Comment ça marche",
      cardLabel: "Vies impactées",
      cardDelta: "vs saison dernière",
    },
    why: {
      eyebrow: "Pourquoi être bénévole",
      titleLine: "Plus que du bénévolat.",
      titleSub: "Une expérience de vie.",
      items: [
        { title: "Leadership", body: "Gérez des zones, briefez des équipes et décidez sous pression réelle." },
        { title: "Réseau", body: "Côtoyez fédérations, clubs et athlètes au quotidien." },
        { title: "Expérience", body: "Un savoir-faire opérationnel qu'aucune salle de cours n'enseigne." },
        { title: "Certificats", body: "Chaque heure vérifiée devient une attestation utile." },
        { title: "Communauté", body: "Une équipe qui se retrouve saison après saison, ville après ville." },
        { title: "Carrière", body: "Une passerelle directe vers les métiers de l'événementiel sportif." },
      ],
    },
    events: {
      eyebrow: "Événements",
      titleLines: ["Ne manquez pas", "la prochaine ligne de départ."],
      prev: "Événements précédents",
      next: "Événements suivants",
      needed: "bénévoles recherchés",
      registered: "inscrits",
      apply: "Postuler",
      items: [
        { tag: "Marathon", title: "Marathon Côtier de Rabat", city: "Rabat", date: "12 Oct" },
        { tag: "Football", title: "Coupe Universitaire Atlantique", city: "Casablanca", date: "19 Oct" },
        { tag: "Cyclisme", title: "Défi des Crêtes de l'Atlas", city: "Marrakech", date: "26 Oct" },
        { tag: "Basketball", title: "Finales de la Ligue du Nord", city: "Tanger", date: "02 Nov" },
      ],
    },
    journey: {
      eyebrow: "Parcours du bénévole",
      titleLines: ["Votre parcours", "commence ici."],
      body: "Six étapes entre la curiosité et la ligne de départ, aux côtés d'une équipe qui compte sur vous.",
      cta: "Rejoindre la communauté",
      steps: [
        { title: "Inscription", body: "Créez votre profil gratuit en moins de deux minutes." },
        { title: "Profil", body: "Indiquez vos compétences, langues et ville." },
        { title: "Formation", body: "De courts modules en ligne par discipline." },
        { title: "Candidature", body: "Choisissez les événements selon vos disponibilités." },
        { title: "Bénévolat", body: "Présentez-vous, recevez le briefing, tenez votre zone." },
        { title: "Certification", body: "Heures vérifiées et certificat signé." },
      ],
    },
    impact: {
      eyebrow: "Notre impact",
      titleLines: ["L'impact, en chiffres", "qui ne cessent de grimper."],
      labels: ["Bénévoles actifs", "Événements organisés", "Organisations partenaires", "Heures de bénévolat"],
      growthEyebrow: "Courbe de croissance",
      growthBody:
        "Il y a quatre saisons, VolunSport encadrait une seule course. Aujourd'hui, des équipes coordonnées dans douze régions, avec plus de 70% de fidélisation d'une année sur l'autre.",
    },
    stories: {
      eyebrow: "Témoignages",
      titleLines: ["Ce que l'équipe", "en dit vraiment."],
      prev: "Témoignage précédent",
      next: "Témoignage suivant",
      items: [
        {
          quote:
            "Je m'étais inscrit pour un week-end au marathon côtier et j'ai fini par diriger une zone de ravitaillement de dix-neuf personnes. Ça a changé mon regard sur ma ville.",
          name: "Yassine El Amrani",
          role: "Bénévole depuis 2022 · Rabat",
        },
        {
          quote:
            "Les briefings sont meilleurs que sur des événements où j'étais payée. Chacun connaît sa zone avant le lever du soleil.",
          name: "Salma Bennani",
          role: "Responsable de zone · Casablanca",
        },
        {
          quote:
            "Mes heures certifiées sont allées droit sur mon CV. Trois mois plus tard, un organisateur de Marrakech m'a recruté.",
          name: "Omar Tazi",
          role: "Bénévole depuis 2023 · Marrakech",
        },
      ],
    },
    gallery: {
      eyebrow: "Carnet de terrain",
      titleLines: ["Les jours de course,", "vus de l'intérieur."],
      body: "Douze régions. Neuf disciplines. Une équipe présente avant le lever du soleil et partie après le dernier athlète.",
      nextSeason: "Saison prochaine",
      nextSeasonBody: "événements déjà ouverts aux candidatures dans douze régions.",
      browse: "Voir les événements",
    },
    faq: {
      eyebrow: "Questions",
      titleLines: ["Tout ce que vous", "pourriez demander."],
      items: [
        {
          q: "Faut-il une expérience sportive pour être bénévole ?",
          a: "Non. La plupart des rôles demandent de la fiabilité et une bonne attitude, pas un passé d'athlète. Chaque événement comprend un module en ligne et un briefing sur place.",
        },
        {
          q: "Combien de temps prend un événement ?",
          a: "Entre quatre et dix heures, généralement sur une seule journée. Vous choisissez les créneaux selon vos disponibilités.",
        },
        {
          q: "Le bénévolat est-il rémunéré ?",
          a: "Les missions ne sont pas rémunérées, mais les organisateurs couvrent les repas, le transport dans la plupart des villes et la tenue complète. Vos heures sont certifiées.",
        },
        {
          q: "Mon club ou ma fédération peut-il publier un événement ?",
          a: "Oui. Les organisateurs disposent d'un espace de planification, d'outils d'accréditation et du vivier de bénévoles filtré par compétence, langue et ville.",
        },
        {
          q: "Quelles langues sont prises en charge ?",
          a: "Darija, arabe, français et anglais pour les briefings, la plateforme et la documentation.",
        },
      ],
    },
    cta: {
      eyebrow: "Quand vous voulez",
      titleLines: ["Faites partie de plus grand", "que le score final."],
      primary: "Devenir bénévole",
    },
    join: {
      title: "Rejoindre VolunSport",
      body: "Créez votre profil de bénévole — nous vous proposerons des événements dans votre ville.",
      name: "Nom complet",
      email: "E-mail",
      city: "Ville",
      role: "Rôle souhaité",
      submit: "Créer mon profil",
      close: "Fermer",
      successTitle: "C'est fait !",
      successBody: "Consultez votre boîte mail — vos premiers événements arrivent.",
    },
    footer: {
      blurb: "La couche opérationnelle qui relie les bénévoles aux événements sportifs du Maroc.",
      newsletter: "Restez informé",
      placeholder: "votre@email.com",
      subscribe: "S'abonner",
      sent: "Vous êtes inscrit. À bientôt sur la ligne de départ.",
      columns: [
        { title: "Plateforme", links: ["Événements", "Bénévoles", "Organisations", "À propos"] },
        { title: "Ressources", links: ["Guide du bénévole", "Formation", "Journal", "Presse"] },
        { title: "Support", links: ["Centre d'aide", "Confidentialité", "Conditions", "Cookies"] },
      ],
      rights: "Tous droits réservés.",
      built: "Conçu à Casablanca.",
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
      tagline: "متطوعو الرياضة بالمغرب",
    },
    hero: {
      eyebrow: "معًا، كل حدث ممكن",
      titleLines: ["أكبر منصة", "للمتطوعين"],
      titleAccent: "الرياضيين بالمغرب",
      lead: "انضم إلى آلاف المتطوعين الشغوفين الذين يصنعون فعاليات رياضية لا تُنسى في جميع أنحاء المغرب — من مسارات ماراطون الرباط إلى قمم الأطلس.",
      ctaPrimary: "كن متطوعًا",
      stats: [
        { value: "+12,400", label: "متطوع نشيط" },
        { value: "310", label: "فعالية مؤطرة" },
        { value: "64", label: "جامعة شريكة" },
        { value: "148K", label: "ساعة تطوع" },
      ],
      watchTitle: "شاهد الأثر",
      watchSub: "٩٠ ثانية داخل يوم السباق",
    },
    trusted: { label: "شركاؤنا" },
    mission: {
      eyebrow: "رسالتنا",
      titleLines: ["الرياضة تنهض", "بالناس الذين يقفون بجانبها."],
      body: "فولنسبورت هي الطبقة التشغيلية بين المنظمين والأشخاص الذين يصنعون يوم السباق. ليست عملًا خيريًا — بل بنية تحتية. صُنعت في المغرب، للأندية والجامعات والمدن التي تصنع عقده الرياضي.",
      points: [
        "مطابقة المتطوعين مع الفعاليات حسب المهارة والمدينة والتوفر",
        "جدولة وإحاطات واعتمادات بمعايير الجامعات الرياضية",
        "ساعات موثقة تتحول إلى شهادات حقيقية",
      ],
      cta: "كيف تعمل المنصة",
      cardLabel: "حياة تأثرت",
      cardDelta: "مقارنة بالموسم الماضي",
    },
    why: {
      eyebrow: "لماذا التطوع",
      titleLine: "أكثر من مجرد تطوع.",
      titleSub: "تجربة حياة.",
      items: [
        { title: "القيادة", body: "أدر المناطق، وأحط الفرق، واتخذ قرارات حقيقية تحت ضغط حقيقي." },
        { title: "شبكة علاقات", body: "اعمل جنبًا إلى جنب مع الجامعات والأندية والرياضيين." },
        { title: "خبرة", body: "معرفة تشغيلية لا تُكتسب في قاعة الدرس." },
        { title: "شهادات", body: "كل ساعة موثقة تصبح مؤهلاً يمكنك استعماله فعلاً." },
        { title: "مجتمع", body: "فريق يلتقي موسمًا بعد موسم، ومدينة بعد مدينة." },
        { title: "مسار مهني", body: "طريق مباشر نحو وظائف تنظيم الفعاليات وتقنيات الرياضة." },
      ],
    },
    events: {
      eyebrow: "الفعاليات",
      titleLines: ["لا تفوّت", "خط الانطلاق القادم."],
      prev: "الفعاليات السابقة",
      next: "الفعاليات التالية",
      needed: "متطوع مطلوب",
      registered: "مسجّل",
      apply: "التقديم",
      items: [
        { tag: "ماراطون", title: "ماراطون الرباط الساحلي", city: "الرباط", date: "12 أكتوبر" },
        { tag: "كرة القدم", title: "كأس الجامعات الأطلسية", city: "الدار البيضاء", date: "19 أكتوبر" },
        { tag: "دراجات", title: "تحدي مرتفعات الأطلس", city: "مراكش", date: "26 أكتوبر" },
        { tag: "كرة السلة", title: "نهائيات دوري الشمال", city: "طنجة", date: "02 نونبر" },
      ],
    },
    journey: {
      eyebrow: "مسار المتطوع",
      titleLines: ["مسارك", "يبدأ من هنا."],
      body: "ست خطوات بين الفضول والوقوف على خط الانطلاق مع فريق يعتمد عليك.",
      cta: "انضم إلى المجتمع",
      steps: [
        { title: "التسجيل", body: "أنشئ ملفك المجاني في أقل من دقيقتين." },
        { title: "الملف", body: "أخبرنا بمهاراتك ولغاتك ومدينتك." },
        { title: "التكوين", body: "وحدات قصيرة عبر الإنترنت لكل تخصص." },
        { title: "الترشيح", body: "اختر الفعاليات التي تناسب أوقاتك." },
        { title: "التطوع", body: "احضر، تلقَّ الإحاطة، وأدر منطقتك." },
        { title: "التوثيق", body: "ساعات موثقة وشهادة موقعة." },
      ],
    },
    impact: {
      eyebrow: "أثرنا",
      titleLines: ["الأثر بالأرقام", "التي لا تتوقف."],
      labels: ["متطوع نشيط", "فعالية منظمة", "منظمة شريكة", "ساعة تطوع"],
      growthEyebrow: "منحنى النمو",
      growthBody:
        "قبل أربعة مواسم أطّرت فولنسبورت سباقًا واحدًا. اليوم تنسق فرقًا في اثنتي عشرة جهة، بنسبة استمرار تفوق 70% سنويًا.",
    },
    stories: {
      eyebrow: "قصص المتطوعين",
      titleLines: ["ما يقوله", "الفريق فعلاً."],
      prev: "القصة السابقة",
      next: "القصة التالية",
      items: [
        {
          quote:
            "سجّلت لعطلة أسبوع واحدة في الماراطون الساحلي وانتهى بي الأمر أقود منطقة تزويد بالماء من تسعة عشر شخصًا. غيّرت نظرتي لمدينتي.",
          name: "ياسين العمراني",
          role: "متطوع منذ 2022 · الرباط",
        },
        {
          quote: "ملفات الإحاطة أفضل من فعاليات اشتغلت فيها بأجر. الجميع يعرف منطقته قبل شروق الشمس.",
          name: "سلمى بنعني",
          role: "مسؤولة منطقة · الدار البيضاء",
        },
        {
          quote: "ساعاتي الموثقة ذهبت مباشرة إلى سيرتي الذاتية. بعد ثلاثة أشهر وظفني منظم سباقات بمراكش.",
          name: "عمر التازي",
          role: "متطوع منذ 2023 · مراكش",
        },
      ],
    },
    gallery: {
      eyebrow: "من الميدان",
      titleLines: ["أيام السباق", "من الداخل."],
      body: "اثنتا عشرة جهة. تسعة تخصصات. فريق واحد يحضر قبل الشروق ويغادر بعد آخر رياضي.",
      nextSeason: "الموسم القادم",
      nextSeasonBody: "فعالية مفتوحة بالفعل لترشيحات المتطوعين في اثنتي عشرة جهة.",
      browse: "تصفح الفعاليات",
    },
    faq: {
      eyebrow: "أسئلة",
      titleLines: ["كل ما قد", "تسأل عنه."],
      items: [
        {
          q: "هل أحتاج خبرة رياضية للتطوع؟",
          a: "لا. أغلب الأدوار تتطلب الالتزام وحسن التعامل، لا خلفية رياضية. كل فعالية تتضمن وحدة قصيرة عبر الإنترنت وإحاطة ميدانية.",
        },
        {
          q: "كم يستغرق الحدث عادة؟",
          a: "بين أربع وعشر ساعات، غالبًا في يوم واحد. تختار الفترات التي تناسبك عند الترشيح.",
        },
        {
          q: "هل التطوع مدفوع الأجر؟",
          a: "الأدوار غير مدفوعة، لكن المنظمين يوفرون الوجبات والتنقل في أغلب المدن والزي الكامل. ساعاتك موثقة وتحتسب ضمن شهادة فولنسبورت.",
        },
        {
          q: "هل يمكن لناديي أو جامعتي نشر فعالية؟",
          a: "نعم. يحصل المنظمون على مساحة جدولة وأدوات اعتماد وولوج إلى قاعدة المتطوعين حسب المهارة واللغة والمدينة.",
        },
        {
          q: "ما هي اللغات المدعومة؟",
          a: "الدارجة والعربية والفرنسية والإنجليزية في الإحاطات والمنصة ووثائق الفعاليات.",
        },
      ],
    },
    cta: {
      eyebrow: "جاهزون متى شئت",
      titleLines: ["كن جزءًا من شيء", "أكبر من النتيجة."],
      primary: "كن متطوعًا",
    },
    join: {
      title: "انضم إلى فولنسبورت",
      body: "أنشئ ملف المتطوع الخاص بك — سنقترح عليك فعاليات في مدينتك.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      city: "المدينة",
      role: "الدور المفضل",
      submit: "إنشاء ملفي",
      close: "إغلاق",
      successTitle: "تم تسجيلك!",
      successBody: "تفقد بريدك — أولى الفعاليات المقترحة في الطريق.",
    },
    footer: {
      blurb: "الطبقة التشغيلية التي تربط المتطوعين بالفعاليات الرياضية في كل أنحاء المغرب.",
      newsletter: "ابق على اطلاع",
      placeholder: "بريدك@مثال.com",
      subscribe: "اشترك",
      sent: "تم تسجيلك. نراك على خط الانطلاق.",
      columns: [
        { title: "المنصة", links: ["الفعاليات", "المتطوعون", "المنظمات", "من نحن"] },
        { title: "موارد", links: ["دليل المتطوع", "التكوين", "المدونة", "الصحافة"] },
        { title: "الدعم", links: ["مركز المساعدة", "الخصوصية", "الشروط", "الكوكيز"] },
      ],
      rights: "جميع الحقوق محفوظة.",
      built: "صُنع في الدار البيضاء.",
    },
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; dir: "rtl" | "ltr"; t: Dict };

const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, dir: "ltr", t: dict.en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("volunsport-lang") as Lang | null;
    if (saved && saved in dict) setLang(saved);
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("volunsport-lang", lang);
  }, [lang, dir]);

  return (
    <I18nContext.Provider value={{ lang, setLang, dir, t: dict[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
