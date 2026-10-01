import React from "react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, GraduationCap, Edit2, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardPanel, IconTile, LIST_ROW, PersonAvatar, ROW_RULE, StatusPill, TAP } from "./parts";

function DetailRow({ icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <li className={cn(LIST_ROW, "flex items-start gap-4")} style={ROW_RULE}>
      <IconTile icon={icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="label text-band-faint">{label}</p>
        <div className="min-w-0 break-words text-[0.9375rem] text-band-fg">{children}</div>
      </div>
    </li>
  );
}

export function MenteeProfileManagement() {
  const { profile, user, menteeProfile } = useAuth();

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase()
    : "U";

  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <DashboardPanel aria-labelledby="profile-card">
      {/* Identity */}
      <div className="flex items-center justify-between gap-4 border-b px-4 py-5 sm:px-6" style={ROW_RULE}>
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar
            name={fullName}
            initials={initials || "U"}
            src={profile?.avatar_url}
            className="size-16"
            fallbackClassName="text-[1.125rem]"
          />
          <div className="min-w-0">
            <h2 id="profile-card" className="truncate text-[1.125rem] font-semibold tracking-[-0.01em] text-band-fg">
              {fullName || "Your profile"}
            </h2>
            <p className="text-[0.875rem] text-band-muted">Dental school applicant</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className={cn("shrink-0", TAP)}>
          <Edit2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Edit
        </Button>
      </div>

      <ul>
        {/* Contact Info */}
        <DetailRow icon={Mail} label="Email">
          {user?.email}
        </DetailRow>

        {profile?.phone && (
          <DetailRow icon={Phone} label="Phone">
            <span className="tabular-nums">{profile.phone}</span>
          </DetailRow>
        )}

        {menteeProfile?.current_location && (
          <DetailRow icon={MapPin} label="Location">
            {menteeProfile.current_location}
          </DetailRow>
        )}

        {/* Education */}
        {(menteeProfile?.university_name ||
          menteeProfile?.highest_degree ||
          menteeProfile?.graduation_year) && (
          <DetailRow icon={GraduationCap} label="Education">
            {menteeProfile.university_name && (
              <p className="font-medium">{menteeProfile.university_name}</p>
            )}
            {(menteeProfile.highest_degree ||
              menteeProfile.graduation_year) && (
              <p className="text-[0.8125rem] text-band-muted tabular-nums">
                {menteeProfile.highest_degree || ""}
                {menteeProfile.highest_degree &&
                menteeProfile.graduation_year
                  ? " • "
                  : ""}
                {menteeProfile.graduation_year
                  ? `Class of ${menteeProfile.graduation_year}`
                  : ""}
              </p>
            )}
          </DetailRow>
        )}

        {/* Target Programs */}
        {menteeProfile?.target_programs &&
          menteeProfile.target_programs.length > 0 && (
            <DetailRow icon={Target} label="Target programs">
              <div className="mt-1 flex flex-wrap gap-1.5">
                {menteeProfile.target_programs.map((program) => (
                  <StatusPill key={program} className="whitespace-normal break-words">{program}</StatusPill>
                ))}
              </div>
            </DetailRow>
          )}
      </ul>
    </DashboardPanel>
  );
}
