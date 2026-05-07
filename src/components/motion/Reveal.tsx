import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "aside";
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const style: CSSProperties | undefined =
    delay > 0 ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined;
  const cls = ["reveal", className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} style={style}>
      {children}
    </Tag>
  );
}
