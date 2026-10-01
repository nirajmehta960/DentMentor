import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppPageHeader, SiteCta } from "@/components/site";
import { cn } from "@/lib/utils";
import { TAP, TEAL_TINT } from "./parts";

/**
 * The Overview's header: a greeting, the one lead action, and how much of the
 * profile is filled in — four real fields, nothing estimated.
 */
export function MenteeWelcomeBar() {
  const { profile } = useAuth();

  // Calculate profile completion
  const completionItems = [
    !!profile?.first_name,
    !!profile?.last_name,
    !!profile?.avatar_url,
    !!profile?.phone,
  ];
  const completedCount = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  const checklist = [
    { label: "First name", done: completionItems[0] },
    { label: "Last name", done: completionItems[1] },
    { label: "Photo", done: completionItems[2] },
    { label: "Phone", done: completionItems[3] },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        eyebrow="Student dashboard"
        title={`${getGreeting()}, ${profile?.first_name || "Student"}`}
        description="Track your mentorship journey, manage sessions, and work toward your dental school goals."
        actions={
          <SiteCta to="/mentors" variant="ink" size="md" className="group/find">
            Find a mentor
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover/find:translate-x-1"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </SiteCta>
        }
      />

      <section
        aria-labelledby="profile-completion"
        className="flex flex-col gap-4 rounded-panel border border-band-rule-faint bg-band-raised p-4 shadow-[var(--card-shadow)] sm:p-5 lg:flex-row lg:items-center lg:gap-8"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="profile-completion" className="text-[0.9375rem] font-semibold text-band-fg">
              Profile completion
            </h2>
            <p className="text-[0.9375rem] font-semibold text-band-signal tabular-nums">
              {completionPercentage}%
              <span className="sr-only"> complete</span>
            </p>
          </div>
          <Progress
            value={completionPercentage}
            aria-label="Profile completion"
            className="h-1.5 bg-[rgb(15_112_93/0.1)]"
          />
          <p className="text-[0.8125rem] text-band-muted tabular-nums">
            {completedCount} of {completionItems.length} items completed
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Profile details">
          {checklist.map((item) => (
            <li
              key={item.label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[0.75rem] font-medium",
                item.done ? cn(TEAL_TINT, "text-band-signal") : "bg-band-fg/[0.05] text-band-muted",
              )}
            >
              {item.done ? <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" /> : null}
              {item.label}
              <span className="sr-only">{item.done ? ", added" : ", missing"}</span>
            </li>
          ))}
        </ul>

        {completionPercentage < 100 && (
          <Button variant="outline" size="sm" className={cn("shrink-0", TAP)}>
            Complete your profile
          </Button>
        )}
      </section>
    </div>
  );
}
