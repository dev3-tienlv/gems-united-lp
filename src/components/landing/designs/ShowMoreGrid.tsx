"use client";

import { Children, useState, type ReactNode } from "react";

interface ShowMoreGridProps {
  children: ReactNode;
  initialCount?: number;
  step?: number;
  showMoreText: string;
}

export function ShowMoreGrid({ children, initialCount = 12, step = 12, showMoreText }: ShowMoreGridProps) {
  const childArray = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const visibleItems = childArray.slice(0, visibleCount);
  const hasMore = visibleCount < childArray.length;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid w-full grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        {visibleItems}
      </div>

      {hasMore && (
        <div className="mt-14 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + step)}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[color:var(--brand)]/10 px-8 py-3 text-sm font-semibold text-[color:var(--brand)] transition-all duration-300 hover:bg-[color:var(--brand)] hover:text-white hover:shadow-[0_14px_30px_rgba(111,66,201,0.35)]"
          >
            {showMoreText}
          </button>
        </div>
      )}
    </div>
  );
}
