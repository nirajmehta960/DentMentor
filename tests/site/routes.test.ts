import { describe, expect, it, vi } from "vitest";

// routes.ts imports useAuth, which pulls in the Supabase client (throws without env vars).
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, userType: null }) }));

import { resolveSiteRoutes } from "@/components/site/routes";

describe("resolveSiteRoutes", () => {
  it("sends logged-out visitors to sign up and sign in", () => {
    const r = resolveSiteRoutes(false, null);
    expect(r.account).toBe("/auth?tab=signup");
    expect(r.signIn).toBe("/auth?tab=signin");
    expect(r.isLoggedIn).toBe(false);
  });

  it("sends a signed-in mentee to the mentee dashboard", () => {
    const r = resolveSiteRoutes(true, "mentee");
    expect(r.account).toBe("/mentee-dashboard");
    expect(r.dashboard).toBe("/mentee-dashboard");
  });

  it("sends a signed-in mentor to the mentor dashboard", () => {
    const r = resolveSiteRoutes(true, "mentor");
    expect(r.account).toBe("/dashboard");
    expect(r.dashboard).toBe("/dashboard");
  });

  it("always points browse and apply at the public routes", () => {
    for (const r of [resolveSiteRoutes(false, null), resolveSiteRoutes(true, "mentor")]) {
      expect(r.mentors).toBe("/mentors");
      expect(r.applyMentor).toBe("/apply-mentor");
    }
  });
});
