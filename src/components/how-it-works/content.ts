/**
 * Every word on /how-it-works.
 *
 * Product facts only, taken from the product itself: booking steps from
 * `booking/ProgressIndicator.tsx` and `BookingModal.tsx` (the slot is held by
 * `create_booking_hold` while Stripe checkout runs), the 24-hour meeting link
 * and reschedule window from `booking/BookingConfirmation.tsx`, default
 * services and durations from `onboarding/ServicesOfferedStep.tsx`, mentor
 * onboarding steps from `onboarding/OnboardingLayout.tsx`, and optional
 * verification from `onboarding/VerificationStep.tsx`.
 *
 * Nothing here quotes a person, counts mentors or students, or promises an
 * outcome. Reminder emails are not sent, so none are mentioned.
 *
 * Every `#hash` used below must match an `id` on a rendered band.
 */

export const SIGNED_IN_LABEL = "Go to dashboard";

export const HOW_HERO = {
  eyebrow: "How it works",
  title: ["How DentMentor works,", "on both sides of a session."],
  lead: "International dentists book 1:1 sessions with U.S. dental students and graduates. Mentors set their own services, prices and hours. No subscriptions: you pay per session.",
  menteeAnchor: { to: "#for-mentees", label: "For mentees" },
  mentorAnchor: { to: "#for-mentors", label: "For mentors" },
} as const;

/* ── FOR MENTEES ─────────────────────────────────────────────────────── */

export const MENTEE_SIDE = {
  eyebrow: "For mentees",
  heading: ["Five steps from sign-up", "to walking in prepared."],
  lead: "You book and pay for the sessions you need, when you need them. Nothing renews, and nothing is bundled.",
  steps: [
    {
      title: "Create your free account",
      body: "Sign up, then tell us your background, the programs you're aiming for and where you need help.",
    },
    {
      title: "Find the right mentor",
      body: "Browse U.S. dental students and graduates. Filter by specialty, experience, rating, price and availability, then read a mentor's profile and services before you choose.",
      points: ["A Verified badge marks mentors whose documents have been verified"],
    },
    {
      title: "Book a session",
      body: "Choose one of the mentor's services, pick a time shown in your timezone, and pay through Stripe checkout.",
      points: ["Your time slot is held while you check out", "A confirmation email arrives once you've paid"],
    },
    {
      title: "Meet 1:1",
      body: "Join your session with the meeting link, which is provided 24 hours before it starts.",
      points: ["Need a different time? Reschedule up to 24 hours before"],
    },
    {
      title: "Follow up and keep going",
      body: "Send drafts and questions in the session's message thread, and book another session whenever you're ready.",
    },
  ],
  cta: "Create your free account",
} as const;

/* ── FOR MENTORS ─────────────────────────────────────────────────────── */

export const MENTOR_SIDE = {
  eyebrow: "For mentors",
  heading: ["Your services, your prices,", "your hours."],
  lead: "Mentors are U.S. dental students and graduates. Here's how it works from your side of the session.",
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
      title: "Set your services",
      body: "Start from SOP reviews, mock interviews, CV reviews and strategy consultations, or add your own. You set the price and length of each.",
    },
    {
      title: "Verify, if you choose",
      body: "Document verification is optional and earns the Verified badge. Submit your documents during onboarding, or later from your dashboard.",
    },
    {
      title: "Open your calendar",
      body: "Add the times you're available. Mentees see them in their own timezone.",
    },
    {
      title: "Meet and follow up",
      body: "Mentees pay when they book. Meet with the session link, follow up in its thread, and see each paid session in your dashboard earnings.",
    },
  ],
  cta: "Become a mentor",
} as const;

/* ── BOOKING FLOW ────────────────────────────────────────────────────── */

