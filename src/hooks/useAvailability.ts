import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Availability {
  id: string;
  mentor_id: string;
  date: string;
  time_slots: any;
  is_recurring: boolean;
  recurring_pattern?: string;
  is_available: boolean;
}

export function useAvailability() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('is_available', true)
          .order('date');

        if (error) throw error;

        setAvailability(data || []);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [mentorProfile?.id]);

  const updateAvailability = async (date: string, timeSlots: string[]) => {
    if (!mentorProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .upsert({
          mentor_id: mentorProfile.id,
          date,
          time_slots: timeSlots,
          is_available: timeSlots.length > 0
        }, {
          onConflict: 'mentor_id,date'
        })
        .select();

      if (error) throw error;

      // Update local state
      setAvailability(prev => {
        const existing = prev.findIndex(a => a.date === date);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data[0];
          return updated;
        } else {
          return [...prev, data[0]];
        }
      });

      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { availability, updateAvailability, isLoading };
}