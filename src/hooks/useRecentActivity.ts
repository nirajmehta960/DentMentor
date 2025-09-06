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
        // This is a simplified version - in a real app, you'd have an activities table
        // For now, we'll simulate activities from recent sessions, earnings, etc.
        
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'session_completed',
            title: 'Session Completed',
            description: 'Completed a 1-hour mentoring session about dental school applications',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            metadata: {
              mentee_name: 'Sarah Johnson'
            }
          },
          {
            id: '2',
            type: 'new_feedback',
            title: 'New Feedback Received',
            description: 'Received a 5-star rating with positive feedback',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            metadata: {
              mentee_name: 'Michael Chen',
              rating: 5
            }
          },
          {
            id: '3',
            type: 'payment_received',
            title: 'Payment Received',
            description: 'Payment of $75 received for completed session',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            metadata: {
              amount: 75
            }
          },
          {
            id: '4',
            type: 'new_message',
            title: 'New Message',
            description: 'You have a new message from a mentee',
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            metadata: {
              mentee_name: 'Emma Williams'
            }
          }
        ];

        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, [mentorProfile?.id]);

  return { activities, isLoading };
}