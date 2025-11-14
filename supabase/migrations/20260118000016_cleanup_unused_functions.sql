DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- 1. cleanup_expired_reservations: Replaced by release_expired_holds
    FOR r IN (SELECT oid::regprocedure as func_signature FROM pg_proc WHERE proname = 'cleanup_expired_reservations') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

    -- 2. instant_book: Legacy function, replaced or unused
    FOR r IN (SELECT oid::regprocedure as func_signature FROM pg_proc WHERE proname = 'instant_book') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

    -- 3. instant_book_simple: Legacy function, unused
    FOR r IN (SELECT oid::regprocedure as func_signature FROM pg_proc WHERE proname = 'instant_book_simple') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

    -- 4. add_mentor_time_slot: Unused/Legacy
    FOR r IN (SELECT oid::regprocedure as func_signature FROM pg_proc WHERE proname = 'add_mentor_time_slot') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

END $$;
