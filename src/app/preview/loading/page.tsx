import type { Metadata } from "next";
import { LoadingPreviewClient } from "./LoadingPreviewClient";

export const metadata: Metadata = {
  title: "Loading preview",
  robots: { index: false, follow: false },
};

export default function LoadingPreviewPage() {
  return <LoadingPreviewClient />;
}
