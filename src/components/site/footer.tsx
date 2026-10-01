import { Frame } from "./chrome";
import { LANDING_FOOTER, SIGNED_IN_CTA } from "./content";
import { DentMark, NavLink, Wordmark } from "./nav";
import { useSiteRoutes } from "./routes";

/**
 * Identity on the left, two short link columns on the right. Deliberately small:
 * the visitor's next action is the CTA above this, not a sitemap. No top rule,
 * and the same `mist` ground as the close — the panel's edge is the boundary.
 */
export function SiteFooter() {
  const r = useSiteRoutes();

  return (
    <footer data-band="mist" className="bg-band-ground text-band-fg">
      <Frame width="wide">
        <div className="flex flex-col gap-10 py-12 sm:py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2.5">
                <DentMark />
                <Wordmark className="text-[1.2rem]" />
              </span>
              <p className="max-w-[22rem] text-[0.9375rem] leading-relaxed text-band-muted">
                {LANDING_FOOTER.descriptor}
              </p>
            </div>

            <div className="flex gap-x-16 gap-y-10 sm:gap-x-20">
              {LANDING_FOOTER.columns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <p className="label mb-4 text-band-faint">{column.title}</p>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <NavLink
                          to={link.to}
                          className="text-[0.9375rem] text-band-muted transition-colors hover:text-band-fg"
                        >
                          {link.label}
                        </NavLink>
                      </li>
                    ))}
                    {/* Mirrors the header's CTA, so it never invites a signed-in user to sign in. */}
                    {column.title === "Company" ? (
                      <li>
                        <NavLink
                          to={r.isLoggedIn ? r.dashboard : r.signIn}
                          className="text-[0.9375rem] text-band-muted transition-colors hover:text-band-fg"
                        >
                          {r.isLoggedIn ? SIGNED_IN_CTA : "Sign in"}
                        </NavLink>
                      </li>
                    ) : null}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-band-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] text-band-faint">{LANDING_FOOTER.copyright}</p>
            <p className="text-[0.8125rem] text-band-faint">dentmentor.com</p>
          </div>
        </div>
      </Frame>
    </footer>
  );
}
