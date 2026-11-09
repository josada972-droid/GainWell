import { CircleCheck, CircleDashed } from "lucide-react";

/** What is open today and what is still under construction, as hairline rows. */
export function StatusList({
  groups,
}: {
  groups: { label: string; tone: "open" | "next"; items: string[] }[];
}) {
  return (
    <div className="grid gap-(--space-xl) md:grid-cols-2">
      {groups.map(({ label, tone, items }) => (
        <div key={label}>
          <p className="inline-flex items-center gap-(--space-2xs) font-display text-lg text-(--color-ink)">
            {tone === "open" ? (
              <CircleCheck
                aria-hidden="true"
                className="size-5 text-(--color-green)"
              />
            ) : (
              <CircleDashed
                aria-hidden="true"
                className="size-5 text-(--color-muted)"
              />
            )}
            {label}
          </p>
          <ul className="mt-(--space-xs) list-none">
            {items.map((item) => (
              <li
                className="hairline py-(--space-xs) text-(--color-ink-2)"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
