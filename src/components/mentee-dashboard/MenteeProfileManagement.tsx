import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit2,
  Target,
} from "lucide-react";

export function MenteeProfileManagement() {
  const { profile, user, menteeProfile } = useAuth();

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase()
    : "U";

  return (
    <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 flex-shrink-0" />

      <div className="p-4 sm:p-6 -mt-10 flex-1 overflow-y-auto">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-end gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-background shadow-xl">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.first_name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h3 className="text-lg sm:text-xl font-bold">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dental School Applicant
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border/50 hover:border-primary/30 text-xs sm:text-sm"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-foreground">{user?.email}</span>
            </div>

            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">{profile.phone}</span>
              </div>
            )}

            {menteeProfile?.current_location && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">
                  {menteeProfile.current_location}
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-border/50" />

          {/* Education */}
          {(menteeProfile?.university_name ||
            menteeProfile?.highest_degree ||
            menteeProfile?.graduation_year) && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Education
                </h4>
                <div className="pl-6 space-y-1">
                  {menteeProfile.university_name && (
                    <p className="text-sm font-medium text-foreground">
                      {menteeProfile.university_name}
                    </p>
                  )}
                  {(menteeProfile.highest_degree ||
                    menteeProfile.graduation_year) && (
                    <p className="text-xs text-muted-foreground">
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
                </div>
              </div>

              <div className="h-px bg-border/50" />
            </>
          )}

          {/* Target Programs */}
          {menteeProfile?.target_programs &&
            menteeProfile.target_programs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Target Programs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {menteeProfile.target_programs.map((program) => (
                    <Badge
                      key={program}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-0 text-xs"
                    >
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
