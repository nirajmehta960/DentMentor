-- Migration: Fix Booking Reservations Status Constraint
-- Description: Updates the check constraint to allow new payment statuses.

ALTER TABLE public.booking_reservations
DROP CONSTRAINT IF EXISTS booking_reservations_status_check;

ALTER TABLE public.booking_reservations
ADD CONSTRAINT booking_reservations_status_check
CHECK (status IN (
  'pending',     -- Likely original
  'confirmed',   -- Original/Standard
  'cancelled',   -- Original/Standard
  'completed',   -- Likely original
  'held',        -- New
  'pending_payment', -- New
  'paid',        -- New
  'expired'      -- New
));
