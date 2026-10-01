/**
 * Every word on /apply-mentor.
 *
 * Product facts only. Eligibility (U.S. dental students and graduates) and the
 * three optional verification uploads come from mentor onboarding
 * (`onboarding/VerificationStep.tsx`); the onboarding steps from
 * `onboarding/OnboardingLayout.tsx`; default services and durations from
 * `onboarding/ServicesOfferedStep.tsx`; availability from the dashboard's
 * Availability tab; earnings from the dashboard's earnings stats.
 *
 * No earnings claims: the calculator multiplies a price the visitor picks by a
 * number of sessions the visitor picks, and says so. No mentor counts, ratings,
 * testimonials or "average per hour" figures.
 */

export const SIGNED_IN_LABEL = "Go to dashboard";

export const APPLY_HERO = {
  eyebrow: "Become a mentor",
  title: ["Help the next international dentist", "get where you are."],
  lead: "If you study at or graduated from a U.S. dental school, you can offer 1:1 sessions to international dentists applying to U.S. programs, with your own services, prices and hours.",
  primary: "Sign up as a mentor",
  secondary: { to: "#how-it-works", label: "How it works" },
} as const;

export const WHY_MENTOR = {
  eyebrow: "Why mentor",
  heading: "Share what you learned getting in",
  lead: "International applicants need exactly what you've just done. DentMentor handles the booking and payment so you can focus on the session.",
  cards: [
    {
      title: "Help someone through it",
      body: "An SOP that lands, a CV U.S. programs read quickly, interview practice: you've been through each of them.",
    },
    {
      title: "Offer the services you choose",
      body: "Start from SOP reviews, mock interviews, CV reviews and strategy consultations, or create your own.",
    },
    {
      title: "Set your own prices",
      body: "You decide what each session costs. Mentees see the price before they book.",
    },
    {
      title: "Work the hours you pick",
      body: "Add the times you're free. Mentees see them in their own timezone, wherever they are.",
    },
    {
      title: "Payment at booking",
      body: "Mentees pay through Stripe checkout when they book, and each paid session appears in your dashboard earnings.",
    },
    {
      title: "One thread per session",
      body: "Every session has its own message thread for drafts, questions and follow-ups.",
    },
  ],
} as const;

export const WHO_QUALIFIES = {
  eyebrow: "Who can mentor",
  heading: ["U.S. dental students", "and graduates."],
  lead: "DentMentor mentors are current students and graduates of U.S. dental schools. If that's you, you can mentor.",
  groups: [
    {
      title: "Current U.S. dental students",
      body: "You're currently enrolled at a U.S. dental school.",
    },
    {
      title: "U.S. dental school graduates",
      body: "You've graduated from a U.S. dental school.",
    },
  ],
  verification: {
    label: "Optional",
    title: "Verification earns the Verified badge",
    body: "Upload your documents during onboarding, or skip the step and finish it later from your dashboard. Verified profiles carry a badge mentees can see.",
    documentsLabel: "The three uploads",
    documents: ["Degree certificate or transcript", "U.S. dental school admission letter", "Student ID or diploma"],
  },
} as const;

export const MENTOR_JOURNEY = {
  eyebrow: "How it works",
  heading: ["From sign-up", "to your first session."],
  lead: "Onboarding takes you through the first steps. The rest you manage from your dashboard.",
  steps: [
    {
      title: "Sign up as a mentor",
      body: "Create your account and choose “Become a Mentor”.",
    },
    {
      title: "Build your profile",
      body: "Onboarding walks you through your professional profile, your education, and your specialties and languages.",
    },
    {
      title: "Set your services and prices",
      body: "Start from four common services, or create your own. You set the price and duration of every one.",
      points: [
        "SOP Review & Feedback · 60 min",
        "Mock Interview Session · 45 min",
        "CV/Resume Review · 45 min",
        "Application Strategy Consultation · 60 min",
      ],
    },
    {
      title: "Verify, if you want the badge",
      body: "Upload your documents to earn the Verified badge. It's optional, and you can do it later from your dashboard.",
    },
    {
      title: "Set your availability",
      body: "Add the dates and times you're free from your dashboard. Mentees see them in their timezone.",
    },
    {
      title: "Get booked",
      body: "Mentees choose one of your services and a time, then pay through Stripe checkout. The slot is held while they pay.",
    },
    {
      title: "Meet and get paid",
      body: "Meet with the session link, follow up in the session's thread, and track each paid session in your dashboard earnings.",
    },
  ],
  cta: "Sign up as a mentor",
} as const;

/**
 * The calculator's ranges are input bounds, not recommendations: any price is
 * the mentor's to set. The defaults sit low in the range on purpose so the
 * first figure on screen doesn't read as a promise.
 */
export const EARNINGS = {
  eyebrow: "Example",
  heading: "See what your prices could add up to",
  lead: "An illustration, not a forecast. You choose the price and the number of sessions; what you actually earn depends on the prices you set and how many sessions mentees book.",
  panelTitle: "Try your own numbers",
  price: { label: "Your price per session", min: 10, max: 300, step: 5, initial: 50 },
  sessions: { label: "Sessions booked per week", min: 1, max: 10, step: 1, initial: 3 },
  resultsLabel: "Example figures",
  results: [
    { key: "week", label: "Per week", caption: "price × sessions" },
    { key: "month", label: "Per month", caption: "an average of 4.33 weeks" },
    { key: "year", label: "Per year", caption: "52 weeks" },
  ],
  footnote:
    "Example only. These figures assume every session you enter is booked and paid, and are before taxes. DentMentor doesn't set your prices; you do.",
} as const;

export const APPLY_CLOSE = {
  heading: ["Your experience is", "someone's next step."],
  supporting: "Sign up as a mentor, set your services and prices, and open your calendar.",
  primary: "Sign up as a mentor",
  secondary: "How it works",
} as const;
