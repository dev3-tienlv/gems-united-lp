import "server-only";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "span",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "hr",
  "div",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "rel", "target", "loading"];

export function sanitizeBlogHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "style"],
    KEEP_CONTENT: true,
    USE_PROFILES: { html: true },
  });
}

const HTML_TAG_PATTERN = /<[a-zA-Z][^>]*>/;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}
