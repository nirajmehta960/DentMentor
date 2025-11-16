-- Create RPC to send session messages securely

create or replace function public.send_session_message(
  p_session_id uuid,
  p_text text
)
returns public.messages -- Returns the inserted message row
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
  v_sender_id uuid := auth.uid();
  v_mentor_user_id uuid;
  v_mentee_user_id uuid;
  v_recipient_id uuid;
  v_inserted_message public.messages;
begin
  -- 1. Validate Session & Payment
  select 
    s.id, 
    s.payment_status, 
    mp.user_id as mentor_user_id, 
    mte.user_id as mentee_user_id
  into v_session
  from public.sessions s
  join public.mentor_profiles mp on s.mentor_id = mp.id
  join public.mentee_profiles mte on s.mentee_id = mte.id
  where s.id = p_session_id;

  if v_session.id is null then
    raise exception 'SESSION_NOT_FOUND';
  end if;

  if v_session.payment_status != 'paid' then
    raise exception 'SESSION_NOT_PAID';
  end if;

  -- 2. Validate Participant & Determine Recipient
  v_mentor_user_id := v_session.mentor_user_id;
  v_mentee_user_id := v_session.mentee_user_id;

  if v_sender_id = v_mentor_user_id then
    v_recipient_id := v_mentee_user_id;
  elsif v_sender_id = v_mentee_user_id then
    v_recipient_id := v_mentor_user_id;
  else
    raise exception 'NOT_A_PARTICIPANT';
  end if;

  -- 3. Insert Message
  insert into public.messages (
    sender_id,
    recipient_id,
    session_id,
    message_text,
    created_at,
    updated_at
    -- conversation_key is optional or can be computed by trigger/view, skipping for now as per view definition using 'session:' || id
  ) values (
    v_sender_id,
    v_recipient_id,
    p_session_id,
    p_text,
    now(),
    now()
  )
  returning * into v_inserted_message;

  return v_inserted_message;
end;
$$;

-- Grant permissions
grant execute on function public.send_session_message to authenticated;
