import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock, DollarSign, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
  type ErrorMapping,
  type AlternativeSuggestion
} from '@/lib/utils/booking';
import { useQueryClient } from '@tanstack/react-query';
import { sendBookingConfirmationEmails } from '@/services/emailService';
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

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch mentor timezone when modal opens
  useEffect(() => {
    const fetchMentorTimezone = async () => {
      try {
        const mentorInfo = await getMentorInfo(mentorId);
        const timezone = mentorInfo.mentorProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
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

    // Generate idempotency key
    const key = generateIdempotencyKey(mentorId, selectedService.id, selectedDate, selectedTime, user.id);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservationData.reservation_id,
          menteeId: user.id,
          serviceId: selectedService.id,
          origin: window.location.origin,
        }),
      });

      if (!checkoutResponse.ok) {
        const errData = await checkoutResponse.json();
        throw new Error(errData.error || 'Failed to create payment session');
      }

      const { checkoutUrl } = await checkoutResponse.json();

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              Booking Confirmed!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-center">
            <p className="text-muted-foreground">
              Your session with {mentorName} has been successfully booked.
            </p>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <div><strong>Service:</strong> {selectedService?.service_title || 'Service'}</div>
              <div><strong>Duration:</strong> {bookingResult.duration_minutes || selectedService?.duration_minutes || 60} minutes</div>
              <div><strong>Price:</strong> ${bookingResult.price_paid || selectedService?.price || 0}</div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Confirmation email sent</p>
              <p>✓ Calendar invite will arrive shortly</p>
              <p>✓ Meeting link provided 24h before session</p>
            </div>

            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {mentorAvatar && (
              <img
                src={mentorAvatar}
                alt={mentorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <div className="text-lg font-semibold">Book Session</div>
              <div className="text-sm text-muted-foreground font-normal">
                with {mentorName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepNavigation}
          />

          {/* Error Display */}
          {bookingError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-destructive">{bookingError.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{bookingError.message}</p>

                  {bookingError.action && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetryBooking}
                        disabled={bookingState === 'booking'}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${bookingState === 'booking' ? 'animate-spin' : ''}`} />
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Alternative Time Slots</h4>
              <div className="grid grid-cols-2 gap-2">
                {alternativeSuggestions.slice(0, 6).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAlternative(suggestion)}
                    className="text-left justify-start h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{suggestion.displayDate}</div>
                      <div className="text-sm text-muted-foreground">{suggestion.displayTime}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Please fix the following issues:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[400px]">
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



          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={currentStep === 'service' ? onClose : handleBack}
                className="flex-1"
              >
                {currentStep === 'service' ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                {currentStep === 'service' ? 'Continue' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};