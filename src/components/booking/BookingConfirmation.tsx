import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type Service } from '@/lib/supabase/booking';

interface BookingData {
  mentor: {
    id: string;
    name: string;
    avatar?: string;
    timezone: string;
  };
  service: Service;
  date: string;
  time: string;
  totalPrice: number;
  duration: number;
}

interface BookingConfirmationProps {
  bookingData: BookingData;
  onConfirm: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
  onBack,
  isLoading
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const canConfirm = acceptedTerms && acceptedPolicy && !isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Confirm Your Booking</h2>
        <p className="text-muted-foreground">
          Please review your session details before confirming
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        {/* Mentor Info */}
        <div className="flex items-center gap-4">
          {bookingData.mentor.avatar && (
            <img
              src={bookingData.mentor.avatar}
              alt={bookingData.mentor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold">{bookingData.mentor.name}</h3>
            <p className="text-sm text-muted-foreground">
              Verified Dental Professional
            </p>
            <Badge variant="secondary" className="text-xs mt-1">
              {bookingData.mentor.timezone}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Session Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{bookingData.service.service_title}</div>
              {bookingData.service.service_description && (
                <div className="text-sm text-muted-foreground">
                  {bookingData.service.service_description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatDate(bookingData.date)}</div>
              <div className="text-sm text-muted-foreground">
                {formatTime(bookingData.time)} ({bookingData.mentor.timezone})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatDuration(bookingData.duration)}</div>
              <div className="text-sm text-muted-foreground">
                Session duration
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">${bookingData.totalPrice}</div>
              <div className="text-sm text-muted-foreground">
                Total cost
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="space-y-3">
        <h3 className="font-semibold">What to expect:</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>You'll receive a confirmation email with session details</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>A calendar invite will be sent to your email</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Meeting link will be provided 24 hours before the session</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>You can reschedule up to 24 hours before the session</span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Cancellation Policy:</strong> You can cancel or reschedule your session up to 24 hours 
          before the scheduled time for a full refund. Cancellations within 24 hours are subject to a 50% 
          cancellation fee.
        </AlertDescription>
      </Alert>

      {/* Terms and Conditions */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and understand that this session is for educational guidance only and does not 
            constitute professional medical advice.
          </label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="policy"
            checked={acceptedPolicy}
            onCheckedChange={(checked) => setAcceptedPolicy(checked as boolean)}
          />
          <label htmlFor="policy" className="text-sm leading-relaxed cursor-pointer">
            I have read and accept the{' '}
            <a href="/cancellation-policy" className="text-primary hover:underline" target="_blank">
              Cancellation Policy
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline" target="_blank">
              Privacy Policy
            </a>.
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>

      {/* Payment Info */}
      <div className="text-center text-xs text-muted-foreground">
        Payment will be processed securely. You will be charged ${bookingData.totalPrice} 
        upon confirmation.
      </div>
    </div>
  );
};