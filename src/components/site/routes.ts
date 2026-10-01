import { useAuth } from "@/hooks/useAuth";
import type { UserType } from "@/types/auth";

export type SiteRoutes = {
  isLoggedIn: boolean;
  userType: UserType;
  /** Account CTAs: sign up when logged out, the user's own dashboard when not. */
  account: string;
  dashboard: string;
  signIn: string;
  signUp: string;
  mentors: string;
  howItWorks: string;
  about: string;
  applyMentor: string;
  messages: string;
};

/**
 * Pure so it can be tested without an AuthProvider. `PublicOnlyRoute` already
 * redirects anyone signed in away from `/auth`, so a stale session can't strand
 * them there.
 */
export function resolveSiteRoutes(isLoggedIn: boolean, userType: UserType): SiteRoutes {
  const dashboard = userType === "mentor" ? "/dashboard" : "/mentee-dashboard";
  const signUp = "/auth?tab=signup";
  return {
    isLoggedIn,
    userType,
    account: isLoggedIn ? dashboard : signUp,
    dashboard,
    signIn: "/auth?tab=signin",
    signUp,
    mentors: "/mentors",
    howItWorks: "/how-it-works",
    about: "/about",
    applyMentor: "/apply-mentor",
    messages: "/messages",
  };
}

/** Every destination the site can send someone to, resolved once. */
export function useSiteRoutes(): SiteRoutes {
  const { user, userType } = useAuth();
  return resolveSiteRoutes(!!user, userType);
}
