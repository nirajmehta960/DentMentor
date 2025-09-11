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
  // Calculate total duration from time slots
  const totalDuration = timeSlots.reduce((total, slot) => {
    const duration = slot.split(':').pop();
    return total + (parseInt(duration) || 60);
  }, 0);

  const { data, error } = await supabase
    .from('mentor_availability')
    .upsert({
      mentor_id: mentorId,
      date,
      time_slots: timeSlots,
      is_available: timeSlots.length > 0,
      duration_minutes: totalDuration || 60 // Include duration_minutes field
    }, {
      onConflict: 'mentor_id,date'
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
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
      console.error('Availability update error:', error);
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
