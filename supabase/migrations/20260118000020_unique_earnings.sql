-- Migration: Unique Earning Per Session
-- Description: Ensures only one earning transaction exists per session to prevent duplicate payouts.

-- Create a unique index on transactions where type is 'earning'
CREATE UNIQUE INDEX IF NOT EXISTS transactions_unique_earning_per_session_idx
ON public.transactions (session_id)
WHERE transaction_type = 'earning';
