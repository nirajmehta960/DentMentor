import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Availability {
  id: string;
  mentor_id: string;
  date: string;
  time_slots: any;
  is_available: boolean;
  duration_minutes?: number;
}

async function fetchAvailability(mentorId: string): Promise<Availability[]> {
  const { data, error } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('is_available', true)
    .order('date');

  if (error) {
    throw error;
  }
  
  return data || [];
}

async function updateAvailabilityInDB(mentorId: string, date: string, timeSlots: string[]): Promise<Availability> {
  // Convert string format time slots to proper JSONB format
  const jsonbTimeSlots = timeSlots.map(slot => {
    // Handle format: "14:30-15:00:30" or "08:30-09:30:60"
    if (slot.includes('-') && slot.split(':').length >= 4) {
      const parts = slot.split('-');
      const startTime = parts[0];
      const endTimeAndDuration = parts[1].split(':');
      const endTime = `${endTimeAndDuration[0]}:${endTimeAndDuration[1]}`;
      const duration = parseInt(endTimeAndDuration[2] || '60');
      
      return {
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        is_available: true
      };
    }
    
    // Handle format: "14:30-15:00" (assume 60 min duration)
    if (slot.includes('-') && slot.split(':').length === 3) {
      const [startTime, endTime] = slot.split('-');
      return {
        start_time: startTime,
        end_time: endTime,
        duration_minutes: 60,
        is_available: true
      };
    }
    
    // Fallback: treat as single time slot
    return {
      start_time: slot,
      end_time: slot,
      duration_minutes: 60,
      is_available: true
    };
  });

  // Calculate total duration from time slots
  const totalDuration = jsonbTimeSlots.reduce((total, slot) => {
    return total + (slot.duration_minutes || 60);
  }, 0);

  const { data, error } = await supabase
    .from('mentor_availability')
    .upsert({
      mentor_id: mentorId,
      date,
      time_slots: jsonbTimeSlots,
      is_available: jsonbTimeSlots.length > 0,
      duration_minutes: totalDuration || 60 // Include duration_minutes field
    }, {
      onConflict: 'mentor_id,date'
    })
    .select()
    .single();

  if (error) {
    // Silently handle error
    throw error;
  }

  return data;
}

export function useAvailability() {
  const { mentorProfile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: availability = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['mentorAvailability', mentorProfile?.id],
    queryFn: () => fetchAvailability(mentorProfile!.id),
    enabled: !!mentorProfile?.id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    gcTime: 300000,
    keepPreviousData: false,
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ date, timeSlots }: { date: string; timeSlots: string[] }) => 
      updateAvailabilityInDB(mentorProfile!.id, date, timeSlots),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['mentorAvailability', mentorProfile?.id] });
      await new Promise(resolve => setTimeout(resolve, 200));
      await refetch();
      
      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated."
      });
    },
    onError: (error) => {
      // Silently handle error
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateAvailability = async (date: string, timeSlots: string[]) => {
    if (!mentorProfile?.id) {
      return;
    }
    
    updateAvailabilityMutation.mutate({ date, timeSlots });
  };

  return { 
    availability, 
    updateAvailability, 
    isLoading: isLoading && !isFetching,
    isUpdating: updateAvailabilityMutation.isPending,
    refetch
  };
}
