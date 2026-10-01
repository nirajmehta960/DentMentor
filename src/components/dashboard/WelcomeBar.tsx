import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { BadgeCheck, PencilLine } from "lucide-react";
import { Link } from "react-router-dom";
import { AppPageHeader, control } from "@/components/site";
import { StatusPill, WorkPanel } from "./dashboard-ui";

/**
 * The overview's header: a greeting, the mentor's verification state, and —
 * until the profile is complete — how far along it is and the way to finish it.
 */
export function WelcomeBar() {
  const { profile, mentorProfile } = useAuth();

  const profileCompletion = React.useMemo(() => {
    if (!mentorProfile) return 0;

    const fields = [
      mentorProfile.professional_bio,
      mentorProfile.specializations?.length,
      mentorProfile.hourly_rate,
      mentorProfile.bds_university,
      mentorProfile.us_dental_school,
      mentorProfile.profile_photo_url,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [mentorProfile]);

  const firstName = profile?.first_name || "Mentor";
  const isVerified = mentorProfile?.is_verified || false;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const incomplete = profileCompletion < 100;

  return (
    <div className="flex flex-col gap-5">
      <AppPageHeader
        eyebrow="Overview"
        title={`${getGreeting()}, ${firstName}`}
        description={
          incomplete
            ? "Mentees read your profile before they book. Finish it so they can see what you offer."
            : "Your profile is complete. Here's what's coming up."
        }
        actions={
          isVerified ? (
            <StatusPill tone="teal" className="h-8 gap-1.5 px-3 normal-case">
              <BadgeCheck className="size-4" aria-hidden="true" />
              Verified mentor
            </StatusPill>
          ) : null
        }
      />

      {incomplete && (
        <WorkPanel className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.9375rem] font-medium text-band-fg">Profile completeness</p>
              <p className="text-[0.9375rem] font-semibold text-band-fg tabular-nums">{profileCompletion}%</p>
            </div>
            <div
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileCompletion}
              className="h-1.5 w-full overflow-hidden rounded-pill bg-band-fg/[0.07]"
            >
              <div
                className="h-full rounded-pill bg-band-signal transition-[width] duration-500 ease-dm"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
          <Link to="/onboarding" className={control({ variant: "ink", size: "md" })}>
            <PencilLine className="size-4" aria-hidden="true" />
            Complete profile
          </Link>
        </WorkPanel>
      )}
    </div>
  );
}
