-- Migration: Public, read-only RPCs for the marketing landing page
-- Description: Logged-out visitors can't read `profiles` (own-row RLS), `sessions`
-- or `mentee_profiles`. These two SECURITY DEFINER functions expose ONLY
-- aggregate counts and the safe, already-public fields of verified mentors, so
-- the landing page can show live numbers and real mentors without widening any
-- table's RLS. Nothing here returns documents, contact details or user ids.

-- Aggregate counts only. The landing hides each number below its own floor.
CREATE OR REPLACE FUNCTION public.landing_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'verified_mentors', (
      SELECT count(*)
      FROM public.mentor_profiles mp
      WHERE mp.is_active AND mp.is_verified AND mp.onboarding_completed
    ),
    'sessions_completed', (
      SELECT count(*) FROM public.sessions s WHERE s.status = 'completed'
    ),
    'countries', (
      SELECT count(DISTINCT lower(trim(c.country)))
      FROM (
        SELECT mp.country_of_origin AS country
        FROM public.mentor_profiles mp
        WHERE mp.is_active AND mp.is_verified AND mp.onboarding_completed
        UNION ALL
        SELECT me.citizenship_country FROM public.mentee_profiles me
      ) c
      WHERE nullif(trim(c.country), '') IS NOT NULL
    )
  );
$$;

-- Verified, active mentors with the fields the /mentors directory already shows.
CREATE OR REPLACE FUNCTION public.featured_mentors(p_limit integer DEFAULT 6)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  headline text,
  us_dental_school text,
  specializations text[],
  average_rating numeric,
  total_sessions integer,
  starting_price numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    mp.id,
    nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '') AS display_name,
    coalesce(mp.profile_photo_url, p.avatar_url) AS avatar_url,
    mp.professional_headline AS headline,
    mp.us_dental_school,
    mp.specializations,
    mp.average_rating::numeric,
    coalesce(mp.total_sessions, 0)::integer AS total_sessions,
    (
      SELECT min(ms.price)::numeric
      FROM public.mentor_services ms
      WHERE ms.mentor_id = mp.id AND ms.is_active
    ) AS starting_price
  FROM public.mentor_profiles mp
  JOIN public.profiles p ON p.user_id = mp.user_id
  WHERE mp.is_active AND mp.is_verified AND mp.onboarding_completed
  ORDER BY coalesce(mp.total_sessions, 0) DESC, mp.average_rating DESC NULLS LAST, mp.created_at
  LIMIT least(greatest(coalesce(p_limit, 6), 1), 12);
$$;

REVOKE ALL ON FUNCTION public.landing_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.featured_mentors(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.landing_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.featured_mentors(integer) TO anon, authenticated;
