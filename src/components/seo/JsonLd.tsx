interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Escapes characters that could break out of a <script> context or HTML parsing
 * when JSON-LD payloads contain user-generated content (e.g. blog titles).
 *
 * - `<`, `>`, `&` prevent injection (`</script>`, raw HTML entities).
 * - U+2028 / U+2029 are valid in JSON but invalid as raw chars in JS strings.
 */
function safeStringify(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  );
}
