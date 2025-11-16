-- Enable full replica identity for messages table
-- This ensures that UPDATE events include the full row data, allowing us to filter by recipient_id even if it wasn't changed
alter table public.messages replica identity full;
