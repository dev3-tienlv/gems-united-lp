import { toWixStaticImageUrl, toWixVideoUrl } from "@/lib/wix-media";

type RichNode = Record<string, unknown>;

const IFRAME_ALLOW =
  "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
const IFRAME_SANDBOX = "allow-scripts allow-same-origin allow-presentation";
const IFRAME_REFERRER = "strict-origin-when-cross-origin";

const WIX_DIMENSIONS_PATTERN = /\/v1\/(?:fill|fit|crop)\/w_(\d+)[\W_]*h_(\d+)/i;

function pickWixImageDimensions(url: string): { width?: number; height?: number } {
  const match = url.match(WIX_DIMENSIONS_PATTERN);
  if (!match) return {};
  const width = Number(match[1]);
  const height = Number(match[2]);
  return {
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
  };
}

function pickRichImageDimensions(image: RichNode | undefined): {
  width?: number;
  height?: number;
} {
  if (!image) return {};
  const src = image.src as RichNode | undefined;
  const widthRaw = Number(src?.width ?? image.width);
  const heightRaw = Number(src?.height ?? image.height);
  return {
    width: Number.isFinite(widthRaw) && widthRaw > 0 ? widthRaw : undefined,
    height: Number.isFinite(heightRaw) && heightRaw > 0 ? heightRaw : undefined,
  };
}

function buildImgTag(url: string, alt: string, image?: RichNode): string {
  const safeUrl = escapeHtml(url);
  const fromRich = pickRichImageDimensions(image);
  const fromUrl = pickWixImageDimensions(url);
  const width = fromRich.width ?? fromUrl.width;
  const height = fromRich.height ?? fromUrl.height;
  const dims = width && height ? ` width="${width}" height="${height}"` : "";
  return `<img src="${safeUrl}" alt="${alt}" loading="lazy"${dims} />`;
}

function toYoutubeEmbedUrl(url: string): string {
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return url;
}

