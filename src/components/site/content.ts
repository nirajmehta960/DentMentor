/**
 * Every word on the landing page.
 *
 * Nothing here invents a customer, quote, endorsement or metric. Numbers come
 * from the database at runtime (`use-landing-data.ts`) and are hidden below
 * `STAT_FLOORS`. Product facts are taken from the product itself: service types
 * and durations from `onboarding/ServicesOfferedStep.tsx`, the 24-hour meeting
 * link and reschedule window from `booking/BookingConfirmation.tsx`, and mentor
 * eligibility (U.S. dental students and graduates; document verification is
 * optional, so the copy only claims the verified badge) from mentor onboarding.
 *
 * Every value in `LANDING_ROUTES` must match an `id` on a rendered band — a
 * stale anchor scrolls nowhere and looks like a dead link. A test checks this.
 */

export const LANDING_ROUTES = {
  top: "#top",
  product: "#product",
  mentors: "#mentors",
  services: "#services",
  howItWorks: "#how-it-works",
  faq: "#faq",
  start: "#start",
} as const;

/** Label for account CTAs once someone is signed in — see `routes.account`. */
export const SIGNED_IN_CTA = "Go to dashboard";

export const LANDING_META = {
  title: "DentMentor — Mentorship for international dentists",
  description:
    "Book 1:1 sessions with U.S. dental students and graduates for SOP reviews, mock interviews, CV reviews and application strategy.",
  url: "https://dentmentor.com/",
} as const;

/**
 * A stat renders only at or above its floor, so an early-stage number never
 * reads as weak and a failed query never reads as "0".
 */
export const STAT_FLOORS = {
  verifiedMentors: 10,
  sessionsCompleted: 25,
  countries: 5,
} as const;

/* ── HERO ─────────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Mentorship for international dentists",
  heading: ["Your path to U.S. dentistry,", "guided by those who walked it."],
  supporting:
    "Book 1:1 sessions with U.S. dental students and graduates who've been through it — for SOP reviews, mock interviews, CV reviews and application strategy.",
  primaryCta: "Find your mentor",
  secondaryCta: { href: LANDING_ROUTES.howItWorks, label: "How it works" },
  /* `src` stays null until a screenshot is approved; the frame shows a quiet
     placeholder meanwhile. A new screenshot gets a NEW filename (e.g.
     /images/landing/hero-mentors-v1.webp), or browsers keep serving the cached
     old one. Width and height must match the asset; the frame sizes from them. */
  shot: {
    src: null as string | null,
    alt: "The DentMentor mentor directory: mentors with their schools, specialties, ratings and bookable services.",
    width: 2000,
    height: 1250,
  },
} as const;

/** The two cards overhanging the screenshot. Product facts only — no people, no numbers. */
export const HERO_CARDS = {
  services: {
    label: "Services",
    title: "What you can book",
    rows: [
      { title: "SOP Review & Feedback", meta: "60 min" },
      { title: "Mock Interview Session", meta: "45 min" },
      { title: "CV/Resume Review", meta: "45 min" },
      { title: "Application Strategy", meta: "60 min" },
    ],
  },
  schedule: {
    label: "Pick a time",
    title: "Shown in your timezone",
    slots: ["9:00 AM", "10:30 AM", "1:00 PM", "4:30 PM", "6:00 PM", "7:30 PM"],
    selected: 2,
    cta: "Continue to checkout",
  },
} as const;

/* ── FEATURES ─────────────────────────────────────────────────────────── */

export const FEATURES = {
  eyebrow: "Why DentMentor",
  heading: "Everything you need to prepare",
  lead: "One place to find the right mentor, book the session you need, and keep the conversation going until you're ready.",
  cards: [
    {
      title: "Verified mentors",
      body: "Mentors are U.S. dental students and graduates. Those who've submitted proof of admission or their degree carry a verified badge.",
    },
    {
      title: "Built for your application",
      body: "SOP reviews, mock interviews, CV reviews and strategy sessions — the work international applicants actually need.",
    },
    {
      title: "Booking in your timezone",
      body: "Availability is shown in your local time, so booking across continents takes one click, not a calculation.",
    },
    {
      title: "Secure checkout",
      body: "Pay per session through Stripe. Your time slot is held while you check out, and confirmed the moment you pay.",
    },
    {
      title: "Messaging with your mentor",
      body: "Every session has its own conversation, so questions, drafts and follow-ups stay in one thread.",
    },
    {
      title: "Confirmation and rescheduling",
      body: "An email confirmation when you book, a meeting link 24 hours ahead, and rescheduling up to 24 hours before.",
    },
  ],
} as const;

/* ── MENTORS ──────────────────────────────────────────────────────────── */

