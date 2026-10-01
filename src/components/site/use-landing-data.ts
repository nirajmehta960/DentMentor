import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { STAT_FLOORS } from "./content";

export type LandingStats = {
  verifiedMentors: number | null;
  sessionsCompleted: number | null;
  countries: number | null;
};

export type FeaturedMentor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  school: string | null;
  specializations: string[];
  rating: number | null;
  sessions: number;
  startingPrice: number | null;
};

/** Below its floor, missing or malformed, a number is not shown — never "0". */
export function visibleStat(value: unknown, floor: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= floor ? value : null;
}

export function toLandingStats(raw: unknown): LandingStats {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    verifiedMentors: visibleStat(r.verified_mentors, STAT_FLOORS.verifiedMentors),
    sessionsCompleted: visibleStat(r.sessions_completed, STAT_FLOORS.sessionsCompleted),
    countries: visibleStat(r.countries, STAT_FLOORS.countries),
  };
}

const HIDDEN: LandingStats = { verifiedMentors: null, sessionsCompleted: null, countries: null };

const STALE_MS = 5 * 60 * 1000;

/** Live, floored counts. Loading and error both resolve to "show nothing". */
export function useLandingStats(): LandingStats {
  const { data } = useQuery({
    queryKey: ["landing", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("landing_stats");
      if (error) throw error;
      return toLandingStats(data);
    },
    staleTime: STALE_MS,
    retry: 1,
  });
  return data ?? HIDDEN;
}

/** The row `featured_mentors()` returns (see the 20260929 migration). */
type FeaturedMentorRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  us_dental_school: string | null;
  specializations: string[] | null;
  average_rating: number | null;
  total_sessions: number;
  starting_price: number | null;
};

/** Minimum for the grid to render at all; fewer reads as an empty room. */
export const MIN_FEATURED = 3;

export function useFeaturedMentors(limit = 6) {
  return useQuery({
    queryKey: ["landing", "featured-mentors", limit],
    queryFn: async (): Promise<FeaturedMentor[]> => {
      const { data, error } = await supabase.rpc("featured_mentors", { p_limit: limit });
      if (error) throw error;
      // Typed here rather than inferred: the generated client types don't resolve.
      return ((data ?? []) as FeaturedMentorRow[])
        .filter((row) => !!row.display_name)
        .map((row) => ({
          id: row.id,
          name: row.display_name as string,
          avatarUrl: row.avatar_url,
          headline: row.headline,
          school: row.us_dental_school,
          specializations: row.specializations ?? [],
          rating: row.average_rating,
          sessions: row.total_sessions,
          startingPrice: row.starting_price,
        }));
    },
    staleTime: STALE_MS,
    retry: 1,
  });
}
