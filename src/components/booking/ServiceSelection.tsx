import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Star, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchMentorServices, type ServicesResponse } from '@/lib/api/booking';
import { type Service } from '@/lib/supabase/booking';

interface ServiceSelectionProps {
  mentorId: string;
  onServiceSelect: (service: Service) => void;
  selectedService: Service | null;
  mentorName: string;
  mentorAvatar?: string;
}

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
  isPopular?: boolean;
  isRecommended?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isSelected, 
  onSelect, 
  isPopular = false,
  isRecommended = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBadgeInfo = () => {
    if (isPopular) return { text: 'Most Popular', variant: 'default' as const };
    if (isRecommended) return { text: 'Recommended', variant: 'secondary' as const };
    if (service.service_type === 'premium') return { text: 'Premium', variant: 'outline' as const };
    return null;
  };

  const badge = getBadgeInfo();

  return (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
      } ${isHovered ? 'scale-[1.02] -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 left-4">
          <Badge variant={badge.variant} className="text-xs font-medium">
            {badge.text}
          </Badge>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {service.service_title}
            </h3>
            {service.service_description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.service_description}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{service.duration_minutes || 60} min</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.8</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ${service.price}
            </div>
            <div className="text-xs text-muted-foreground">
              per session
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">What's included:</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>1-on-1 video session</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Personalized guidance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Session notes & resources</span>
            </div>
            {service.service_type === 'premium' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Follow-up email support</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceSelectionSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 rounded-xl border">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  mentorId,
  onServiceSelect,
  selectedService,
  mentorName,
  mentorAvatar
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response: ServicesResponse = await fetchMentorServices(mentorId);
        
        if (response.success) {
          // Filter to only show active services (already filtered by getMentorServices, but double-check)
          const servicesToUse = response.services.filter(service => service.is_active === true);
          
          setServices(servicesToUse);
          
          // Auto-select first service if only one available
          if (servicesToUse.length === 1 && !selectedService) {
            onServiceSelect(servicesToUse[0]);
          }
        } else {
          setError(response.error || 'Failed to load services');
          toast({
            title: "Error loading services",
            description: response.error || 'Please try again later.',
            variant: "destructive"
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
        setError(errorMessage);
        toast({
          title: "Error loading services",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (mentorId) {
      loadServices();
    }
  }, [mentorId, onServiceSelect, selectedService, toast]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger reload by updating a dependency
    setTimeout(() => {
      const loadServices = async () => {
        try {
          const response = await fetchMentorServices(mentorId);
          if (response.success) {
            setServices(response.services);
          } else {
            setError(response.error || 'Failed to load services');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load services');
        } finally {
          setIsLoading(false);
        }
      };
      loadServices();
    }, 100);
  };

  // Determine which services get special badges
  const getServiceBadges = (services: Service[]) => {
    const badges: { [key: string]: { isPopular?: boolean; isRecommended?: boolean } } = {};
    
    if (services.length > 1) {
      // Most expensive service gets "Premium" (handled in ServiceCard)
      // Most common duration gets "Most Popular"
      const durationCounts = services.reduce((acc, service) => {
        const duration = service.duration_minutes || 60;
        acc[duration] = (acc[duration] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const mostCommonDuration = Object.entries(durationCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (mostCommonDuration) {
        const popularService = services.find(s => 
          (s.duration_minutes || 60).toString() === mostCommonDuration
        );
        if (popularService) {
          badges[popularService.id] = { isPopular: true };
        }
      }
      
      // Middle-priced service gets "Recommended"
      const sortedByPrice = [...services].sort((a, b) => a.price - b.price);
      if (sortedByPrice.length >= 3) {
        const middleIndex = Math.floor(sortedByPrice.length / 2);
        badges[sortedByPrice[middleIndex].id] = { isRecommended: true };
      }
    }
    
    return badges;
  };

  const serviceBadges = getServiceBadges(services);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading services...</span>
          </div>
        </div>
        <ServiceSelectionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Unable to Load Services</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Services Available</h3>
        <p className="text-muted-foreground">
          {mentorName} hasn't set up any services yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Choose a Service</h2>
        <p className="text-muted-foreground">
          Select the type of session you'd like to book with {mentorName}
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onSelect={() => onServiceSelect(service)}
            isPopular={serviceBadges[service.id]?.isPopular}
            isRecommended={serviceBadges[service.id]?.isRecommended}
          />
        ))}
      </div>

      {/* Service Count Info */}
      {services.length > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          {services.length} services available • Select one to continue
        </div>
      )}
    </div>
  );
};