import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  DollarSign,
  Camera,
  BadgeCheck,
  MapPin,
  Globe,
  Clock,
  GraduationCap,
  Mail,
  Linkedin,
  Star,
  Users,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ServiceManagementModal } from "./ServiceManagementModal";
import { ProfileImageCropper } from "./ProfileImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppPageHeader } from "@/components/site";
import { DIVIDED, IconTile, PanelHeader, StatusPill, WorkPanel, formatUsd, hairline } from "./dashboard-ui";

/** One labelled figure in the profile's numbers panel. */
function Figure({ icon, label, value, hint }: { icon: typeof Users; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <li className="flex items-center gap-4 px-5 py-4 sm:px-6">
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="label text-band-muted">{label}</p>
        {hint ? <p className="text-[0.8125rem] text-band-muted">{hint}</p> : null}
      </div>
      <p className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-band-fg tabular-nums">{value}</p>
    </li>
  );
}

/** One contact line: icon, then text. */
function ContactLine({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-3 text-[0.875rem] text-band-muted">
      <Icon className="size-4 shrink-0 text-band-signal" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </li>
  );
}

export function ProfileManagement() {
  const { profile, mentorProfile, isLoading } = useAuth();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEditProfile = () => {
    navigate("/onboarding?edit=1");
  };

  const handleImageSaved = async (croppedImage: string) => {
    try {
      if (!mentorProfile?.id) return;

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `profile-${mentorProfile.id}-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("mentor-photos")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("mentor-photos")
        .getPublicUrl(fileName);

      // Update mentor profile
      const { error: updateError } = await supabase
        .from("mentor_profiles")
        .update({ profile_photo_url: urlData.publicUrl })
        .eq("id", mentorProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const header = (
    <AppPageHeader
      eyebrow="Profile"
      title="Your mentor profile"
      description="What mentees see before they book with you."
      actions={
        isLoading ? null : (
          <>
            <Button variant="outline" onClick={() => setShowServiceModal(true)}>
              <DollarSign className="size-4" aria-hidden="true" />
              Manage services
            </Button>
            <Button onClick={handleEditProfile}>
              <Edit className="size-4" aria-hidden="true" />
              Edit profile
            </Button>
          </>
        )
      }
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <WorkPanel aria-hidden="true" className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-band-fg/[0.05] motion-safe:animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-band-fg/[0.06] motion-safe:animate-pulse"></div>
              <div className="h-4 w-1/2 rounded bg-band-fg/[0.04] motion-safe:animate-pulse"></div>
            </div>
          </div>
        </WorkPanel>
        <span className="sr-only" role="status">Loading profile</span>
      </div>
    );
  }

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : "M";

  const formatSpecializations = (specializations: string[] | null) => {
    if (!specializations || specializations.length === 0) return null;
    return specializations;
  };

  const specializations = formatSpecializations(
    mentorProfile?.areas_of_expertise || mentorProfile?.specializations
  );

  const averageRating = Number((mentorProfile as any)?.average_rating) || 0;

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {/* Identity and about */}
        <WorkPanel>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
            {/* Avatar with a change-photo control (visible on hover/focus, and always on touch) */}
            <div className="relative shrink-0 self-start">
              <Avatar className="size-24 ring-1 ring-[rgb(9_67_56/0.08)]">
                <AvatarImage
                  src={mentorProfile?.profile_photo_url}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-2xl font-semibold text-band-signal">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setShowImageCropper(true)}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 grid size-11 place-items-center rounded-full border bg-white text-band-fg shadow-[var(--card-shadow)] transition-colors hover:bg-band-fg/[0.04]"
                style={hairline}
              >
                <Camera className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-band-fg">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                {mentorProfile?.is_verified && (
                  <StatusPill tone="teal" className="gap-1 normal-case">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Verified
                  </StatusPill>
                )}
              </div>

              <p className="text-[0.9375rem] font-medium text-band-signal">
                {mentorProfile?.professional_headline || "Dental Mentor"}
              </p>

              {mentorProfile?.us_dental_school && (
                <p className="flex items-center gap-1.5 text-[0.875rem] text-band-muted">
                  <GraduationCap className="size-4 shrink-0 text-band-signal" aria-hidden="true" />
                  {mentorProfile.us_dental_school}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                <StatusPill tone="muted" className="gap-1 normal-case tabular-nums">
                  <Briefcase className="size-3.5" aria-hidden="true" />
                  {mentorProfile?.years_experience || 0} years exp.
                </StatusPill>
                {mentorProfile?.country_of_origin && (
                  <StatusPill tone="muted" className="gap-1 normal-case">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {mentorProfile.country_of_origin}
                  </StatusPill>
                )}
              </div>

              {!mentorProfile?.is_verified && (
                <p className="pt-1 text-[0.8125rem] leading-relaxed text-band-muted">
                  Document verification is optional and earns a Verified badge on your profile.
                </p>
              )}
            </div>
          </div>

          {/* Specializations */}
          {specializations && specializations.length > 0 && (
            <div className="flex flex-col gap-2.5 border-t px-5 py-5 sm:px-6" style={hairline}>
              <p className="label text-band-muted">Specializations</p>
              <div className="flex flex-wrap gap-1.5">
                {specializations.slice(0, 4).map((spec, idx) => (
                  <StatusPill key={idx} tone="teal" className="normal-case">
                    {spec}
                  </StatusPill>
                ))}
                {specializations.length > 4 && (
                  <StatusPill tone="muted" className="normal-case tabular-nums">
                    +{specializations.length - 4} more
                  </StatusPill>
                )}
              </div>
            </div>
          )}

          {/* Bio Preview */}
          {mentorProfile?.professional_bio && (
            <div className="flex flex-col gap-2.5 border-t px-5 py-5 sm:px-6" style={hairline}>
              <p className="label text-band-muted">About</p>
              <p className="max-w-[44rem] text-[0.9375rem] leading-relaxed text-band-muted">
                {mentorProfile.professional_bio.length > 200
                  ? `${mentorProfile.professional_bio.substring(0, 200)}...`
                  : mentorProfile.professional_bio}
              </p>
            </div>
          )}
        </WorkPanel>

        <div className="flex flex-col gap-6">
          {/* Numbers */}
          <WorkPanel>
            <PanelHeader title="At a glance" />
            <ul className={DIVIDED}>
              <Figure
                icon={Users}
                label="Sessions"
                value={(mentorProfile as any)?.total_sessions || 0}
              />
              <Figure
                icon={Star}
                label="Rating"
                value={averageRating > 0 ? (mentorProfile as any)?.average_rating : "—"}
                hint={averageRating > 0 ? undefined : "No ratings yet"}
              />
              <Figure
                icon={DollarSign}
                label="Hourly rate"
                value={formatUsd(mentorProfile?.hourly_rate || 0)}
              />
            </ul>
          </WorkPanel>

          {/* Contact Info */}
          <WorkPanel>
            <PanelHeader title="Contact" />
            <ul className="flex flex-col gap-3 px-5 py-5 sm:px-6">
              <ContactLine icon={Mail}>{mentorProfile?.email || profile?.user_id}</ContactLine>
              {mentorProfile?.linkedin_url && (
                <li className="flex items-center gap-3 text-[0.875rem]">
                  <Linkedin className="size-4 shrink-0 text-band-signal" aria-hidden="true" />
                  <a
                    href={mentorProfile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-band-signal underline-offset-4 hover:underline"
                  >
                    View LinkedIn profile
                  </a>
                </li>
              )}
              {mentorProfile?.languages_spoken &&
                mentorProfile.languages_spoken.length > 0 && (
                  <ContactLine icon={Globe}>{mentorProfile.languages_spoken.join(", ")}</ContactLine>
                )}
              {mentorProfile?.availability_preference && (
                <ContactLine icon={Clock}>Available: {mentorProfile.availability_preference}</ContactLine>
              )}
            </ul>
          </WorkPanel>
        </div>
      </div>

      <ServiceManagementModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />

      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />
    </div>
  );
}
