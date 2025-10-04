import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  User,
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
import { cn } from "@/lib/utils";

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

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 animate-pulse"></div>
            <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-2xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
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

  return (
    <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Profile Management
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your public profile
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <div className="relative p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5">
            {/* Avatar with camera overlay */}
            <div className="relative group flex-shrink-0">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-2 sm:ring-4 ring-background shadow-xl">
                <AvatarImage
                  src={mentorProfile?.profile_photo_url}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setShowImageCropper(true)}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              {mentorProfile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
                  <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                {mentorProfile?.is_verified && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs sm:text-sm">
                    <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-sm sm:text-base text-primary font-medium">
                {mentorProfile?.professional_headline || "Dental Mentor"}
              </p>

              {mentorProfile?.us_dental_school && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  {mentorProfile.us_dental_school}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                <Badge
                  variant="outline"
                  className="font-medium text-xs sm:text-sm"
                >
                  <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  {mentorProfile?.years_experience || 0} years exp.
                </Badge>
                {mentorProfile?.country_of_origin && (
                  <Badge
                    variant="outline"
                    className="font-medium text-xs sm:text-sm"
                  >
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    {mentorProfile.country_of_origin}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 text-center group hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {(mentorProfile as any)?.total_sessions || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              Sessions
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 text-center group hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
              {(mentorProfile as any)?.average_rating || 0}
              {((mentorProfile as any)?.average_rating || 0) > 0 && (
                <span className="text-xs sm:text-sm">⭐</span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              Rating
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 text-center group hover:bg-muted/50 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ${mentorProfile?.hourly_rate || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              Hourly Rate
            </div>
          </div>
        </div>

        {/* Specializations */}
        {specializations && specializations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {specializations.slice(0, 4).map((spec, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-primary/5 text-primary border-0"
                >
                  {spec}
                </Badge>
              ))}
              {specializations.length > 4 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{specializations.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleEditProfile} className="flex-1 shadow-sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowServiceModal(true)}
            className="flex-1 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Manage Services
          </Button>
        </div>

        {/* Bio Preview */}
        {mentorProfile?.professional_bio && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mentorProfile.professional_bio.length > 200
                ? `${mentorProfile.professional_bio.substring(0, 200)}...`
                : mentorProfile.professional_bio}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h4 className="text-sm font-semibold text-foreground">
            Contact Information
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>{mentorProfile?.email || profile?.user_id}</span>
            </div>
            {mentorProfile?.linkedin_url && (
              <div className="flex items-center gap-2 text-sm">
                <Linkedin className="w-4 h-4 text-primary" />
                <a
                  href={mentorProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View LinkedIn Profile
                </a>
              </div>
            )}
          </div>

          {mentorProfile?.languages_spoken &&
            mentorProfile.languages_spoken.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4 text-primary" />
                <span>{mentorProfile.languages_spoken.join(", ")}</span>
              </div>
            )}

          {mentorProfile?.availability_preference && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Available: {mentorProfile.availability_preference}</span>
            </div>
          )}
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
