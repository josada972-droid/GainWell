import { getTranslations } from "next-intl/server";

import { STEP_COUNT } from "@/lib/onboarding/schema";

/**
 * The step indicator: five stops, the current one marked. Visible content is
 * the step number (compact at 320px); the full step name is carried by
 * `aria-label`, and the count line states where the visitor is.
 */
export async function StepProgress({ step }: { step: number }) {
  const t = await getTranslations("onboarding");
  return (
    <div className="grid gap-(--space-3xs)">
      <nav className="groove" aria-label={t("progress.label")}>
        {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className="groove__stop"
            aria-current={n === step ? "true" : undefined}
            aria-label={t(`step${n}.title`)}
          >
            {n}
          </span>
        ))}
      </nav>
      <p className="text-sm text-(--color-muted)">
        {t("progress.count", { step, total: STEP_COUNT })}
      </p>
    </div>
  );
}
