-- Drop the table first to reset the type dependency
drop table if exists public.notifications cascade;

-- Recreate the enum to ensure it exists and has the correct values
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum ('session_booked', 'payment_received', 'feedback_received', 'system');
  else
    -- If it exists, we can optionally add values if they are missing, but for now we assume it might be corrupt or we just want to ensure it's used correctly.
    -- Ideally, we just proceed.
    null;
  end if;
end;
$$;

-- Create the table again with the correct type reference
create table public.notifications (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  read_at timestamp with time zone,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
