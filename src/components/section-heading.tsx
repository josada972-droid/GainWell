/** Section heading: a ledger numeral, the title and its one lead line. */
export function SectionHeading({
  title,
  lead,
  index,
  level = 2,
}: {
  title: string;
  lead?: string;
  index?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="section-head">
      <div data-index={index}>
        <Heading>{title}</Heading>
      </div>
      {lead ? <p className="lead text-(--color-ink-2)">{lead}</p> : null}
    </div>
  );
}
