import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  metadata?: {
    mentee_name?: string;
    mentee_avatar?: string;
    amount?: number;
    rating?: number;
    session_id?: string;
  };
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchRecentActivity = async () => {

      try {
        const allActivities: Activity[] = [];

        // Fetch all sessions (scheduled, confirmed, and completed) to show bookings and completions
        const { data: allSessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, session_date, duration_minutes, session_type, mentee_id, status, created_at')
          .eq('mentor_id', mentorProfile.id)
          .in('status', ['scheduled', 'confirmed', 'completed'])
          .order('created_at', { ascending: false })
          .limit(50);

        if (sessionsError) throw sessionsError;

        // Separate sessions by status
        const completedSessions = allSessions?.filter(s => s.status === 'completed') || [];
        const bookedSessions = allSessions?.filter(s => ['scheduled', 'confirmed'].includes(s.status)) || [];

        // Fetch session feedback (from all sessions, not just completed)
        const allSessionIds = allSessions?.map(s => s.id) || [];
        const { data: feedback, error: feedbackError } = await supabase
          .from('session_feedback')
          .select('id, session_id, rating, feedback_text, created_at')
          .in('session_id', allSessionIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (feedbackError) throw feedbackError;

        // Fetch transactions (payments)
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('id, session_id, amount, transaction_type, status, created_at')
          .eq('mentor_id', mentorProfile.id)
          .eq('transaction_type', 'earning')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20);

        if (transactionsError) throw transactionsError;

        // Fetch messages (sent to mentor) - include both read and unread
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, session_id, sender_id, message_text, read_at, created_at')
          .eq('recipient_id', mentorProfile.user_id || mentorProfile.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (messagesError) throw messagesError;

        // Get mentee IDs from sessions, feedback, and messages
        const sessionMenteeIds = allSessions?.map(s => s.mentee_id) || [];
        const feedbackMenteeIds = feedback?.map(f => {
          const session = allSessions?.find(s => s.id === f.session_id);
          return session?.mentee_id;
        }).filter(Boolean) || [];

        // For messages, we need to get mentee_id from sender_id
        // First get all sessions that have messages
        const messageSessionIds = messages?.map(m => m.session_id).filter(Boolean) || [];
        let messageSessions: any[] = [];
        if (messageSessionIds.length > 0) {
          const { data: msgSessions, error: messageSessionsError } = await supabase
            .from('sessions')
            .select('id, mentee_id')
            .in('id', messageSessionIds);

          if (messageSessionsError) throw messageSessionsError;
          messageSessions = msgSessions || [];
        }

        const messageMenteeIds = messageSessions?.map(s => s.mentee_id) || [];
        const menteeIds = [...new Set([...sessionMenteeIds, ...feedbackMenteeIds, ...messageMenteeIds])];

        // Fetch mentee profiles for all mentees

        const { data: menteeProfiles, error: menteeError } = await supabase
          .from('mentee_profiles')
          .select('id, user_id')
          .in('id', menteeIds);

        if (menteeError) throw menteeError;

        // Fetch user profiles for mentees
        const userIds = menteeProfiles?.map(mp => mp.user_id) || [];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Create maps for quick lookup
        const menteeProfileMap = new Map(menteeProfiles?.map(mp => [mp.id, mp]) || []);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const feedbackMap = new Map(feedback?.map(f => [f.session_id, f]) || []);

        // Transform booked/scheduled sessions into activities
        bookedSessions?.forEach(session => {
          const menteeProfile = menteeProfileMap.get(session.mentee_id);
          const profile = menteeProfile ? profileMap.get(menteeProfile.user_id) : null;
          const menteeName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mentee'
            : 'Mentee';

          allActivities.push({
            id: `session_booked_${session.id}`,
            type: 'session_booked',
            title: 'Session Booked',
            description: `New ${session.duration_minutes}-minute session booked${session.session_type ? ` for ${session.session_type}` : ''}`,
            created_at: session.created_at,
            metadata: {
              mentee_name: menteeName,
              mentee_avatar: profile?.avatar_url || undefined,
              session_id: session.id,
            },
          });
        });

        // Transform completed sessions into activities
        completedSessions?.forEach(session => {
          const menteeProfile = menteeProfileMap.get(session.mentee_id);
          const profile = menteeProfile ? profileMap.get(menteeProfile.user_id) : null;
          const menteeName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mentee'
            : 'Mentee';

          allActivities.push({
            id: `session_${session.id}`,
            type: 'session_completed',
            title: 'Session Completed',
            description: `Completed a ${session.duration_minutes}-minute mentoring session${session.session_type ? ` about ${session.session_type}` : ''}`,
            created_at: session.session_date || session.created_at,
            metadata: {
              mentee_name: menteeName,
              mentee_avatar: profile?.avatar_url || undefined,
              session_id: session.id,
            },
          });
        });

        // Transform feedback into activities
        feedback?.forEach(fb => {
          const session = allSessions?.find(s => s.id === fb.session_id);
          if (!session) return;

          const menteeProfile = menteeProfileMap.get(session.mentee_id);
          const profile = menteeProfile ? profileMap.get(menteeProfile.user_id) : null;
          const menteeName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mentee'
            : 'Mentee';

          const ratingText = `${fb.rating}-star rating`;
          const feedbackText = fb.feedback_text ? ` with feedback` : '';

          allActivities.push({
            id: `feedback_${fb.id}`,
            type: 'new_feedback',
            title: 'New Feedback Received',
            description: `Received a ${ratingText}${feedbackText}`,
            created_at: fb.created_at,
            metadata: {
              mentee_name: menteeName,
              mentee_avatar: profile?.avatar_url || undefined,
              rating: fb.rating,
              session_id: fb.session_id,
            },
          });
        });

        // Transform transactions into activities
        transactions?.forEach(transaction => {
          const session = allSessions?.find(s => s.id === transaction.session_id);
          const menteeName = session
            ? (() => {
              const menteeProfile = menteeProfileMap.get(session.mentee_id);
              const profile = menteeProfile ? profileMap.get(menteeProfile.user_id) : null;
              return profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mentee'
                : 'Mentee';
            })()
            : undefined;

          allActivities.push({
            id: `transaction_${transaction.id}`,
            type: 'payment_received',
            title: 'Payment Received',
            description: `Payment of $${transaction.amount || 0} received for completed session`,
            created_at: transaction.created_at,
            metadata: {
              mentee_name: menteeName,
              amount: transaction.amount || 0,
              session_id: transaction.session_id,
            },
          });
        });

        // Transform messages into activities
        messages?.forEach(message => {
          const session = messageSessions?.find(s => s.id === message.session_id);
          if (!session) return;

          const menteeProfile = menteeProfileMap.get(session.mentee_id);
          const profile = menteeProfile ? profileMap.get(menteeProfile.user_id) : null;
          const menteeName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Mentee'
            : 'Mentee';

          const preview = message.message_text?.substring(0, 50) || 'New message';

          allActivities.push({
            id: `message_${message.id}`,
            type: 'new_message',
            title: 'New Message',
            description: preview.length === 50 ? `${preview}...` : preview,
            created_at: message.created_at,
            metadata: {
              mentee_name: menteeName,
              mentee_avatar: profile?.avatar_url || undefined,
              session_id: message.session_id,
            },
          });
        });

        // Sort all activities by created_at descending and limit to 20 most recent
        allActivities.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(allActivities.slice(0, 20));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${mentorProfile.user_id || mentorProfile.id}`
        },
        (payload) => {
          console.log('New activity received!', payload);
          // Refresh data on new message
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorProfile?.id, mentorProfile?.user_id]);


  return { activities, isLoading };
}