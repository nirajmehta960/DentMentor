import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMenteeUpcomingSessions } from "@/hooks/useMenteeUpcomingSessions";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { SiteCta } from "@/components/site";
import { cn } from "@/lib/utils";
import { DashboardPanel, LIST_ROW, PanelHeader, ROW_RULE, StatusPill } from "./parts";

/**
 * The common session types (the defaults a new mentor starts from). Mentors set
 * their own services, prices and durations, so these are what to look for, not
 * a promise of what any one mentor offers.
 */
const COMMON_SESSIONS = [
  { title: "SOP Review & Feedback", minutes: 60 },
  { title: "Mock Interview Session", minutes: 45 },
  { title: "CV/Resume Review", minutes: 45 },
  { title: "Application Strategy Consultation", minutes: 60 },
] as const;

/**
 * Where the mentee is with DentMentor — only the steps the data can confirm.
 * Milestones nothing tracks (SOP reviewed, interview done, application ready)
 * are not shown as progress.
 */
export function ApplicationProgress() {
  const { menteeProfile } = useAuth();
  const { upcomingSessions } = useMenteeUpcomingSessions();

  const milestones = [
    {
      id: "1",
      title: "Profile complete",
      description: "Complete your student profile",
      status: menteeProfile?.onboarding_completed ? "completed" : "upcoming",
      doneLabel: "Done",
    },
    {
      id: "2",
      title: "First session",
      description: "Book your first mentorship session",
      status: upcomingSessions.length > 0 ? "completed" : "upcoming",
      doneLabel: "Booked",
    },
  ] as const;

  return (
    <DashboardPanel aria-labelledby="progress-steps">
      <PanelHeader
        id="progress-steps"
        title="Getting started"
        description="Your first steps on DentMentor."
      />

      <ol>
        {milestones.map((milestone) => {
          const done = milestone.status === "completed";
          return (
            <li key={milestone.id} className={cn(LIST_ROW, "flex items-start gap-4")} style={ROW_RULE}>
              {done ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-band-signal" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-band-faint/50" strokeWidth={1.75} aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("text-[0.9375rem] font-medium", done ? "text-band-fg" : "text-band-muted")}>
                  {milestone.title}
                </p>
                <p className="text-[0.8125rem] text-band-muted">{milestone.description}</p>
              </div>
              <StatusPill tone={done ? "signal" : "neutral"}>{done ? milestone.doneLabel : "Pending"}</StatusPill>
            </li>
          );
        })}
      </ol>

      {/* What to book next: real session types, no tracking implied. */}
      <div className="border-t px-4 pb-5 pt-5 sm:px-6" style={ROW_RULE}>
        <h3 className="label text-band-signal">Common sessions</h3>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-band-muted">
          Each mentor sets their own services, prices and durations.
        </p>
        <ul className="mt-3 flex flex-col">
          {COMMON_SESSIONS.map((session) => (
            <li
              key={session.title}
              className="flex items-baseline justify-between gap-4 border-t py-2.5 first:border-t-0"
              style={ROW_RULE}
            >
              <span className="min-w-0 text-[0.875rem] text-band-fg">{session.title}</span>
              <span className="stat shrink-0 text-band-signal">{session.minutes} min</span>
            </li>
          ))}
        </ul>
        <SiteCta to="/mentors" variant="secondary" size="sm" className="landing-cta-flat mt-4 w-full max-sm:h-11 sm:w-auto">
          Find a mentor
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
        </SiteCta>
      </div>
    </DashboardPanel>
  );
}
