-- Create view for chat conversations
-- returns one row per conversation for the current user

create or replace view public.chat_conversations_v as
select
  'session:' || s.id::text as conversation_key,
  s.id as session_id,
  s.mentor_id,
  s.mentee_id,
  mp.user_id as mentor_user_id,
  mte.user_id as mentee_user_id,
  (
    select created_at 
    from public.messages m 
    where m.session_id = s.id 
    order by created_at desc 
    limit 1
  ) as last_message_at,
  (
    select message_text 
    from public.messages m 
    where m.session_id = s.id 
    order by created_at desc 
    limit 1
  ) as last_message_text,
  (
    select count(*) 
    from public.messages m 
    where m.session_id = s.id 
    and m.recipient_id = auth.uid() 
    and m.read_at is null
  ) as unread_count
from
  public.sessions s
join
  public.mentor_profiles mp on s.mentor_id = mp.id
join
  public.mentee_profiles mte on s.mentee_id = mte.id
where
  s.payment_status = 'paid';

-- Grant permissions (assuming public access via API is controlled by RLS on underlying tables, but view needs select grant)
grant select on public.chat_conversations_v to authenticated;
grant select on public.chat_conversations_v to service_role;
