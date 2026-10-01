import React, { useState, useEffect } from 'react';
import { AlertCircle, CalendarX2, Check, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchMentorServices, type ServicesResponse } from '@/lib/api/booking';
import { type Service } from '@/lib/supabase/booking';
import { formatPrice } from '@/components/mentors/mentor-display';
import { cn } from '@/lib/utils';
import { StepHeading, StepState } from './booking-ui';

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
}

/**
 * One service as a selectable row (a toggle button, like the time slots). Only what the mentor entered is shown — title,
 * description, duration, price and their own "premium" type.
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect }) => {
  const isPremium = service.service_type === 'premium';

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col gap-4 rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow,background-color] duration-200 ease-dm sm:flex-row sm:items-start sm:justify-between sm:p-5',
        isSelected
          ? 'border-primary bg-[rgb(15_112_93/0.04)] shadow-[0_0_0_3px_rgb(15_112_93/0.12)]'
          : 'border-border hover:border-primary/40 hover:shadow-soft'
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200',
            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white'
          )}
        >
          {isSelected ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold leading-snug text-foreground">{service.service_title}</span>
            {isPremium ? (
              <span className="rounded-full bg-[rgb(15_112_93/0.07)] px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-primary">
                Premium
              </span>
            ) : null}
          </span>
          {service.service_description && (
            <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {service.service_description}
            </span>
          )}
        </span>
      </span>

      <span className="flex shrink-0 items-baseline justify-between gap-3 pl-8 sm:flex-col sm:items-end sm:gap-1 sm:pl-0">
        <span className="text-xl font-semibold tabular-nums text-foreground">{formatPrice(Number(service.price))}</span>
        <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {service.duration_minutes || 60} min
        </span>
      </span>
    </button>
  );
};

const ServiceSelectionSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3" aria-hidden="true">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-5">
        <div className="flex flex-1 items-start gap-3">
          <Skeleton className="size-5 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-4 w-12" />
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

  const heading = (
    <StepHeading
      step="Step 1 of 3"
      title="Choose a service"
      description={`Select the type of session you'd like to book with ${mentorName}.`}
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <p className="sr-only" role="status">Loading services…</p>
        <ServiceSelectionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <StepState
        icon={AlertCircle}
        tone="alert"
        title="Unable to load services"
        action={
          <Button onClick={handleRetry} variant="outline" className="h-11">
            Try again
          </Button>
        }
      >
        {error}
      </StepState>
    );
  }

  if (services.length === 0) {
    return (
      <StepState icon={CalendarX2} tone="muted" title="No services available">
        {mentorName} hasn't set up any services yet. Please check back later.
      </StepState>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {heading}

      {/* Services */}
      <ul aria-label="Services" className="flex flex-col gap-3">
        {services.map((service) => (
          <li key={service.id}>
            <ServiceCard
              service={service}
              isSelected={selectedService?.id === service.id}
              onSelect={() => onServiceSelect(service)}
            />
          </li>
        ))}
      </ul>

      {/* Service Count Info */}
      {services.length > 1 && (
        <p className="text-sm tabular-nums text-muted-foreground">
          {services.length} services available · Select one to continue
        </p>
      )}
    </div>
  );
};
