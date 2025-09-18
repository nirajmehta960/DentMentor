import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  mentee_id: string;
  notes?: string;
  meeting_link?: string;
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
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('status', 'scheduled')
          .gte('session_date', now.toISOString())
          .lte('session_date', nextWeek.toISOString())
          .order('session_date');

        if (error) throw error;

        setUpcomingSessions(data || []);
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, [mentorProfile?.id]);

  return { upcomingSessions, isLoading };
}