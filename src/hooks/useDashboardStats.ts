import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  sessionsThisMonth: number;
  earningsThisMonth: number;
  averageRating: number;
  totalMentees: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get sessions this month
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('status', 'completed')
          .gte('session_date', startOfMonth.toISOString());

        // Get earnings this month
        const { data: earnings } = await supabase
          .from('earnings')
          .select('net_amount')
          .eq('mentor_id', mentorProfile.id)
          .gte('earning_date', startOfMonth.toISOString());

        // Get average rating
        const { data: feedback } = await supabase
          .from('session_feedback')
          .select('rating')
          .in('session_id', 
            await supabase
              .from('sessions')
              .select('id')
              .eq('mentor_id', mentorProfile.id)
              .then(res => res.data?.map(s => s.id) || [])
          );

        // Get unique mentees
        const { data: uniqueMentees } = await supabase
          .from('sessions')
          .select('mentee_id')
          .eq('mentor_id', mentorProfile.id);

        const sessionsThisMonth = sessions?.length || 0;
        const earningsThisMonth = earnings?.reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0;
        const averageRating = feedback?.length 
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
          : 0;
        const totalMentees = new Set(uniqueMentees?.map(s => s.mentee_id)).size || 0;

        setStats({
          sessionsThisMonth,
          earningsThisMonth,
          averageRating,
          totalMentees
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [mentorProfile?.id]);

  return { stats, isLoading };
}