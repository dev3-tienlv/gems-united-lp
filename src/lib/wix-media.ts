const WIX_STATIC_HOST = "static.wixstatic.com";

const WIX_IMAGE_FILENAME_PATTERN = /^[a-z0-9]+_.+\.(jpg|jpeg|png|webp|gif|avif)$/i;
const WIX_VIDEO_FILENAME_PATTERN = /^[a-z0-9]+_.+\.(mp4|webm|mov)$/i;
const WIX_FILE_ID_PATTERN = /static\.wixstatic\.com\/media\/([^/?#]+)/i;

export function toWixStaticImageUrl(imageField: unknown): string | undefined {
  if (typeof imageField !== "string") return undefined;
  if (imageField.startsWith("wix:image://v1/")) {
    const rest = imageField.replace("wix:image://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://${WIX_STATIC_HOST}/media/${fileId}` : undefined;
  }
  if (WIX_IMAGE_FILENAME_PATTERN.test(imageField)) {
    return `https://${WIX_STATIC_HOST}/media/${imageField}`;
  }
  if (imageField.startsWith("http")) return imageField;
  return undefined;
}

export function toWixVideoUrl(videoField: unknown): string | undefined {
  if (typeof videoField !== "string") return undefined;
  if (videoField.startsWith("wix:video://v1/")) {
    const rest = videoField.replace("wix:video://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://video.wixstatic.com/video/${fileId}` : undefined;
  }
  if (WIX_VIDEO_FILENAME_PATTERN.test(videoField)) {
    return `https://video.wixstatic.com/video/${videoField}`;
  }
  if (videoField.startsWith("video/")) {
    return `https://video.wixstatic.com/${videoField}`;
  }
  if (videoField.startsWith("http://") || videoField.startsWith("https://")) return videoField;
  return undefined;
}

function extractWixFileId(url: string): string | null {
  const match = url.match(WIX_FILE_ID_PATTERN);
  return match ? match[1] : null;
}

interface WixImageDeliveryOptions {
  width: number;
  quality?: number;
}

export function withWixImageDelivery(url: string, opts: WixImageDeliveryOptions): string {
  const fileId = extractWixFileId(url);
  if (!fileId) return url;
  const quality = opts.quality ?? 82;
  const safeWidth = Math.max(64, Math.min(2400, Math.round(opts.width)));
  // Wix CDN requires both w_ and h_; we set h to a large multiple so width is the binding constraint
  // for typical landscape/portrait images (<= 3:1). Trailing must be a clean filename, not the fileId.
  const safeHeight = Math.min(2400, safeWidth * 3);
  return `https://${WIX_STATIC_HOST}/media/${fileId}/v1/fit/w_${safeWidth},h_${safeHeight},al_c,q_${quality},enc_auto/file.jpg`;
}

const DEFAULT_WIDTHS = [480, 768, 1024, 1280, 1600] as const;

export function buildWixImageSrcset(url: string, widths: readonly number[] = DEFAULT_WIDTHS): string {
  if (!extractWixFileId(url)) return "";
  return widths
    .map((width) => `${withWixImageDelivery(url, { width })} ${width}w`)
    .join(", ");
}

export function isWixStaticImage(url: string): boolean {
  return extractWixFileId(url) !== null;
}
