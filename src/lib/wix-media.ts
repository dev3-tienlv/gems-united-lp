export function toWixStaticImageUrl(imageField: unknown): string | undefined {
  if (typeof imageField !== "string") return undefined;
  if (imageField.startsWith("wix:image://v1/")) {
    const rest = imageField.replace("wix:image://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://static.wixstatic.com/media/${fileId}` : undefined;
  }
  if (/^[a-z0-9]+_.+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(imageField)) {
    return `https://static.wixstatic.com/media/${imageField}`;
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
  if (/^[a-z0-9]+_.+\.(mp4|webm|mov)$/i.test(videoField)) {
    return `https://video.wixstatic.com/video/${videoField}`;
  }
  if (videoField.startsWith("video/")) {
    return `https://video.wixstatic.com/${videoField}`;
  }
  if (videoField.startsWith("http://") || videoField.startsWith("https://")) return videoField;
  return undefined;
}
