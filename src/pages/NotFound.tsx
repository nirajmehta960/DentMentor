import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Band, Frame, HAIRLINE, Label, SiteCta, SiteShell, useSiteRoutes } from "@/components/site";

/**
 * The 404: a light page (so `nav="solid"`), one calm centred panel, and two
 * ways back — home, or straight to the mentor directory.
 */
const NotFound = () => {
  const location = useLocation();
  const r = useSiteRoutes();

  useEffect(() => {
    // Track 404 errors silently
  }, [location.pathname]);

  return (
    <SiteShell nav="solid">
      {/* `pt-*` clears the fixed nav; the min-height keeps the panel centred
          above the footer on a tall screen. */}
      <Band id="not-found" tone="mist" className="flex min-h-[78svh] items-center pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-36">
        <Frame width="narrow">
          <div
            className="mx-auto flex max-w-[34rem] flex-col items-center gap-6 rounded-[1.5rem] border bg-white px-6 py-12 text-center shadow-[var(--card-shadow)] sm:px-12 sm:py-16"
            style={{ borderColor: HAIRLINE }}
          >
            <Label>
              <span data-numeric="">404</span> · Page not found
            </Label>
            <h1 className="text-balance font-display text-display-3 font-medium tracking-[-0.03em] text-band-fg">
              We couldn't find that page
            </h1>
            <p className="max-w-[26rem] text-pretty text-body-sm leading-relaxed text-band-muted">
              The page at{" "}
              <code className="break-all rounded-[0.375rem] bg-[rgb(15_112_93/0.07)] px-1.5 py-0.5 font-mono text-[0.875em] text-band-fg">
                {location.pathname}
              </code>{" "}
              doesn't exist or has moved.
            </p>
            <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <SiteCta to="/" variant="ink" data-cta="not-found-home">
                Back to home
              </SiteCta>
              <SiteCta to={r.mentors} variant="secondary" className="group/find" data-cta="not-found-mentors">
                Find a mentor
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover/find:translate-x-1"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </SiteCta>
            </div>
          </div>
        </Frame>
      </Band>
    </SiteShell>
  );
};

export default NotFound;
