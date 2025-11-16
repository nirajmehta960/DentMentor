do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type notification_type as enum ('session_booked', 'payment_received', 'feedback_received', 'system');
  end if;
end;
$$;

create table if not exists public.notifications (
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
-- Enable RLS
alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Trigger Function: Notify on New Session
create or replace function public.notify_new_session()
returns trigger as $$
declare
  v_mentor_user_id uuid;
  v_mentee_name text;
begin
  -- Get Mentor User ID
  select user_id into v_mentor_user_id
  from public.mentor_profiles
  where id = NEW.mentor_id;

  -- Get Mentee Name
  select (p.first_name || ' ' || p.last_name) into v_mentee_name
  from public.mentee_profiles mp
  join public.profiles p on p.user_id = mp.user_id
  where mp.id = NEW.mentee_id;

  if v_mentor_user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      v_mentor_user_id,
      'session_booked',
      'New Session Booked',
      'You have a new session booked with ' || coalesce(v_mentee_name, 'a mentee'),
      jsonb_build_object('session_id', NEW.id, 'mentee_id', NEW.mentee_id)
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_session_created
  after insert on public.sessions
  for each row execute function public.notify_new_session();

-- Trigger Function: Notify on Payment
create or replace function public.notify_new_payment()
returns trigger as $$
declare
  v_mentor_user_id uuid;
begin
  if NEW.transaction_type = 'earning' then
    -- Get Mentor User ID
    select user_id into v_mentor_user_id
    from public.mentor_profiles
    where id = NEW.mentor_id;

    if v_mentor_user_id is not null then
      insert into public.notifications (user_id, type, title, message, data)
      values (
        v_mentor_user_id,
        'payment_received',
        'Payment Received',
        'You received a payment of $' || NEW.amount,
        jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount)
      );
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_transaction_created
  after insert on public.transactions
  for each row execute function public.notify_new_payment();

-- Trigger Function: Notify on Feedback
create or replace function public.notify_new_feedback()
returns trigger as $$
declare
  v_mentor_profile_id uuid;
  v_mentor_user_id uuid;
  v_mentee_name text;
begin
  -- Get Mentor Profile ID from Session
  select mentor_id into v_mentor_profile_id
  from public.sessions
  where id = NEW.session_id;

  -- Get Mentor User ID
  select user_id into v_mentor_user_id
  from public.mentor_profiles
  where id = v_mentor_profile_id;

  -- Get Mentee Name
  select (p.first_name || ' ' || p.last_name) into v_mentee_name
  from public.mentee_profiles mp
  join public.profiles p on p.user_id = mp.user_id
  where mp.id = NEW.mentee_id;

  if v_mentor_user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      v_mentor_user_id,
      'feedback_received',
      'New Feedback Received',
      'You received new feedback from ' || coalesce(v_mentee_name, 'a mentee') || ' (' || NEW.rating || '/5)',
      jsonb_build_object('feedback_id', NEW.id, 'session_id', NEW.session_id, 'rating', NEW.rating)
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_feedback_created
  after insert on public.session_feedback
  for each row execute function public.notify_new_feedback();
