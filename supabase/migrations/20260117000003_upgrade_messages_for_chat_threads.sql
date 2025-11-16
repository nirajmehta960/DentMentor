-- Upgrade public.messages for chat threads

-- Add new columns
alter table public.messages
add column if not exists booking_reservation_id uuid null references public.booking_reservations(id) on delete set null,
add column if not exists conversation_key text null,
add column if not exists updated_at timestamptz default now();

-- Add indexes for performance optimization
create index if not exists messages_session_id_created_at_idx on public.messages(session_id, created_at desc);
create index if not exists messages_booking_reservation_id_created_at_idx on public.messages(booking_reservation_id, created_at desc);
create index if not exists messages_sender_recipient_created_at_idx on public.messages(sender_id, recipient_id, created_at desc);
create index if not exists messages_conversation_key_created_at_idx on public.messages(conversation_key, created_at desc);

-- Function to handle updated_at
create or replace function public.handle_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to keep updated_at current
drop trigger if exists set_messages_updated_at on public.messages;
create trigger set_messages_updated_at
before update on public.messages
for each row
execute function public.handle_messages_updated_at();
