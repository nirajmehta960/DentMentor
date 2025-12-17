import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export interface MenteeActivity {
  id: string;
  type:
    | "session_completed"
    | "session_booked"
    | "message"
    | "review"
    | "document";
  title: string;
  description: string;
  time: string;
  created_at: string;
  metadata?: {
    mentor_name?: string;
    rating?: number;
    session_type?: string;
  };
}

export function useMenteeRecentActivity() {
  const [activities, setActivities] = useState<MenteeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { menteeProfile } = useAuth();

  useEffect(() => {
    if (!menteeProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchRecentActivity = async () => {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        // Fetch recent sessions
        const { data: recentSessions, error: sessionsError } = await supabase
          .from("sessions")
          .select(
            "id, session_date, status, session_type, mentor_id, created_at"
          )
          .eq("mentee_id", menteeProfile.id)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (sessionsError) throw sessionsError;

        // Fetch mentor info for sessions
        const mentorIds = [
          ...new Set((recentSessions || []).map((s) => s.mentor_id)),
        ];
        let mentorMap = new Map();

        if (mentorIds.length > 0) {
          const { data: mentorProfiles, error: mentorError } = await supabase
            .from("mentor_profiles")
            .select("id, user_id")
            .in("id", mentorIds);

          if (!mentorError && mentorProfiles) {
            const userIds = mentorProfiles.map((mp) => mp.user_id);
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, first_name, last_name")
              .in("id", userIds);

            if (!profilesError && profiles) {
              const profileMap = new Map(profiles.map((p) => [p.id, p]));
              mentorProfiles.forEach((mp) => {
                const profile = profileMap.get(mp.user_id);
                if (profile) {
                  mentorMap.set(
                    mp.id,
                    `${profile.first_name || ""} ${
                      profile.last_name || ""
                    }`.trim() || "Mentor"
                  );
                }
              });
            }
          }
        }

        // Fetch feedback/reviews
        const sessionIds = recentSessions?.map((s) => s.id) || [];
        let feedbackMap = new Map();
        if (sessionIds.length > 0) {
          const { data: feedback, error: feedbackError } = await supabase
            .from("session_feedback")
            .select("session_id, rating")
            .in("session_id", sessionIds);

          if (!feedbackError && feedback) {
            feedback.forEach((f) => {
              feedbackMap.set(f.session_id, f.rating);
            });
          }
        }

        // Transform sessions into activities
        const transformedActivities: MenteeActivity[] = (recentSessions || [])
          .map((session) => {
            const mentorName = mentorMap.get(session.mentor_id) || "Mentor";
            const rating = feedbackMap.get(session.id);
            const timeAgo = formatDistanceToNow(new Date(session.created_at), {
              addSuffix: true,
            });

            if (session.status === "completed") {
              return {
                id: `session_completed_${session.id}`,
                type: "session_completed",
                title: "Session Completed",
                description: `${
                  session.session_type || "Mentorship session"
                } with ${mentorName}`,
                time: timeAgo,
                created_at: session.created_at,
                metadata: {
                  mentor_name: mentorName,
                  rating,
                  session_type: session.session_type,
                },
              };
            } else if (
              session.status === "scheduled" ||
              session.status === "confirmed"
            ) {
              return {
                id: `session_booked_${session.id}`,
                type: "session_booked",
                title: "Session Booked",
                description: `${
                  session.session_type || "Mentorship session"
                } scheduled with ${mentorName}`,
                time: timeAgo,
                created_at: session.created_at,
                metadata: {
                  mentor_name: mentorName,
                  session_type: session.session_type,
                },
              };
            }
            return null;
          })
          .filter(Boolean) as MenteeActivity[];

        // Sort by created_at descending
        transformedActivities.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(transformedActivities.slice(0, 10));
      } catch (error) {
        // Silently handle error
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, [menteeProfile?.id]);

  return { activities, isLoading };
}
