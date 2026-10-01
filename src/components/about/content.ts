/**
 * Every word on /about.
 *
 * The mission and vision are the product's own statements, kept from the
 * previous page. Everything else is a product fact (see
 * `how-it-works/content.ts` for where each one comes from).
 *
 * Deliberately absent: a founder story, team, milestones, metrics, photo
 * gallery, office address and contact email. None of those could be backed
 * up, so none are shown. Add a real founder story here, in the founder's own
 * words, when there is one.
 */

export const SIGNED_IN_LABEL = "Go to dashboard";

export const ABOUT_HERO = {
  eyebrow: "About DentMentor",
  title: ["Mentorship for international dentists,", "from people who've been there."],
  lead: "DentMentor is where international dentists book 1:1 sessions with U.S. dental students and graduates, for help with their Statement of Purpose, CV, interviews and application strategy.",
  primary: "Find a mentor",
  secondary: "How it works",
} as const;

export const MISSION = {
  missionLabel: "Our mission",
  mission:
    "To empower international dental graduates with personalized mentorship, expert guidance, and unwavering support as they navigate their journey toward practicing dentistry in the United States.",
  visionLabel: "Our vision",
  vision:
    "A world where talented dental professionals can seamlessly transition between countries, sharing their expertise across borders and improving oral healthcare globally.",
} as const;

export const WHY = {
  eyebrow: "Why DentMentor",
  heading: ["Applying from abroad", "is hard to do alone."],
  paragraphs: [
    "Applying to a U.S. dental program as an international dentist means a Statement of Purpose, a CV in an unfamiliar format, interviews, and a long list of schools to choose between, often without anyone nearby who has done it.",
    "The people best placed to help are the ones who have already been through it: students and graduates of U.S. dental schools. DentMentor puts them one booking away, for exactly the session you need.",
  ],
  needsLabel: "Where a mentor helps",
  needs: [
    { need: "Your Statement of Purpose", session: "SOP Review & Feedback" },
    { need: "Your interviews", session: "Mock Interview Session" },
    { need: "Your CV", session: "CV/Resume Review" },
    { need: "Your school list and timeline", session: "Application Strategy Consultation" },
  ],
} as const;

export const PRODUCT = {
  eyebrow: "What DentMentor is",
  heading: ["One place to find a mentor,", "book a session and follow up."],
  lead: "Two sides, one booking. Here's what each side gets.",
  sides: [
    {
      label: "For international dentists",
      title: "Book the help you need",
      points: [
        "Browse mentors by specialty, experience, rating, price and availability",
        "Book SOP reviews, mock interviews, CV reviews and strategy sessions",
        "See every mentor's availability in your own timezone",
        "Pay per session through Stripe, with no subscription",
        "Message your mentor in each session's own thread",
      ],
    },
    {
      label: "For mentors",
      title: "Mentor on your own terms",
      points: [
        "Open to U.S. dental students and graduates",
        "Set your own services, prices and session lengths",
        "Choose the times you're available",
        "Verify your documents, if you choose, to earn the Verified badge",
        "Mentees pay when they book, through Stripe checkout",
      ],
    },
  ],
  cta: "See how it works",
} as const;

export const VALUES = {
  eyebrow: "What we hold to",
  heading: "The principles behind the product",
  lead: "They decide what DentMentor does, and just as often what it doesn't.",
  items: [
    {
      title: "Compassion first",
      body: "Behind every application is a person with plans, worries and a great deal riding on it. We build for that person.",
    },
    {
      title: "Guidance from people who've done it",
      body: "Mentors are U.S. dental students and graduates who have been through the process you're starting.",
    },
    {
      title: "Trust and integrity",
      body: "We say exactly what we can stand behind. The Verified badge means one thing: the mentor submitted proof of admission or their degree.",
    },
    {
      title: "Pay for what you need",
      body: "No subscriptions and no packages. You book one session at a time, at the price shown before you book.",
    },
    {
      title: "Mentors set their terms",
      body: "Each mentor decides which services they offer, what they charge, how long a session runs and when they're available.",
    },
    {
      title: "A global perspective",
      body: "Applicants come from everywhere, so availability is shown in your own timezone and booking across continents takes one click.",
    },
  ],
} as const;

export const ABOUT_CLOSE = {
  heading: ["Find someone who's been", "where you're going."],
  supporting: "Create a free account, browse mentors and book the session you need. No subscription.",
  primary: "Get started",
  secondary: "Browse mentors",
} as const;
