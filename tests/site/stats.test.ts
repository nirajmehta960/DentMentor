import { describe, expect, it, vi } from "vitest";

// The client module throws at import without Supabase env vars.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { STAT_FLOORS } from "@/components/site/content";
import { toLandingStats, visibleStat } from "@/components/site/use-landing-data";

describe("visibleStat", () => {
  it("shows a value at or above its floor", () => {
    expect(visibleStat(10, 10)).toBe(10);
    expect(visibleStat(42, 10)).toBe(42);
  });

  it("hides a value below its floor instead of showing a weak number", () => {
    expect(visibleStat(9, 10)).toBeNull();
    expect(visibleStat(0, 1)).toBeNull();
  });

  it("hides anything that isn't a finite number", () => {
    for (const bad of [undefined, null, "12", NaN, Infinity, {}]) {
      expect(visibleStat(bad, 0)).toBeNull();
    }
  });
});

describe("toLandingStats", () => {
  it("maps the RPC's snake_case keys through each floor", () => {
    const stats = toLandingStats({
      verified_mentors: STAT_FLOORS.verifiedMentors,
      sessions_completed: STAT_FLOORS.sessionsCompleted - 1,
      countries: STAT_FLOORS.countries + 3,
    });
    expect(stats).toEqual({
      verifiedMentors: STAT_FLOORS.verifiedMentors,
      sessionsCompleted: null,
      countries: STAT_FLOORS.countries + 3,
    });
  });

  it("hides everything for a missing or malformed payload", () => {
    const hidden = { verifiedMentors: null, sessionsCompleted: null, countries: null };
    expect(toLandingStats(null)).toEqual(hidden);
    expect(toLandingStats("nope")).toEqual(hidden);
    expect(toLandingStats({})).toEqual(hidden);
  });
});
