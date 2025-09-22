import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  mentee_id: string;
  notes?: string;
  meeting_link?: string;
  price_paid?: number | null;
  payment_status?: string;
  // Enriched data
  mentee?: {
    name: string;
    profile: any;
    menteeProfile: any;
    email?: string;
  };
  service?: {
    id: string;
    title: string;
    description?: string;
    price?: number;
  };
}

export function useUpcomingSessions() {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchUpcomingSessions = async () => {
      try {
        const now = new Date();

        // Fetch sessions
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .in('status', ['scheduled', 'confirmed'])
          .gte('session_date', now.toISOString())
          .order('session_date', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (!sessions || sessions.length === 0) {
          setUpcomingSessions([]);
          return;
        }

        // Fetch mentee profiles
        const menteeIds = [...new Set(sessions.map((s) => s.mentee_id))];
        const { data: menteeProfiles, error: menteeError } = await supabase
          .from('mentee_profiles')
          .select('*')
          .in('id', menteeIds);

        if (menteeError) throw menteeError;

        // Fetch user profiles for mentees
        const userIds = menteeProfiles?.map((mp) => mp.user_id) || [];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Fetch booking reservations to get service information
        const sessionIds = sessions.map((s) => s.id);
        const { data: reservations, error: reservationsError } = await supabase
          .from('booking_reservations')
          .select('session_id, service_id')
          .in('session_id', sessionIds);

        if (reservationsError) throw reservationsError;

        // Fetch service details
        const serviceIds = [...new Set(
          reservations?.map((r) => r.service_id).filter(Boolean) || []
        )];
        const { data: services, error: servicesError } = await supabase
          .from('mentor_services')
          .select('*')
          .in('id', serviceIds);

        if (servicesError) throw servicesError;

        // Create maps for quick lookup
        const menteeProfileMap = new Map(
          menteeProfiles?.map((mp) => [mp.id, mp]) || []
        );
        // Map profiles by user_id since that's what we use for lookup
        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
        const reservationMap = new Map(
          reservations?.map((r) => [r.session_id, r]) || []
        );
        const serviceMap = new Map(services?.map((s) => [s.id, s]) || []);

        // Transform sessions with mentee and service info
        const enrichedSessions: Session[] = sessions.map((session) => {
          const menteeProfile = menteeProfileMap.get(session.mentee_id);
          const profile = menteeProfile
            ? profileMap.get(menteeProfile.user_id)
            : null;
          const reservation = reservationMap.get(session.id);
          const service = reservation?.service_id
            ? serviceMap.get(reservation.service_id)
            : null;

          // Get mentee name from profile - prioritize actual name, fallback to a default if needed
          let menteeName: string = 'Mentee';
          if (profile) {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            if (fullName) {
              menteeName = fullName;
            } else if (profile.first_name) {
              menteeName = profile.first_name;
            } else if (profile.last_name) {
              menteeName = profile.last_name;
            }
          }

          // Always include mentee data if we have menteeProfile, even if name lookup failed
          const menteeData = menteeProfile ? {
            name: menteeName,
            profile: profile || null,
            menteeProfile: menteeProfile,
          } : undefined;

          return {
            ...session,
            mentee: menteeData,
            service: service
              ? {
                  id: service.id,
                  title: service.service_title || session.session_type || 'Session',
                  description: service.service_description || null,
                  price: service.price || null,
                }
              : {
                  id: '',
                  title: session.session_type || 'Session',
                },
          };
        });

        setUpcomingSessions(enrichedSessions);
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        setUpcomingSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, [mentorProfile?.id]);

  return { upcomingSessions, isLoading };
}