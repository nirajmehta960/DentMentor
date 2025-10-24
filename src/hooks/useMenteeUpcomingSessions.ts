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
  payment_status?: string;
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

          // Get user profiles (match by user_id, not id)
          const userIds = mentorProfiles?.map((mp) => mp.user_id) || [];
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name, avatar_url")
            .in("user_id", userIds);

          if (profilesError) throw profilesError;

          // Get services for sessions via booking_reservations -> mentor_services
          const sessionIds = sessions?.map((s) => s.id) || [];

          // Fetch booking_reservations to get service_id
          const { data: reservations, error: reservationsError } = await supabase
            .from("booking_reservations")
            .select("session_id, service_id")
            .in("session_id", sessionIds);

          // Get service IDs
          const serviceIds = [
            ...new Set(
              reservations?.map((r) => r.service_id).filter(Boolean) || []
            ),
          ];

          // Fetch mentor_services to get service titles
          let serviceMap = new Map<string, string>();
          if (serviceIds.length > 0) {
            const { data: services, error: servicesError } = await supabase
              .from("mentor_services")
              .select("id, service_title")
              .in("id", serviceIds);

            if (!servicesError && services) {
              // Map service_id -> service_title
              const serviceTitleMap = new Map(
                services.map((s) => [s.id, s.service_title])
              );

              // Map session_id -> service_title via reservations
              serviceMap = new Map(
                reservations
                  ?.filter((r) => r.service_id && serviceTitleMap.has(r.service_id))
                  .map((r) => [r.session_id, serviceTitleMap.get(r.service_id)!]) || []
              );
            }
          }

          // Create maps for quick lookup
          const mentorProfileMap = new Map(
            mentorProfiles?.map((mp) => [mp.id, mp]) || []
          );
          const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

          // Transform sessions with mentor info
          const transformedSessions = (sessions || []).map((session) => {
            const mentorProfile = mentorProfileMap.get(session.mentor_id);
            const profile = mentorProfile
              ? profileMap.get(mentorProfile.user_id)
              : null;
            const serviceTitle = serviceMap.get(session.id);

            // Get mentor name from profile - prioritize actual name, never use bio/headline
            let mentorName: string = 'Dr. Mentor';
            if (profile) {
              const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
              if (fullName) {
                mentorName = `Dr. ${fullName}`;
              } else if (profile.first_name) {
                mentorName = `Dr. ${profile.first_name}`;
              } else if (profile.last_name) {
                mentorName = `Dr. ${profile.last_name}`;
              }
            }

            return {
              ...session,
              mentor: {
                name: mentorName,
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