function toVimeoEmbedUrl(url: string): string {
  const directMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (directMatch?.[1]) return `https://player.vimeo.com/video/${directMatch[1]}`;
  return url;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getChildren(node: RichNode): RichNode[] {
  const nodes = node.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((child): child is RichNode => Boolean(child) && typeof child === "object");
}

function getNodeText(node: RichNode): string {
  if (typeof node.text === "string") return node.text;
  const textData = node.textData as RichNode | undefined;
  if (typeof textData?.text === "string") return textData.text;
  return "";
}

function renderTextNode(node: RichNode): string {
  let text = escapeHtml(getNodeText(node));
  if (!text) return "";

  const textData = node.textData as RichNode | undefined;
  const decorations = Array.isArray(node.decorations)
    ? node.decorations
    : Array.isArray(textData?.decorations)
      ? textData.decorations
      : undefined;
  if (Array.isArray(decorations)) {
    for (const decoration of decorations) {
      if (!decoration || typeof decoration !== "object") continue;
      const dec = decoration as RichNode;
      if (dec.type === "BOLD") text = `<strong>${text}</strong>`;
      if (dec.type === "ITALIC") text = `<em>${text}</em>`;
      if (dec.type === "UNDERLINE") text = `<u>${text}</u>`;
      if (dec.type === "STRIKETHROUGH") text = `<s>${text}</s>`;
      if (dec.type === "LINK") {
        const linkData = (dec.linkData as RichNode | undefined) || (textData?.linkData as RichNode | undefined);
        const nestedLink = linkData?.link as RichNode | undefined;
        const href =
          typeof linkData?.url === "string"
            ? linkData.url
            : typeof nestedLink?.url === "string"
              ? nestedLink.url
              : "";
        const safeHref = href ? escapeHtml(href) : "";
        if (safeHref) {
          text = `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      }
    }
  }

  return text;
}

function renderChildren(node: RichNode): string {
  return getChildren(node).map(renderNode).join("");
}

function renderImage(node: RichNode): string {
  const imageData = node.imageData as RichNode | undefined;
  const image = imageData?.image as RichNode | undefined;
  const src = image?.src as RichNode | undefined;
  const rawUrl = (typeof src?.url === "string" ? src.url : typeof src?.id === "string" ? src.id : undefined) || "";
  const imageUrl = toWixStaticImageUrl(rawUrl);
  if (!imageUrl) return "";

  const alt = typeof image?.altText === "string" ? escapeHtml(image.altText) : "";
  const caption = typeof imageData?.caption === "string" ? escapeHtml(imageData.caption) : "";
  const imgTag = buildImgTag(imageUrl, alt, image);
  return `<figure>${imgTag}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

function renderVideo(node: RichNode): string {
  const videoData = node.videoData as RichNode | undefined;
  const video = videoData?.video as RichNode | undefined;
  const src = video?.src as RichNode | undefined;
  const rawUrl = (typeof src?.url === "string" ? src.url : typeof src?.id === "string" ? src.id : undefined) || "";
  const mediaUrl = toWixVideoUrl(rawUrl) || rawUrl;
  if (!mediaUrl) return "";
  const embedUrl = mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")
    ? toYoutubeEmbedUrl(mediaUrl)
    : mediaUrl.includes("vimeo.com")
      ? toVimeoEmbedUrl(mediaUrl)
      : mediaUrl;
  const safeUrl = escapeHtml(embedUrl);

  if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be") || embedUrl.includes("vimeo.com")) {
    return `<div class="video-embed"><iframe src="${safeUrl}" loading="lazy" title="Embedded video" allow="${IFRAME_ALLOW}" allowfullscreen referrerpolicy="${IFRAME_REFERRER}" sandbox="${IFRAME_SANDBOX}"></iframe></div>`;
  }
  return `<video controls preload="metadata" src="${safeUrl}"></video>`;
}

function renderGallery(node: RichNode): string {
  const galleryData = node.galleryData as RichNode | undefined;
  const items = Array.isArray(galleryData?.items) ? galleryData.items : [];
  const renderedItems = items
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const mediaItem = item as RichNode;
      const image = mediaItem.image as RichNode | undefined;
      const media = image?.media as RichNode | undefined;
      const src = media?.src as RichNode | undefined;
      const rawUrl =
        typeof src?.url === "string"
          ? src.url
          : typeof src?.id === "string"
            ? src.id
            : undefined;
      const imageUrl = toWixStaticImageUrl(rawUrl);
      if (!imageUrl) return "";
      const alt =
        typeof image?.altText === "string" ? escapeHtml(image.altText) : "";
      return buildImgTag(imageUrl, alt, media);
    })
    .filter(Boolean)
    .join("");
  return renderedItems ? `<div class="gallery">${renderedItems}</div>` : "";
}

function renderNode(node: RichNode): string {
  const type = typeof node.type === "string" ? node.type : "";

  switch (type) {
    case "TEXT":
      return renderTextNode(node);
    case "PARAGRAPH": {
      const content = renderChildren(node);
      return content ? `<p>${content}</p>` : "";
    }
    case "HEADING": {
      const levelData = node.headingData as RichNode | undefined;
      const levelRaw = Number(levelData?.level);
      const level = Number.isInteger(levelRaw) && levelRaw >= 1 && levelRaw <= 6 ? levelRaw : 2;
      const content = renderChildren(node);
      return content ? `<h${level}>${content}</h${level}>` : "";
    }
    case "BULLETED_LIST":
    case "BULLET_LIST": {
      const content = renderChildren(node);
      return content ? `<ul>${content}</ul>` : "";
    }
    case "ORDERED_LIST": {
      const content = renderChildren(node);
      return content ? `<ol>${content}</ol>` : "";
    }
    case "LIST_ITEM": {
      const content = renderChildren(node);
      return content ? `<li>${content}</li>` : "";
    }
    case "BLOCKQUOTE": {
      const content = renderChildren(node);
      return content ? `<blockquote>${content}</blockquote>` : "";
    }
    case "DIVIDER":
      return "<hr />";
    case "CODE_BLOCK": {
      const codeData = node.codeBlockData as RichNode | undefined;
      const code = typeof codeData?.text === "string" ? codeData.text : "";
      if (code) return `<pre><code>${escapeHtml(code)}</code></pre>`;
      const content = renderChildren(node);
      return content ? `<pre><code>${content}</code></pre>` : "";
    }
    case "IMAGE":
      return renderImage(node);
    case "VIDEO":
      return renderVideo(node);
    case "GALLERY":
      return renderGallery(node);
    default:
      return renderChildren(node);
  }
}

export function richContentToHtml(rawRichContent: unknown): string | undefined {
  if (!rawRichContent) return undefined;

  let richContent: RichNode | null = null;
  if (typeof rawRichContent === "string") {
    try {
      richContent = JSON.parse(rawRichContent) as RichNode;
    } catch {
      return undefined;
    }
  } else if (typeof rawRichContent === "object") {
    richContent = rawRichContent as RichNode;
  }

  if (!richContent) return undefined;
  const html = renderNode(richContent).trim();
  return html || undefined;
}
