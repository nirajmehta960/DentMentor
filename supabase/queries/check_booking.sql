-- ============================================
-- SQL Queries to Verify Bookings in Database
-- ============================================

-- 1. CHECK RECENT SESSIONS (Most Recent First)
-- Shows all sessions ordered by creation date
SELECT 
  s.id,
  s.session_date,
  s.status,
  s.payment_status,
  s.price_paid,
  s.duration_minutes,
  s.created_at,
  -- Get mentor name
  mp.professional_headline as mentor_name,
  -- Get mentee info (via user_id)
  mp_mentee.user_id as mentee_user_id
FROM sessions s
LEFT JOIN mentor_profiles mp ON s.mentor_id = mp.id
LEFT JOIN mentee_profiles mp_mentee ON s.mentee_id = mp_mentee.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 2. CHECK SESSIONS FOR SPECIFIC MENTOR (Replace 'MENTOR_ID' with actual mentor UUID)
-- Find your mentor_id first from mentor_profiles table, then use it here
SELECT 
  s.*,
  mp.professional_headline as mentor_name,
  ms.service_title,
  ms.price as service_price
FROM sessions s
LEFT JOIN mentor_profiles mp ON s.mentor_id = mp.id
LEFT JOIN mentor_services ms ON s.mentee_id = ms.mentor_id  -- Note: This join may need adjustment
WHERE s.mentor_id = 'MENTOR_ID'  -- Replace with actual mentor_id
ORDER BY s.session_date DESC;

-- 3. CHECK BOOKING_RESERVATIONS (Shows idempotency tracking)
-- This table tracks booking attempts and idempotency
SELECT 
  br.*,
  s.session_date,
  s.status as session_status
FROM booking_reservations br
LEFT JOIN sessions s ON br.session_id = s.id
ORDER BY br.created_at DESC
LIMIT 10;

-- 4. CHECK IF SLOT WAS MARKED UNAVAILABLE (Check mentor_availability)
-- This shows if the time slot was updated to is_available=false after booking
SELECT 
  ma.id,
  ma.date,
  ma.mentor_id,
  ma.time_slots,
  ma.is_available,
  ma.updated_at
FROM mentor_availability ma
WHERE ma.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY ma.date DESC, ma.updated_at DESC
LIMIT 20;

-- 5. DETAILED BOOKING CHECK (Get all related data)
-- Comprehensive query showing booking, reservation, and related info
SELECT 
  -- Session info
  s.id as session_id,
  s.session_date,
  s.status as session_status,
  s.payment_status,
  s.price_paid,
  s.duration_minutes,
  s.created_at as session_created_at,
  
  -- Mentor info
  mp.id as mentor_id,
  mp.professional_headline as mentor_name,
  
  -- Mentee info
  mp_mentee.id as mentee_profile_id,
  mp_mentee.user_id as mentee_user_id,
  
  -- Reservation info (if exists)
  br.id as reservation_id,
  br.idempotency_key,
  br.status as reservation_status,
  br.session_start_utc,
  
  -- Service info (need to join via service_id from reservation)
  ms.service_title,
  ms.price as service_price,
  ms.duration_minutes as service_duration
  
FROM sessions s
LEFT JOIN mentor_profiles mp ON s.mentor_id = mp.id
LEFT JOIN mentee_profiles mp_mentee ON s.mentee_id = mp_mentee.id
LEFT JOIN booking_reservations br ON br.session_id = s.id
LEFT JOIN mentor_services ms ON br.service_id = ms.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 6. CHECK TODAY'S BOOKINGS
-- See bookings created today
SELECT 
  s.id,
  s.session_date,
  s.status,
  s.payment_status,
  s.price_paid,
  mp.professional_headline as mentor_name,
  s.created_at
FROM sessions s
LEFT JOIN mentor_profiles mp ON s.mentor_id = mp.id
WHERE DATE(s.created_at) = CURRENT_DATE
ORDER BY s.created_at DESC;

-- 7. FIND YOUR USER'S BOOKINGS (Replace 'YOUR_USER_ID' with auth.users.id)
-- First, get your mentee_profile_id
SELECT mp.id as mentee_profile_id, mp.user_id
FROM mentee_profiles mp
WHERE mp.user_id = 'YOUR_USER_ID';  -- Replace with your auth.users.id

-- Then, use the mentee_profile_id to find sessions
SELECT 
  s.*,
  mp.professional_headline as mentor_name
FROM sessions s
LEFT JOIN mentor_profiles mp ON s.mentor_id = mp.id
WHERE s.mentee_id = (
  SELECT id FROM mentee_profiles 
  WHERE user_id = 'YOUR_USER_ID'  -- Replace with your auth.users.id
)
ORDER BY s.session_date DESC;

-- 8. CHECK EDGE FUNCTION LOGS (in Supabase Dashboard)
-- Go to: Dashboard > Edge Functions > instant-book > Logs
-- Look for recent invocations and their responses

-- 9. VERIFY IDEMPOTENCY (Check if booking was idempotent)
-- If you try to book the same slot twice, the second call should return the same session_id
SELECT 
  br.idempotency_key,
  br.status,
  br.session_id,
  s.session_date,
  COUNT(*) as reservation_count
FROM booking_reservations br
LEFT JOIN sessions s ON br.session_id = s.id
GROUP BY br.idempotency_key, br.status, br.session_id, s.session_date
HAVING COUNT(*) > 1  -- Shows if same idempotency_key was used multiple times
ORDER BY br.created_at DESC;

-- 10. CHECK AVAILABILITY UPDATE (See if time_slots were updated)
-- Compare time_slots before and after booking to see if slot was marked unavailable
-- This requires checking the mentor_availability table for the booked date
SELECT 
  ma.date,
  ma.mentor_id,
  jsonb_array_elements(ma.time_slots) as slot_details,
  ma.updated_at
FROM mentor_availability ma
WHERE ma.date >= CURRENT_DATE
  AND ma.date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY ma.date, ma.updated_at DESC;