export const BOOKING_FLOW = {
  eyebrow: "The booking flow",
  heading: ["What happens", "when you book."],
  lead: "Three steps in the booking window, then checkout. Everything after that arrives on its own.",
  stages: [
    {
      when: "Step 1",
      title: "Choose a service",
      body: "Pick from the services the mentor offers. Each one shows what it covers, how long it runs and what it costs.",
    },
    {
      when: "Step 2",
      title: "Pick a date and time",
      body: "The mentor's availability is shown in your timezone, so there's nothing to convert.",
    },
    {
      when: "Step 3",
      title: "Confirm and check out",
      body: "Review the booking and pay through Stripe. Your time slot is held for you while you check out.",
    },
    {
      when: "Once paid",
      title: "You're booked",
      body: "The session is confirmed and a confirmation email is sent to you.",
    },
    {
      when: "24h before",
      title: "Your meeting link",
      body: "The meeting link is provided 24 hours before the session. It's also the last point at which you can reschedule.",
    },
    {
      when: "Afterwards",
      title: "Keep the thread going",
      body: "Every session has its own message thread for follow-up questions and drafts.",
    },
  ],
} as const;

/* ── WHAT A SESSION INCLUDES ─────────────────────────────────────────── */

export const SESSION_INCLUDES = {
  eyebrow: "Sessions",
  heading: "What a session includes",
  lead: "Each mentor offers their own mix of services. These four are the most common. The lengths shown are the defaults, and each mentor sets their own price and duration.",
  services: [
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
      title: "Application Strategy Consultation",
      duration: "60 min",
      body: "School selection, timeline and planning, built around your background and goals.",
    },
  ],
  everyLabel: "Every session comes with",
  every: [
    { title: "A 1:1 meeting", body: "Just you and your mentor, for the length of the service you booked." },
    { title: "The link 24 hours ahead", body: "Your meeting link is provided a day before the session." },
    { title: "Its own message thread", body: "Questions, drafts and follow-ups stay with the session they belong to." },
    { title: "Times in your timezone", body: "Availability is shown in your local time when you book." },
    { title: "One payment, no subscription", body: "You pay for the session at checkout. Nothing renews." },
    { title: "Rescheduling", body: "Move your session up to 24 hours before it starts." },
  ],
} as const;

/* ── FAQ ─────────────────────────────────────────────────────────────── */

export const HOW_FAQ = {
  eyebrow: "FAQ",
  heading: ["Questions,", "answered."],
  lead: "The details people ask about before booking, or before offering, a first session.",
  items: [
    {
      slug: "subscription",
      question: "Do I need a subscription?",
      answer: "No. There are no subscriptions or packages. You pay for each session at checkout, when you book it.",
    },
    {
      slug: "cost",
      question: "How much does a session cost?",
      answer: "Mentors set their own prices. The price is shown on every service before you book, along with what it covers and how long it runs.",
    },
    {
      slug: "timezones",
      question: "How do time zones work?",
      answer: "Mentor availability is shown in your local time. Once you've booked you get an email confirmation, and the meeting link is provided 24 hours before the session.",
    },
    {
      slug: "reschedule",
      question: "Can I reschedule?",
      answer: "Yes. You can reschedule up to 24 hours before your session starts.",
    },
    {
      slug: "verified",
      question: "What does the Verified badge mean?",
      answer: "A Verified mentor's documents, such as proof of admission to a U.S. dental school or their degree, have been verified. Verification is optional, so not every mentor has the badge yet.",
    },
    {
      slug: "messaging",
      question: "Can I message my mentor?",
      answer: "Yes. Every session has its own message thread, so you can send questions and drafts before and after you meet.",
    },
    {
      slug: "become-mentor",
      question: "Who can become a mentor?",
      answer: "Current students and graduates of U.S. dental schools. Sign up, choose “Become a Mentor”, then set your services, prices and availability.",
    },
  ],
} as const;

/* ── CLOSE ───────────────────────────────────────────────────────────── */

export const HOW_CLOSE = {
  heading: ["Book the help", "your application needs."],
  supporting: "Create a free account, find a mentor who's been where you're going, and book your first session.",
  primary: "Get started",
  secondary: "Browse mentors",
} as const;
