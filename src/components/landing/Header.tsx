"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOGO_URL } from "@/data/landing";
import { getChromeMessages } from "@/i18n/chrome";
import type { Locale } from "@/i18n/types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  locale: Locale;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3.5 6h15M3.5 11h15M3.5 16h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/blogs") return pathname === "/blogs" || pathname.startsWith("/blog/");
  if (href === "/careers") return pathname === "/careers" || pathname.startsWith("/careers/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinkClassesArgs {
  pathname: string;
  href: string;
  variant: "desktop" | "mobile";
}

function navLinkClasses({ pathname, href, variant }: NavLinkClassesArgs): string {
  const active = isNavActive(pathname, href);
  if (variant === "desktop") {
    return [
      "relative text-[13px] font-semibold transition-colors",
      active
        ? "text-[color:var(--brand)] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[color:var(--brand-light)]"
        : "text-[color:var(--ink-2)] hover:text-[color:var(--brand)]",
    ].join(" ");
  }
  return [
    "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
    active
      ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
      : "text-[color:var(--ink-2)] hover:bg-[color:var(--soft)] hover:text-[color:var(--brand)]",
  ].join(" ");
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useMobileDrawer(isOpen: boolean, onClose: () => void) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusables?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !drawer) return;
      const items = drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return drawerRef;
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useScrolled();
  const text = getChromeMessages(locale);
  const dialogTitleId = useId();

  const navItems = [
    { label: text.nav.home, href: "/" },
    { label: text.nav.about, href: "/about-us" },
    { label: text.nav.blogs, href: "/blogs" },
    { label: text.nav.careers, href: "/careers" },
    { label: text.nav.contact, href: "/contact" },
  ];

  const close = () => setIsOpen(false);
  const drawerRef = useMobileDrawer(isOpen, close);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-[border-color,background-color]",
        scrolled
          ? "border-b border-[color:var(--line)] bg-[color:var(--surface-glass)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-5 md:h-28 md:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label={`${text.nav.home} — GEMS United`}>
          <Image
            src={LOGO_URL}
            alt="GEMS United"
            width={192}
            height={192}
            priority
            sizes="(max-width: 768px) 80px, 96px"
            className="h-20 w-auto md:h-24"
          />
        </Link>

        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label={text.navAriaLabel}
        >
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClasses({ pathname, href: item.href, variant: "desktop" })}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle switchToLight={text.theme.switchToLight} switchToDark={text.theme.switchToDark} />
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:bg-[color:var(--soft)] md:hidden"
            aria-label={isOpen ? text.closeMenu : text.openMenu}
            aria-expanded={isOpen}
            aria-controls={dialogTitleId}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label={text.closeMenu}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={close}
          />
          <div
            ref={drawerRef}
            id={dialogTitleId}
            role="dialog"
            aria-modal="true"
            aria-label={text.navAriaLabel}
            className="fixed left-0 right-0 top-24 z-50 mx-auto w-full max-w-7xl px-5"
          >
            <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 shadow-[0_18px_60px_rgba(10,8,24,0.25)]">
              <div className="mb-3">
                <LanguageSwitcher locale={locale} />
              </div>
              <nav className="flex flex-col gap-1" aria-label={text.navAriaLabel}>
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={navLinkClasses({ pathname, href: item.href, variant: "mobile" })}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
