import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stubMatchMedia } from "../setup";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn(async () => ({ data: null, error: new Error("offline") })) },
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, userType: null }),
}));
// Pulls in the image cropper (canvas + Worker at import); irrelevant when logged out.
vi.mock("@/components/ProfileDropdown", () => ({ ProfileDropdown: () => null }));

import LandingPage from "@/components/site/LandingPage";
import { LANDING_ROUTES } from "@/components/site/content";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LandingPage", () => {
  beforeEach(() => stubMatchMedia({ reduce: true }));

  it("renders a band for every in-page anchor", () => {
    const { container } = renderPage();
    for (const hash of Object.values(LANDING_ROUTES)) {
      expect(container.querySelector(hash), `no element for ${hash}`).not.toBeNull();
    }
  });

  it("points every in-page link at an element that exists", () => {
    const { container } = renderPage();
    const hashes = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].map((a) =>
      a.getAttribute("href"),
    );
    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      expect(document.querySelector(hash!), `dead link ${hash}`).not.toBeNull();
    }
  });

  it("shows no numbers and no mentor grid when live data is unavailable", async () => {
    const { container, findByText } = renderPage();
    await findByText("Now accepting mentees");
    expect(container.querySelector("#mentors ul")).toBeNull();
    expect(container.textContent).not.toMatch(/\d+ verified mentors/);
  });
});
