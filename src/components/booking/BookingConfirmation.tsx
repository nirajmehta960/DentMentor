import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CalendarDays, Clock, Link2, Loader2, Mail, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Service } from '@/lib/supabase/booking';
import { LABEL, PersonAvatar, formatPrice } from '@/components/mentors/mentor-display';
import { cn } from '@/lib/utils';
import { StepHeading } from './booking-ui';

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

/** What actually happens after payment — each line is something the product does. */
const NEXT_STEPS = [
  { icon: Mail, text: "You'll receive a confirmation email with session details" },
  { icon: CalendarDays, text: 'A calendar invite will be sent to your email' },
  { icon: Link2, text: 'Meeting link will be provided 24 hours before the session' },
  { icon: RefreshCcw, text: 'You can reschedule up to 24 hours before the session' },
] as const;

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
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
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

  const isPendingPayment = bookingData?.service?.payment_status === 'pending';

  const total = formatPrice(Number(bookingData.totalPrice));

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <StepHeading
          step="Step 3 of 3"
          title="Review and pay"
          description="Check the details, then continue to secure checkout."
        />

        {isPendingPayment && (
          <div className="flex items-start gap-3 rounded-xl border border-secondary/25 bg-secondary-light p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">Payment required</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Session reserved — complete payment to confirm</p>
            </div>
          </div>
        )}
      </div>

      {/* Booking Summary */}
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {/* Mentor Info */}
        <div className="flex items-center gap-4 border-b border-border p-4 sm:p-5">
          <PersonAvatar
            name={bookingData.mentor.name}
            src={bookingData.mentor.avatar}
            className="size-14 text-base"
          />
          <div className="min-w-0">
            <p className={cn(LABEL, 'text-muted-foreground')}>Your mentor</p>
            <h3 className="truncate text-lg font-semibold text-foreground">{bookingData.mentor.name}</h3>
          </div>
        </div>

        {/* Session Details */}
        <dl className="divide-y divide-border">
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:gap-6 sm:px-5">
            <dt className={cn(LABEL, 'shrink-0 pt-0.5 text-muted-foreground sm:w-24')}>Service</dt>
            <dd className="min-w-0">
              <p className="font-medium text-foreground">{bookingData.service.service_title}</p>
              {bookingData.service.service_description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{bookingData.service.service_description}</p>
              )}
            </dd>
          </div>

          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:gap-6 sm:px-5">
            <dt className={cn(LABEL, 'shrink-0 pt-0.5 text-muted-foreground sm:w-24')}>When</dt>
            <dd className="min-w-0">
              <p className="font-medium text-foreground">{formatDate(bookingData.date)}</p>
              <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                {formatTime(bookingData.time)} ({bookingData.mentor.timezone})
              </p>
            </dd>
          </div>

          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:gap-6 sm:px-5">
            <dt className={cn(LABEL, 'shrink-0 pt-0.5 text-muted-foreground sm:w-24')}>Duration</dt>
            <dd className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
              {formatDuration(bookingData.duration)}
            </dd>
          </div>
        </dl>

        {/* Price Summary */}
        <div className="flex flex-col gap-2 border-t border-border bg-muted/50 px-4 py-4 sm:px-5">
          <div className="flex items-baseline justify-between gap-4 text-sm text-muted-foreground">
            <span>Session price</span>
            <span className="tabular-nums">{total}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-semibold text-foreground">Total cost</span>
            <span className="text-xl font-semibold tabular-nums text-foreground">{total}</span>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="flex flex-col gap-3">
        <h3 className={cn(LABEL, 'text-primary')}>What happens next</h3>
        <ul className="flex flex-col gap-2.5">
          {NEXT_STEPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-foreground">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-white">
                <Icon className="size-3.5 text-primary" aria-hidden="true" />
              </span>
              <span className="pt-1 leading-snug">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cancellation Policy */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <strong className="font-semibold text-foreground">Cancellation Policy:</strong> You can cancel or reschedule your session up to 24 hours
          before the scheduled time for a full refund. Cancellations within 24 hours are subject to a 50%
          cancellation fee.
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            className="mt-0.5"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-foreground">
            I agree to the{' '}
            <a href="/terms" className="font-medium text-primary underline-offset-4 hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and understand that this session is for educational guidance only and does not
            constitute professional medical advice.
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="policy"
            className="mt-0.5"
            checked={acceptedPolicy}
            onCheckedChange={(checked) => setAcceptedPolicy(checked as boolean)}
          />
          <label htmlFor="policy" className="cursor-pointer text-sm leading-relaxed text-foreground">
            I have read and accept the{' '}
            <a href="/cancellation-policy" className="font-medium text-primary underline-offset-4 hover:underline" target="_blank">
              Cancellation Policy
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline" target="_blank">
              Privacy Policy
            </a>.
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
          className="sm:flex-1"
        >
          Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="sm:flex-[2]"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Holding your slot…
            </>
          ) : (
            <>
              Continue to payment
              <span className="hidden tabular-nums sm:inline">· {total}</span>
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      {/* Payment Info */}
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        You'll pay <span className="tabular-nums">{total}</span> securely on Stripe Checkout. Your time is held for
        you while you pay.
      </p>
    </div>
  );
};
