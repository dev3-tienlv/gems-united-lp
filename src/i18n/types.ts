export type Locale = "vi" | "en";

export interface NavMessages {
  home: string;
  about: string;
  blogs: string;
  careers: string;
  contact: string;
}

export interface ThemeMessages {
  switchToLight: string;
  switchToDark: string;
}

export interface ChromeMessages {
  nav: NavMessages;
  theme: ThemeMessages;
  navAriaLabel: string;
  openMenu: string;
  closeMenu: string;
  skipToContent: string;
}
