import { Fragment } from "react";

/** Heading plus paragraphs, used by guides and the legal pages. */
export function ProseSections({
  sections,
}: {
  sections: { heading: string; body: string | string[] }[];
}) {
  return (
    <div className="prose">
      {sections.map(({ heading, body }) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          {(Array.isArray(body) ? body : [body]).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
