import React, { useState, useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProgressIndicator, type BookingStep } from './ProgressIndicator';
import { ServiceSelection } from './ServiceSelection';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BookingConfirmation } from './BookingConfirmation';
import { bookSession } from '@/lib/api/bookSession';
import { type Service } from '@/lib/supabase/booking';
import { getMentorInfo } from '@/lib/supabase/booking';
import {
  generateIdempotencyKey,
  convertToUTC,
  validateBookingRequest,
  mapBookingError,
  generateAlternativeSuggestions,
  invalidateBookingCaches,
  retryBookingRequest,
  getStoredIdempotencyKey,
  saveIdempotencyKey,
  clearIdempotencyKey,
  generateUUIDIdempotencyKey,
  type ErrorMapping,
  type AlternativeSuggestion
} from '@/lib/utils/booking';
import { useQueryClient } from '@tanstack/react-query';
import { PersonAvatar, formatPrice } from '@/components/mentors/mentor-display';
import { IconTile } from './booking-ui';

import { supabase } from '@/integrations/supabase/client';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  mentorId,
  mentorName,
  mentorAvatar
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [completedSteps, setCompletedSteps] = useState<BookingStep[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // New state for enhanced booking flow
  const [bookingState, setBookingState] = useState<'idle' | 'validating' | 'booking' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<ErrorMapping | null>(null);
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<AlternativeSuggestion[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set()); // Track booked slots to remove from UI
  const [mentorTimezone, setMentorTimezone] = useState<string>("UTC"); // Track mentor's timezone
  const [menteeTimezone, setMenteeTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const { toast } = useToast();
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch mentor timezone when modal opens
  useEffect(() => {
    const fetchMentorTimezone = async () => {
      try {
        const mentorInfo = await getMentorInfo(mentorId);
        // Cast to any to avoid type inference issues with Supabase result types
        const timezone = (mentorInfo.mentorProfile as any).timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setMentorTimezone(timezone);
      } catch (error) {
        // Use default if fetch fails
        setMentorTimezone("UTC");
      }
    };

    if (isOpen && mentorId) {
      fetchMentorTimezone();
    }
  }, [isOpen, mentorId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('service');
      setCompletedSteps([]);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setIsBookingComplete(false);
      setBookingResult(null);

      // Reset enhanced booking state
      setBookingState('idle');
      setBookingError(null);
      setAlternativeSuggestions([]);
      setValidationErrors([]);
      setRetryCount(0);
      setIdempotencyKey('');
    }
  }, [isOpen]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    if (!completedSteps.includes('service')) {
      setCompletedSteps(prev => [...prev, 'service']);
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    if (time && !completedSteps.includes('availability')) {
      setCompletedSteps(prev => [...prev, 'availability']);
    }
  };

  const handleStepNavigation = (step: BookingStep) => {
    // Only allow navigation to completed steps or current step
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep === 'service' && selectedService) {
      setCurrentStep('availability');
    } else if (currentStep === 'availability' && selectedDate && selectedTime) {
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'confirmation') {
      setCurrentStep('availability');
    } else if (currentStep === 'availability') {
      setCurrentStep('service');
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please complete all booking steps.",
        variant: "destructive"
      });
      return;
    }

    // Generate or retrieve idempotency key
    let key = getStoredIdempotencyKey(mentorId, selectedDate, selectedTime);
    if (!key) {
      key = generateUUIDIdempotencyKey();
      saveIdempotencyKey(mentorId, selectedDate, selectedTime, key);
    }
    setIdempotencyKey(key);

    // Client-side validation
    setBookingState('validating');
    setValidationErrors([]);

    const validationErrors: string[] = [];

    // Validate service
    if (!selectedService || selectedService.is_active === false) {
      validationErrors.push('Selected service is no longer available');
    }

    // Validate date and time
    if (!selectedDate || !selectedTime) {
      validationErrors.push('Date and time must be selected');
    }

    // Check if time is in the future
    const dateStr = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate;
    const requestedDateTime = new Date(`${dateStr}T${selectedTime}:00`);
    const now = new Date();

    if (requestedDateTime <= now) {
      validationErrors.push('Cannot book sessions in the past');
    }

    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setBookingState('error');
      setBookingError({
        code: 'INVALID_REQUEST',
        title: 'Validation Failed',
        message: validationErrors.join(', '),
        action: 'Review Details'
      });
      return;
    }

    // Proceed with payment flow
    setBookingState('booking');
    setIsLoading(true);

    try {
      // 1. Create Booking Hold (Reserve slot)
      const { data: holdData, error: holdError } = await supabase.rpc('create_booking_hold', {
        p_mentor_id: mentorId,
        p_service_id: selectedService.id,
        p_mentee_user_id: user.id,
        p_date: dateStr,
        p_start_time_local: selectedTime,
        p_timezone: mentorTimezone, // Use mentor's timezone for consistency
        p_mentee_timezone: menteeTimezone, // Use mentee's selected timezone
        p_idempotency_key: key,
        p_amount_cents: Math.round(selectedService.price * 100)
      });

      if (holdError) {
        throw new Error(holdError.message || 'Failed to reserve slot');
      }

      const reservationData = holdData as any;
      if (!reservationData || !reservationData.reservation_id) {
        throw new Error('No reservation ID returned');
      }

      // 2. Create Stripe Checkout Session
      const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          reservationId: reservationData.reservation_id,
        }),
      });

      if (!checkoutResponse.ok) {
        const errData = await checkoutResponse.json();
        throw new Error(errData.error || 'Failed to create payment session');
      }

      const { data } = await checkoutResponse.json();
      const checkoutUrl = data?.checkoutUrl;

      if (checkoutUrl) {
        // 3. Redirect to Stripe
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Invalid checkout URL received');
      }

    } catch (error: any) {
      console.error("Booking Error:", error);

      let errorCode = 'INTERNAL_ERROR';
      let errorMessage = error.message || 'An unexpected error occurred';

      if (error.message?.includes('SLOT_UNAVAILABLE')) {
        errorCode = 'SLOT_UNAVAILABLE';
        errorMessage = 'This slot was just taken. Please choose another time.';
      } else if (error.message?.includes('IDEMPOTENCY_KEY_EXPIRED')) {
        // Handle expired key: clear it and retry efficiently
        console.log('Idempotency key expired, regenerating...');
        clearIdempotencyKey(mentorId, selectedDate, selectedTime);
        setIdempotencyKey('');

        // Let's just create a new key and retry immediately
        const newKey = generateUUIDIdempotencyKey();
        saveIdempotencyKey(mentorId, selectedDate, selectedTime, newKey);
        setIdempotencyKey(newKey);

        // Retry the call immediately by recursively calling the function
        // The new key is already saved in localStorage, so the next call will pick it up
        return handleConfirmBooking();
      }


      const errorMapping = mapBookingError(errorCode, error);
      errorMapping.message = errorMessage;

      setBookingError(errorMapping);
      setBookingState('error');

      toast({
        title: errorMapping.title,
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleRetryBooking = () => {
    setRetryCount(prev => prev + 1);
    setBookingError(null);
    setAlternativeSuggestions([]);
    handleConfirmBooking();
  };

  const handleSelectAlternative = (suggestion: AlternativeSuggestion) => {
    setSelectedDate(suggestion.date);
    setSelectedTime(suggestion.time);
    setBookingError(null);
    setAlternativeSuggestions([]);
    setBookingState('idle');

    // Navigate to confirmation step
    setCurrentStep('confirmation');
    if (!completedSteps.includes('availability')) {
      setCompletedSteps(prev => [...prev, 'availability']);
    }
  };

  const canProceed = () => {
    if (currentStep === 'service') return selectedService !== null;
    if (currentStep === 'availability') return selectedDate !== null && selectedTime !== null;
    if (currentStep === 'confirmation') return bookingState !== 'booking' && bookingState !== 'validating';
    return true;
  };

  const getBookingData = () => {
    if (!selectedService || !selectedDate || !selectedTime) return null;

    return {
      mentor: {
        id: mentorId,
        name: mentorName,
        avatar: mentorAvatar,
        timezone: mentorTimezone
      },
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      totalPrice: selectedService.price,
      duration: selectedService.duration_minutes || 60
    };
  };

  if (isBookingComplete && bookingResult) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent data-lenis-prevent="" className="sm:max-w-md">
          <DialogHeader className="items-center gap-4 space-y-0 text-center sm:text-center">
            <IconTile icon={CheckCircle} />
            <DialogTitle className="font-display text-xl tracking-[-0.02em]">Booking confirmed</DialogTitle>
            <DialogDescription>
              Your session with {mentorName} has been successfully booked.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border text-sm">
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Service</dt>
                <dd className="text-right font-medium text-foreground">{selectedService?.service_title || 'Service'}</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium tabular-nums text-foreground">{bookingResult.duration_minutes || selectedService?.duration_minutes || 60} minutes</dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-semibold tabular-nums text-foreground">{formatPrice(Number(bookingResult.price_paid || selectedService?.price || 0))}</dd>
              </div>
            </dl>

            <p className="text-center text-sm text-muted-foreground">
              You’ll receive a confirmation email and calendar invite after payment is confirmed.
            </p>

            <Button onClick={onClose} size="lg" className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-lenis-prevent=""
        className="flex max-h-[90vh] flex-col gap-0 overflow-y-auto p-0 sm:max-w-4xl [&>button:last-child]:hidden"
      >
        <DialogHeader className="relative flex-row items-center gap-3 space-y-0 border-b border-border px-5 py-4 text-left sm:px-8 sm:py-5">
          <PersonAvatar name={mentorName} src={mentorAvatar} className="size-11 text-sm" />
          <div className="min-w-0 flex-1 pr-10">
            <DialogTitle className="font-display text-lg tracking-[-0.02em] text-foreground">Book a session</DialogTitle>
            <DialogDescription className="truncate">with {mentorName}</DialogDescription>
          </div>
          <DialogClose className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-5">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-7">
          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepNavigation}
          />

          {/* Error Display */}
          {bookingError && (
            <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{bookingError.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{bookingError.message}</p>

                  {bookingError.action && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBookingError(null)}
                        disabled={bookingState === 'booking'}
                      >
                        <RefreshCw className={bookingState === 'booking' ? 'animate-spin' : ''} aria-hidden="true" />
                        {bookingError.action}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Alternative Suggestions */}
          {alternativeSuggestions.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <h4 className="mb-3 font-semibold text-foreground">Alternative time slots</h4>
              <div className="grid grid-cols-2 gap-2">
                {alternativeSuggestions.slice(0, 6).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAlternative(suggestion)}
                    className="h-auto flex-col items-start rounded-xl p-3 text-left"
                  >
                    <span className="font-medium">{suggestion.displayDate}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">{suggestion.displayTime}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-secondary/25 bg-secondary-light p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-foreground">Please fix the following issues:</h4>
                  <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[360px]">
            {currentStep === 'service' && (
              <ServiceSelection
                mentorId={mentorId}
                onServiceSelect={handleServiceSelect}
                selectedService={selectedService}
                mentorName={mentorName}
                mentorAvatar={mentorAvatar}
              />
            )}

            {currentStep === 'availability' && selectedService && (
              <AvailabilityCalendar
                mentorId={mentorId}
                selectedService={selectedService}
                onDateTimeSelect={handleDateTimeSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                mentorName={mentorName}
                mentorTimezone={mentorTimezone}
                onMenteeTimezoneChange={setMenteeTimezone}
                bookedSlots={bookedSlots}
              />
            )}

            {currentStep === 'confirmation' && getBookingData() && (
              <BookingConfirmation
                bookingData={getBookingData()!}
                onConfirm={handleConfirmBooking}
                onBack={handleBack}
                isLoading={bookingState === 'booking' || bookingState === 'validating'}
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-border bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
            <Button
              variant="outline"
              size="lg"
              onClick={currentStep === 'service' ? onClose : handleBack}
              className="flex-1"
            >
              {currentStep === 'service' ? 'Cancel' : 'Back'}
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {currentStep === 'service' ? 'Continue' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
