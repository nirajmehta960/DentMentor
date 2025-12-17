import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MenteeDashboardStats {
  sessionsCompleted: number;
  upcomingSessions: number;
  mentorsConnected: number;
  hoursOfMentorship: number;
}

export function useMenteeDashboardStats() {
  const [stats, setStats] = useState<MenteeDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { menteeProfile } = useAuth();

  useEffect(() => {
    if (!menteeProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get completed sessions
        const { data: completedSessions, error: completedError } =
          await supabase
            .from("sessions")
            .select("id, duration_minutes")
            .eq("mentee_id", menteeProfile.id)
            .eq("status", "completed")
            .gte("session_date", startOfMonth.toISOString());

        if (completedError) {
          // Silently handle error
        }

        // Get upcoming sessions
        const { data: upcomingSessionsData, error: upcomingError } =
          await supabase
            .from("sessions")
            .select("id")
            .eq("mentee_id", menteeProfile.id)
            .in("status", ["scheduled", "confirmed"])
            .gte("session_date", now.toISOString());

        if (upcomingError) {
          // Silently handle error
        }

        // Get unique mentors connected
        const { data: allSessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("mentor_id")
          .eq("mentee_id", menteeProfile.id)
          .in("status", ["scheduled", "confirmed", "completed"]);

        if (sessionsError) {
          // Silently handle error
        }

        // Get total hours of mentorship (all completed sessions)
        const { data: allCompletedSessions, error: allCompletedError } =
          await supabase
            .from("sessions")
            .select("duration_minutes")
            .eq("mentee_id", menteeProfile.id)
            .eq("status", "completed");

        if (allCompletedError) {
          // Silently handle error
        }

        const sessionsCompleted = completedSessions?.length || 0;
        const upcomingSessions = upcomingSessionsData?.length || 0;
        const uniqueMentors = new Set(
          allSessions?.map((s) => s.mentor_id) || []
        ).size;
        const totalMinutes =
          allCompletedSessions?.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0
          ) || 0;
        const hoursOfMentorship = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal place

        setStats({
          sessionsCompleted,
          upcomingSessions,
          mentorsConnected: uniqueMentors,
          hoursOfMentorship,
        });
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [menteeProfile?.id]);

  return { stats, isLoading };
}
