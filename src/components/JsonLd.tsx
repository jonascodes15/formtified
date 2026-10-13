/**
 * Structured data for search engines (schema.org JSON-LD).
 * "<" is escaped so text inside the data can never close the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
