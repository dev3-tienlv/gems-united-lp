import "server-only";

import type { Locale } from "./types";
import { messagesVi } from "./locales/vi";
import { messagesEn } from "./locales/en";

export type { Locale };

const all = { vi: messagesVi, en: messagesEn } as const;

export type Messages = (typeof all)[Locale];

export function getMessages(locale: Locale): Messages {
  return all[locale];
}
