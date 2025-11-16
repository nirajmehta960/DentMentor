-- Migration: Finalize Earnings Schema Fix
-- Description: Ensures earnings table structure is exactly as expected, including default values for transaction_type.
-- Also cleans up any nulls that might have been inserted during recent retries.

do $$
begin
  -- 1. Ensure transaction_type exists and has a default
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'transaction_type') then
    alter table public.earnings add column transaction_type text default 'earning';
  end if;

  -- 2. Backfill null transaction_type with 'earning'
  update public.earnings set transaction_type = 'earning' where transaction_type is null;

  -- 3. Enforce Not Null on transaction_type (after backfill)
  alter table public.earnings alter column transaction_type set not null;

    -- 4. Ensure other columns exist (idempotent checks just in case)
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'platform_fee') then
    alter table public.earnings add column platform_fee numeric not null default 0;
  end if;

   if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'net_amount') then
      alter table public.earnings add column net_amount numeric;
  end if;

end;
$$;
