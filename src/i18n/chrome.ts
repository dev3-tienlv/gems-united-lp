import type { ChromeMessages, Locale } from "./types";

const chromeMessages: Record<Locale, ChromeMessages> = {
  vi: {
    nav: {
      home: "Trang chủ",
      about: "Giới thiệu",
      blogs: "Bài viết",
      careers: "Tuyển dụng",
      contact: "Liên hệ",
    },
    theme: {
      switchToLight: "Chuyển sang giao diện sáng",
      switchToDark: "Chuyển sang giao diện tối",
    },
    navAriaLabel: "Điều hướng chính",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    skipToContent: "Đi tới nội dung chính",
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      blogs: "Blogs",
      careers: "Careers",
      contact: "Contact",
    },
    theme: {
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
    },
    navAriaLabel: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to main content",
  },
};

export function getChromeMessages(locale: Locale): ChromeMessages {
  return chromeMessages[locale];
}
