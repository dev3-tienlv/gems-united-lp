"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalName = "CLS" | "FCP" | "INP" | "LCP" | "TTFB";

interface WebVitalPayload {
  id: string;
  name: WebVitalName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  pathname: string;
}

const TRACKED_METRICS = new Set<WebVitalName>(["LCP", "CLS", "INP"]);

function sendWebVital(payload: WebVitalPayload): void {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", body);
    return;
  }

  void fetch("/api/vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!TRACKED_METRICS.has(metric.name as WebVitalName)) {
      return;
    }

    sendWebVital({
      id: metric.id,
      name: metric.name as WebVitalName,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      pathname: window.location.pathname,
    });
  });

  return null;
}
