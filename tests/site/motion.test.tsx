import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { useSiteMotion } from "@/components/site/reveal";
import { stubMatchMedia } from "../setup";

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function mountMotion() {
  const ref = createRef<HTMLDivElement>();
  return renderHook(() => useSiteMotion(ref));
}

describe("useSiteMotion fails open", () => {
  it("hides nothing under reduced motion", () => {
    stubMatchMedia({ reduce: true });
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    const { result } = mountMotion();
    expect(result.current).toBe("");
  });

  it("never arms scroll reveals without an IntersectionObserver", async () => {
    stubMatchMedia({ reduce: false });
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = mountMotion();
    expect(result.current).not.toContain("dm-js");
    // The load sequence still releases, so the hero isn't left hidden.
    await waitFor(() => expect(result.current).toContain("dm-entered"));
    expect(result.current).not.toContain("dm-js");
  });

  it("arms reveals and releases the entrance when motion is wanted", async () => {
    stubMatchMedia({ reduce: false });
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    const { result } = mountMotion();
    expect(result.current).toContain("dm-enter");
    await waitFor(() => expect(result.current).toBe("dm-js dm-enter dm-entered"));
  });
});
