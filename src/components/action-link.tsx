import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The pressed-card control from the design system: one filled primary per page,
 * everything else quiet. Links, because every action here is navigation.
 */
export function ActionLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "quiet";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn",
        variant === "primary" ? "btn--primary" : "btn--quiet",
        className,
      )}
    >
      {children}
    </Link>
  );
}
