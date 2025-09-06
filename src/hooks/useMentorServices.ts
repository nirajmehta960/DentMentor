import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MentorService {
  id: string;
  mentor_id: string;
  service_type: string;
  service_title: string;
  service_description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateServiceData {
  service_title: string;
  service_description?: string;
  duration_minutes: number;
  price: number;
  service_type?: string;
}

export function useMentorServices() {
  const [services, setServices] = useState<MentorService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mentorProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('mentor_services')
          .select('*')
          .eq('mentor_id', mentorProfile.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setServices(data || []);
      } catch (error) {
        console.error('Error fetching mentor services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [mentorProfile?.id]);

  const createService = async (serviceData: CreateServiceData) => {
    if (!mentorProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('mentor_services')
        .insert({
          mentor_id: mentorProfile.id,
          ...serviceData,
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating mentor service:', error);
      throw error;
    }
  };

  const updateService = async (id: string, serviceData: Partial<CreateServiceData>) => {
    try {
      const { data, error } = await supabase
        .from('mentor_services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === id ? data : service
      ));
      return data;
    } catch (error) {
      console.error('Error updating mentor service:', error);
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
    } catch (error) {
      console.error('Error deleting mentor service:', error);
      throw error;
    }
  };

  return {
    services,
    isLoading,
    createService,
    updateService,
    deleteService,
  };
}