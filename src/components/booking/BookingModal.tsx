import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar, Clock, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressIndicator, type BookingStep } from './ProgressIndicator';
import { ServiceSelection } from './ServiceSelection';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BookingConfirmation } from './BookingConfirmation';
import { createBooking, type BookingRequest } from '@/lib/api/booking';
import { type Service } from '@/lib/supabase/booking';

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
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('service');
      setCompletedSteps([]);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setIsBookingComplete(false);
      setBookingResult(null);
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

    setIsLoading(true);

    try {
      const bookingRequest: BookingRequest = {
        mentorId,
        menteeId: user.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime
      };

      const response = await createBooking(bookingRequest);

      if (response.success && response.session) {
        setBookingResult(response.session);
        setIsBookingComplete(true);
        toast({
          title: "Booking Confirmed!",
          description: `Your session with ${mentorName} has been scheduled successfully.`,
        });
      } else {
        throw new Error(response.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 'service') return selectedService !== null;
    if (currentStep === 'availability') return selectedDate !== null && selectedTime !== null;
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
                isLoading={isLoading}
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