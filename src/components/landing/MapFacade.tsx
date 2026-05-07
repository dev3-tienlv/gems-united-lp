"use client";

interface MapFacadeProps {
  src: string;
  title: string;
  className?: string;
}

export function MapFacade({ src, title, className }: MapFacadeProps) {
  return (
    <iframe
      title={title}
      src={src}
      className={className}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
      referrerPolicy="no-referrer"
    />
  );
}
