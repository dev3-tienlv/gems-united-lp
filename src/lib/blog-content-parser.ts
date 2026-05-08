import "server-only";
import { parse, HTMLElement } from "node-html-parser";

export interface BlogContactInfo {
  website?: string;
  fanpage?: string;
  email?: string;
  address?: string;
}

export interface ParsedBlogContent {
  html: string;
  tags: string[];
  contact: BlogContactInfo;
}

const HASHTAG_PATTERN = /#[\p{L}\p{N}_]+/gu;
const SEPARATOR_PATTERN = /^[-–—\s]{6,}$/;
const CONTACT_EMOJI_PATTERN = /[🌐🔖📩🏡🔗📧✉️📍📨]/u;

type ContactField = "website" | "fanpage" | "email" | "address";

const EMOJI_TO_FIELD: Array<{ emoji: RegExp; field: ContactField }> = [
  { emoji: /🌐|🔗/u, field: "website" },
  { emoji: /🔖|📘/u, field: "fanpage" },
  { emoji: /📩|📧|✉️|📨/u, field: "email" },
  { emoji: /🏡|📍/u, field: "address" },
];

const LABEL_TO_FIELD: Array<{ label: RegExp; field: ContactField }> = [
  { label: /^(website|trang\s*web|web)\b/i, field: "website" },
  { label: /^(fanpage|facebook|fb)\b/i, field: "fanpage" },
  { label: /^(email|mail|thư\s*điện\s*tử)\b/i, field: "email" },
  { label: /^(address|địa\s*chỉ|đ\.c)\b/i, field: "address" },
];

function detectFieldFromLine(line: string): ContactField | null {
  for (const { emoji, field } of EMOJI_TO_FIELD) {
    if (emoji.test(line)) return field;
  }
  for (const { label, field } of LABEL_TO_FIELD) {
    if (label.test(line.trim())) return field;
  }
  return null;
}

function extractContactValue(line: string): string {
  const colonIndex = line.indexOf(":");
  const candidate = colonIndex >= 0 ? line.slice(colonIndex + 1) : line;
  return candidate
    .replace(CONTACT_EMOJI_PATTERN, "")
    .replace(/^[\s\-–—]+/, "")
    .trim();
}

function paragraphLines(node: HTMLElement): string[] {
  const html = node.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  const root = parse(`<div>${html}</div>`);
  const text = root.text;
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_PATTERN);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}

function tryParseContactParagraph(
  node: HTMLElement,
  contact: BlogContactInfo,
): boolean {
  const lines = paragraphLines(node);
  if (lines.length === 0) return false;

  const hasContactSignal = lines.some(
    (line) => CONTACT_EMOJI_PATTERN.test(line) || detectFieldFromLine(line) !== null,
  );
  if (!hasContactSignal) return false;

  let parsedAny = false;
  for (const line of lines) {
    const field = detectFieldFromLine(line);
    if (!field) continue;
    const value = extractContactValue(line);
    if (!value) continue;
    if (!contact[field]) contact[field] = value;
    parsedAny = true;
  }
  return parsedAny;
}

function isSeparatorParagraph(node: HTMLElement): boolean {
  const text = node.text.trim();
  return Boolean(text) && SEPARATOR_PATTERN.test(text);
}

export function parseBlogContent(html: string): ParsedBlogContent {
  const root = parse(html);
  const tags: string[] = [];
  const contact: BlogContactInfo = {};

  const paragraphs = root.querySelectorAll("p");
  for (const paragraph of paragraphs) {
    if (isSeparatorParagraph(paragraph)) {
      paragraph.remove();
      continue;
    }

    const text = paragraph.text;
    const hashtags = collectHashtags(text);
    if (hashtags.length >= 2) {
      tags.push(...hashtags);
      paragraph.remove();
      continue;
    }

    if (tryParseContactParagraph(paragraph, contact)) {
      paragraph.remove();
      continue;
    }
  }

  return {
    html: root.toString(),
    tags: Array.from(new Set(tags)),
    contact,
  };
}
