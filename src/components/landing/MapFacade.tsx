"use client";

interface MapFacadeProps {
  src: string;
  title: string;
  className?: string;
  openInMapsUrl?: string;
  openInMapsLabel?: string;
}

export function MapFacade({
  src,
  title,
  className,
  openInMapsUrl,
  openInMapsLabel = "Open in Google Maps",
}: MapFacadeProps) {
  return (
    <div className="relative">
      <iframe
        title={title}
        src={src}
        className={className}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer"
      />
      {openInMapsUrl ? (
        <a
          href={openInMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 top-3 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#1a73e8] shadow hover:bg-slate-50"
          aria-label={openInMapsLabel}
        >
          {openInMapsLabel}
        </a>
      ) : null}
    </div>
  );
}
