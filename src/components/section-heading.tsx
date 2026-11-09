/** Section heading: the title and its one lead line. Page heroes use level 1. */
export function SectionHeading({
  title,
  lead,
  level = 2,
}: {
  title: string;
  lead?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <>
      <Heading>{title}</Heading>
      {lead ? (
        <p className="lead mt-(--space-md) text-(--color-ink-2)">{lead}</p>
      ) : null}
    </>
  );
}
