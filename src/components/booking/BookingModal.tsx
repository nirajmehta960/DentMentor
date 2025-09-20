import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock, DollarSign, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressIndicator, type BookingStep } from './ProgressIndicator';
import { ServiceSelection } from './ServiceSelection';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BookingConfirmation } from './BookingConfirmation';
import { createBooking, type BookingRequest } from '@/lib/api/booking';
import { type Service } from '@/lib/supabase/booking';
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
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

    // Basic validation - the availability calendar already ensures valid date/time selection
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

    // Validate service exists and is active
    if (!selectedService.id) {
      validationErrors.push('Invalid service selected');
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


    // Proceed with booking
    setBookingState('booking');
    setIsLoading(true);

    try {
      // Convert to UTC for the API
      const dateStr = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate;
      
      // Validate date and time before conversion
      if (!dateStr || !selectedTime) {
        throw new Error('Date and time are required for booking');
      }
      
      const sessionStartUTC = convertToUTC(dateStr, selectedTime);

      const bookingRequest: BookingRequest = {
        mentorId,
        menteeId: user.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime
      };

      // Use retry logic for network resilience
      const response = await retryBookingRequest(
        () => createBooking(bookingRequest),
        key
      );

      if (response.success && response.session) {
        setBookingResult(response.session);
        setIsBookingComplete(true);
        setBookingState('success');
        
        // Invalidate caches to refresh data
        await invalidateBookingCaches({
          mentorId,
          menteeId: user.id,
          date: selectedDate,
          queryClient
        });

        toast({
          title: "Booking Confirmed!",
          description: `Your session with ${mentorName} has been scheduled successfully.`,
        });
      } else {
        // Handle booking failure
        const errorMapping = mapBookingError(response.code || 'BOOKING_FAILED', response.details);
        setBookingError(errorMapping);
        setBookingState('error');

        // Generate alternative suggestions if applicable
        if (errorMapping.showAlternatives) {
          // Note: Would need availability data here
          // const suggestions = generateAlternativeSuggestions(availability, selectedDate, selectedTime);
          // setAlternativeSuggestions(suggestions);
        }

        toast({
          title: errorMapping.title,
          description: errorMapping.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Handle specific error types
      let errorCode = 'INTERNAL_ERROR';
      let errorMessage = error.message || 'An unexpected error occurred';
      
      if (error.message?.includes('Invalid date or time')) {
        errorCode = 'INVALID_REQUEST';
        errorMessage = 'Please check your selected date and time';
      } else if (error.message?.includes('Date and time are required')) {
        errorCode = 'INVALID_REQUEST';
        errorMessage = 'Please select a valid date and time';
      }
      
      const errorMapping = mapBookingError(errorCode, error);
      errorMapping.message = errorMessage; // Override with more specific message
      
      setBookingError(errorMapping);
      setBookingState('error');
      
      toast({
        title: errorMapping.title,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
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
        timezone: 'UTC' // This would come from mentor profile
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
              <div><strong>Session ID:</strong> {bookingResult.id}</div>
              <div><strong>Service:</strong> {bookingResult.service_title}</div>
              <div><strong>Duration:</strong> {bookingResult.duration_minutes} minutes</div>
              <div><strong>Price:</strong> ${bookingResult.price}</div>
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