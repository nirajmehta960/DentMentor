import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SessionRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  requested_date: string;
  duration_minutes: number;
  session_type: string;
  message?: string;
  status: string;
  created_at: string;
}

export function useSessionRequests() {
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchSessionRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('session_requests')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSessionRequests(data || []);
      } catch (error) {
        console.error('Error fetching session requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionRequests();
  }, [mentorProfile?.id]);

  const acceptRequest = async (requestId: string) => {
    try {
      const request = sessionRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status
      const { error: updateError } = await supabase
        .from('session_requests')
        .update({ 
          status: 'accepted',
          mentor_response: 'Request accepted'
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create session
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentor_id: request.mentor_id,
          mentee_id: request.mentee_id,
          session_date: request.requested_date,
          duration_minutes: request.duration_minutes,
          session_type: request.session_type,
          status: 'scheduled'
        });

      if (sessionError) throw sessionError;

      // Remove from local state
      setSessionRequests(prev => prev.filter(r => r.id !== requestId));

      toast({
        title: "Session Request Accepted",
        description: "The session has been scheduled successfully."
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept session request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('session_requests')
        .update({ 
          status: 'declined',
          mentor_response: 'Request declined'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Remove from local state
      setSessionRequests(prev => prev.filter(r => r.id !== requestId));

      toast({
        title: "Session Request Declined",
        description: "The session request has been declined."
      });
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Error",
        description: "Failed to decline session request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { sessionRequests, acceptRequest, declineRequest, isLoading };
}