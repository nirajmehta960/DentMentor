import { Loader2 } from "lucide-react";

import { AppShell, DentMark } from "@/components/site";

/**
 * The calm full-screen wait shown by the route guards and the onboarding pages
 * while auth or a profile resolves: the mark, a spinner, one line of status.
 * On the kit's mist ground, so the hand-off to the page that follows is a
 * content change rather than a colour flash.
 */
export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <AppShell nav={false}>
      <div role="status" aria-live="polite" className="grid min-h-svh place-items-center px-5">
        <div className="flex flex-col items-center gap-5">
          <DentMark className="size-11 rounded-xl" />
          <div className="flex items-center gap-2.5">
            <Loader2 className="size-4 animate-spin text-band-signal" aria-hidden="true" />
            <p className="text-[0.9375rem] text-band-muted">{label}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
