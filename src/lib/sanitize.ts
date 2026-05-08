import "server-only";
import sanitizeHtml from "sanitize-html";

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
  "video",
  "source",
  "iframe",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "hr",
  "div",
];

export function sanitizeBlogHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "loading", "width", "height"],
      video: ["src", "controls", "preload", "poster", "playsinline"],
      source: ["src", "type"],
      iframe: [
        "src",
        "loading",
        "allow",
        "allowfullscreen",
        "title",
        "referrerpolicy",
        "sandbox",
      ],
      div: ["class"],
      "*": [],
    },
    transformTags: {
      div: (tagName, attribs) => {
        const className = typeof attribs.class === "string" ? attribs.class : "";
        const allowClass = className === "gallery" || className === "video-embed";
        const safeAttribs: Record<string, string> = allowClass ? { class: className } : {};
        return {
          tagName,
          attribs: safeAttribs,
        };
      },
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowedSchemes: ["http", "https", "mailto", "tel"],
    disallowedTagsMode: "discard",
  });
}

const HTML_TAG_PATTERN = /<[a-zA-Z][^>]*>/;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}
