SELECT proname 
FROM pg_proc 
WHERE proname IN ('instant_book_simple', 'cleanup_expired_reservations')
AND pronamespace = 'public'::regnamespace;
