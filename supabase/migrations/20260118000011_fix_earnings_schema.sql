-- Add missing platform_fee column to earnings table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'platform_fee') then
    alter table public.earnings add column platform_fee numeric not null default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'net_amount') then
    alter table public.earnings add column net_amount numeric;
    -- Optional: Update net_amount to match amount for existing rows if needed, but not critical for now
  end if;
  
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'earning_date') then
      alter table public.earnings add column earning_date timestamp with time zone default now();
  end if;

   if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'earnings' and column_name = 'payout_status') then
      alter table public.earnings add column payout_status text default 'pending';
  end if;

end;
$$;
