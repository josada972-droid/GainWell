import type { ReactNode } from "react";

/**
 * The card every auth page renders its form into: one stock sheet centered on
 * the desk, consistent with the site's stationery system. Width is capped so
 * forms never stretch wide on a desktop screen.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mt-(--space-lg) w-full max-w-md">
      <div className="stock p-(--space-lg)">{children}</div>
    </div>
  );
}
