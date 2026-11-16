"use client";

import { useState } from "react";

/**
 * Collapses a local form once its server action reports success (the form
 * cannot observe the action completion any other way, because useActionState
 * has no completion callback).
 *
 * Uses React's endorsed "adjust state during render" pattern
 * (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
 * the previous value is tracked in state and the setState is guarded by a
 * comparison — not inside an effect, which would cascade an extra render.
 */
export function useCloseOnSuccess(ok: boolean, close: () => void): void {
  const [seenOk, setSeenOk] = useState(ok);
  if (ok !== seenOk) {
    setSeenOk(ok);
    if (ok) close();
  }
}
