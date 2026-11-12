import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";

/**
 * One idea per screen: the outer element owns the band's background and block
 * padding, the inner .container owns the width (base.css § layout).
 */
export function FeatureSection({
  tone = "paper",
  index,
  title,
  lead,
  children,
  action,
}: {
  tone?: "paper" | "desk";
  index?: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn("hairline py-(--section-gap)", tone === "desk" && "desk")}
    >
      <div className="container">
        <SectionHeading title={title} lead={lead} index={index} />
        <div className="mt-(--space-xl)">{children}</div>
        {action ? <div className="mt-(--space-lg)">{action}</div> : null}
      </div>
    </section>
  );
}
