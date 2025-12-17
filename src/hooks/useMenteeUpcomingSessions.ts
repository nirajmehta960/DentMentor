import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MenteeUpcomingSession {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  mentee_id: string;
  mentor_id: string;
  notes?: string;
  meeting_link?: string;
  mentor?: {
    name: string;
    avatar?: string;
    specialty?: string;
    rating?: number;
  };
  service?: {
    title: string;
  };
}

export function useMenteeUpcomingSessions() {
  const [upcomingSessions, setUpcomingSessions] = useState<
    MenteeUpcomingSession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { menteeProfile } = useAuth();

  useEffect(() => {
    if (!menteeProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchUpcomingSessions = async () => {
      try {
        const now = new Date();

        // Fetch upcoming sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("mentee_id", menteeProfile.id)
          .in("status", ["scheduled", "confirmed"])
          .gte("session_date", now.toISOString())
          .order("session_date", { ascending: true })
          .limit(10);

        if (sessionsError) throw sessionsError;

        // Fetch mentor profiles and basic profiles for each session
        const mentorIds = [
          ...new Set((sessions || []).map((s) => s.mentor_id)),
        ];

        if (mentorIds.length > 0) {
          // Get mentor profiles
          const { data: mentorProfiles, error: mentorError } = await supabase
            .from("mentor_profiles")
            .select("id, user_id, professional_headline")
            .in("id", mentorIds);

          if (mentorError) throw mentorError;

          // Get user profiles
          const userIds = mentorProfiles?.map((mp) => mp.user_id) || [];
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", userIds);

          if (profilesError) throw profilesError;

          // Get services for sessions
          const sessionIds = sessions?.map((s) => s.id) || [];
          const { data: sessionServices, error: servicesError } = await supabase
            .from("session_requests")
            .select("session_id, service_title")
            .in("session_id", sessionIds);

          // Create maps for quick lookup
          const mentorProfileMap = new Map(
            mentorProfiles?.map((mp) => [mp.id, mp]) || []
          );
          const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
          const serviceMap = new Map(
            sessionServices?.map((sr) => [sr.session_id, sr.service_title]) ||
              []
          );

          // Transform sessions with mentor info
          const transformedSessions = (sessions || []).map((session) => {
            const mentorProfile = mentorProfileMap.get(session.mentor_id);
            const profile = mentorProfile
              ? profileMap.get(mentorProfile.user_id)
              : null;
            const serviceTitle = serviceMap.get(session.id);

            return {
              ...session,
              mentor: {
                name: profile
                  ? `${profile.first_name || ""} ${
                      profile.last_name || ""
                    }`.trim() || "Mentor"
                  : mentorProfile?.professional_headline || "Mentor",
                avatar: profile?.avatar_url || null,
                specialty: mentorProfile?.professional_headline || undefined,
                rating: undefined, // Would need to fetch from feedback table
              },
              service: {
                title:
                  serviceTitle || session.session_type || "Mentorship Session",
              },
            };
          });

          setUpcomingSessions(transformedSessions);
        } else {
          setUpcomingSessions([]);
        }
      } catch (error) {
        // Silently handle error
        setUpcomingSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, [menteeProfile?.id]);

  return { upcomingSessions, isLoading };
}
