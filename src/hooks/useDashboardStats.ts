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
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('status', 'completed')
          .gte('session_date', startOfMonth.toISOString());

        if (sessionsError) {
          // Silently handle sessions error
        }

        // Get earnings this month from transactions table
        let earnings = [];
        try {
          const { data: earningsData, error: earningsError } = await supabase
            .from('transactions')
            .select('amount, transaction_type, status, processed_at')
            .eq('mentor_id', mentorProfile.id)
            .eq('transaction_type', 'earning')
            .gte('created_at', startOfMonth.toISOString());

          if (earningsError) {
            // Silently handle earnings error
            earnings = [];
          } else {
            earnings = earningsData || [];
          }
        } catch (error) {
          // Silently handle earnings error
          earnings = [];
        }

        // Get average rating
        let feedback = [];
        try {
          const sessionIds = await supabase
            .from('sessions')
            .select('id')
            .eq('mentor_id', mentorProfile.id)
            .then(res => res.data?.map(s => s.id) || []);

          if (sessionIds.length > 0) {
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('session_feedback')
              .select('rating')
              .in('session_id', sessionIds);

            if (feedbackError) {
              // Silently handle feedback error
              feedback = [];
            } else {
              feedback = feedbackData || [];
            }
          }
        } catch (error) {
          // Silently handle feedback error
          feedback = [];
        }

        // Get unique mentees
        let uniqueMentees = [];
        try {
          const { data: menteesData, error: menteesError } = await supabase
            .from('sessions')
            .select('mentee_id')
            .eq('mentor_id', mentorProfile.id);

          if (menteesError) {
            // Silently handle mentees error
            uniqueMentees = [];
          } else {
            uniqueMentees = menteesData || [];
          }
        } catch (error) {
          // Silently handle mentees error
          uniqueMentees = [];
        }

        const sessionsThisMonth = sessions?.length || 0;
        const earningsThisMonth = earnings?.reduce((sum, e) => {
          // Use amount field from transactions table
          return sum + (e.amount || 0);
        }, 0) || 0;
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
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [mentorProfile?.id]);

  return { stats, isLoading };
}