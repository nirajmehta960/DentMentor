import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfMonth, endOfMonth } from "date-fns";

export interface BookedSession {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  mentee_id: string;
  notes?: string;
  meeting_link?: string;
  price_paid?: number;
  payment_status?: string;
  mentee_name?: string;
  mentee_email?: string;
}

export function useBookedSessions(month: Date) {
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchBookedSessions = async () => {
      try {
        setIsLoading(true);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        // Fetch sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("mentor_id", mentorProfile.id)
          .in("status", ["scheduled", "confirmed", "completed"])
          .gte("session_date", monthStart.toISOString())
          .lte("session_date", monthEnd.toISOString())
          .order("session_date", { ascending: true });

        if (sessionsError) throw sessionsError;

        // Fetch mentee profiles for all sessions
        const menteeIds = [
          ...new Set((sessions || []).map((s) => s.mentee_id)),
        ];
        const { data: menteeProfiles, error: menteeError } = await supabase
          .from("mentee_profiles")
          .select("id, user_id")
          .in("id", menteeIds);

        if (menteeError) throw menteeError;

        // Fetch profiles for mentees
        const userIds = menteeProfiles?.map((mp) => mp.user_id) || [];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Create a map for quick lookup
        const menteeProfileMap = new Map(
          menteeProfiles?.map((mp) => [mp.id, mp.user_id]) || []
        );
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        // Transform the data to include mentee names
        const transformedSessions = (sessions || []).map((session) => {
          const menteeUserId = menteeProfileMap.get(session.mentee_id);
          const profile = menteeUserId ? profileMap.get(menteeUserId) : null;

          return {
            id: session.id,
            session_date: session.session_date,
            duration_minutes: session.duration_minutes,
            session_type: session.session_type,
            status: session.status,
            mentee_id: session.mentee_id,
            notes: session.notes,
            meeting_link: session.meeting_link,
            price_paid: session.price_paid,
            payment_status: session.payment_status,
            mentee_name: profile
              ? `${profile.first_name || ""} ${
                  profile.last_name || ""
                }`.trim() || "Unknown"
              : "Unknown",
            mentee_email: "", // Email is stored in auth.users, not accessible from profiles table
          };
        });

        setBookedSessions(transformedSessions);
      } catch (error) {
        console.error("Error fetching booked sessions:", error);
        setBookedSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedSessions();
  }, [mentorProfile?.id, month]);

  const refetch = async () => {
    if (!mentorProfile?.id) return;

    try {
      setIsLoading(true);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .eq("mentor_id", mentorProfile.id)
        .in("status", ["scheduled", "confirmed", "completed"])
        .gte("session_date", monthStart.toISOString())
        .lte("session_date", monthEnd.toISOString())
        .order("session_date", { ascending: true });

      if (sessionsError) throw sessionsError;

      const menteeIds = [...new Set((sessions || []).map((s) => s.mentee_id))];
      const { data: menteeProfiles, error: menteeError } = await supabase
        .from("mentee_profiles")
        .select("id, user_id")
        .in("id", menteeIds);

      if (menteeError) throw menteeError;

      const userIds = menteeProfiles?.map((mp) => mp.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const menteeProfileMap = new Map(
        menteeProfiles?.map((mp) => [mp.id, mp.user_id]) || []
      );
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const transformedSessions = (sessions || []).map((session) => {
        const menteeUserId = menteeProfileMap.get(session.mentee_id);
        const profile = menteeUserId ? profileMap.get(menteeUserId) : null;

        return {
          id: session.id,
          session_date: session.session_date,
          duration_minutes: session.duration_minutes,
          session_type: session.session_type,
          status: session.status,
          mentee_id: session.mentee_id,
          notes: session.notes,
          meeting_link: session.meeting_link,
          price_paid: session.price_paid,
          payment_status: session.payment_status,
          mentee_name: profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              "Unknown"
            : "Unknown",
          mentee_email: profile?.email || "",
        };
      });

      setBookedSessions(transformedSessions);
    } catch (error) {
      console.error("Error refetching booked sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { bookedSessions, isLoading, refetch };
}