export const MENTORS = {
  eyebrow: "Mentors",
  heading: "Meet the people who've been there",
  lead: "A few of our verified mentors. Each sets their own services and prices — browse their schools, specialties and ratings before you book.",
  countLabel: "verified mentors",
  cta: "Browse all mentors",
  cardCta: "View profile",
} as const;

/* ── SERVICES ─────────────────────────────────────────────────────────── */

export const SERVICES = {
  eyebrow: "Services",
  heading: "Book exactly the help you need",
  lead: "Each mentor offers their own mix of sessions. These four are the most common, and the ones every application leans on.",
  items: [
    {
      title: "SOP Review & Feedback",
      duration: "60 min",
      body: "A line-by-line review of your Statement of Purpose, with concrete suggestions to strengthen it.",
    },
    {
      title: "Mock Interview Session",
      duration: "45 min",
      body: "Practise a dental school interview with real-time feedback on your answers and delivery.",
    },
    {
      title: "CV/Resume Review",
      duration: "45 min",
      body: "Shape your clinical and academic experience into a CV that U.S. programs read quickly.",
    },
    {
      title: "Application Strategy",
      duration: "60 min",
      body: "School selection, timeline and planning, built around your background and goals.",
    },
  ],
  mentorPanel: {
    title: "Studying or trained in the U.S.?",
    body: "Help the next international dentist through the process you've already been through. Set your own services, prices and hours.",
    cta: "Become a mentor",
  },
} as const;

/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  heading: ["From first question", "to walking in ready."],
  lead: "No subscriptions. You book and pay for the sessions you need, when you need them.",
  steps: [
    {
      label: "Step 01",
      title: "Create your free account",
      meta: "Tell us your background, your target programs and where you need help.",
    },
    {
      label: "Step 02",
      title: "Find the right mentor",
      meta: "Filter by specialty, experience, rating, price and availability, then read their profile before you choose.",
    },
    {
      label: "Step 03",
      title: "Book and pay securely",
      meta: "Pick a time in your timezone and check out with Stripe. You'll get a confirmation by email.",
    },
    {
      label: "Step 04",
      title: "Meet 1:1, keep talking",
      meta: "Join your session with the link sent 24 hours ahead, then follow up in your session thread.",
    },
    {
      label: "Step 05",
      title: "Walk in prepared",
      meta: "Submit your application and sit your interviews knowing someone who's been there checked your work.",
    },
  ],
  cta: "Create your free account",
} as const;

/* ── FAQ ──────────────────────────────────────────────────────────────── */

export const FAQ = {
  eyebrow: "FAQ",
  heading: ["Questions,", "answered."],
  lead: "The things people ask most before booking their first session.",
  items: [
    {
      slug: "who-are-the-mentors",
      question: "Who are the mentors?",
      answer:
        "Current students and graduates of U.S. dental schools. Mentors can verify their profile by submitting proof of their admission or degree; verified profiles carry a badge, and the mentors featured on this page are all verified.",
    },
    {
      slug: "what-can-i-book",
      question: "What kinds of sessions can I book?",
      answer:
        "The most common are SOP reviews, mock interviews, CV/resume reviews and application strategy consultations. Each mentor lists the services they offer, with a description, duration and price.",
    },
    {
      slug: "how-much",
      question: "How much does it cost?",
      answer:
        "Mentors set their own prices, shown on every service before you book. There is no subscription — you pay per session at checkout.",
    },
    {
      slug: "how-sessions-work",
      question: "How do sessions work across timezones?",
      answer:
        "Availability is shown in your local time. After booking you get an email confirmation, and the meeting link is provided 24 hours before the session.",
    },
    {
      slug: "reschedule",
      question: "Can I reschedule?",
      answer:
        "Yes — you can reschedule up to 24 hours before your session starts, from your dashboard.",
    },
  ],
} as const;

export type FaqItem = (typeof FAQ.items)[number];

/* ── CLOSE ────────────────────────────────────────────────────────────── */

export const FINAL = {
  /** Shown when the verified-mentor count is below its floor or unavailable. */
  fallbackBadge: "Now accepting mentees",
  heading: ["A second pair of eyes", "on your application."],
  supporting:
    "Create a free account, find a mentor who's been where you're going, and book your first session today.",
  primaryCta: "Get started",
  secondaryCta: "Browse mentors",
} as const;

/* ── FOOTER ───────────────────────────────────────────────────────────── */

export const LANDING_FOOTER = {
  descriptor: "1:1 mentorship for international dentists preparing for U.S. dental programs.",
  copyright: "© 2026 DentMentor. All rights reserved.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Find mentors", to: "/mentors" },
        { label: "How it works", to: "/how-it-works" },
        { label: "Become a mentor", to: "/apply-mentor" },
      ],
    },
    {
      title: "Company",
      links: [{ label: "About", to: "/about" }],
    },
  ],
} as const;
