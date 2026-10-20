import { useCallback, useEffect } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";

const SEEN_KEY = "terraview-tour-seen";

const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the tour just won't be remembered */
  }
};

const hasSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

export function useProductTour() {
  const startTour = useCallback(() => {
    markSeen();

    introJs
      .tour()
      .setOptions({
        steps: [
          {
            title: "Welcome to TerraView Ops",
            intro:
              "A concept demo of a site-monitoring dashboard that keeps working when a connection drops. This quick tour shows how it works. All data here is simulated.",
          },
          {
            element: '[data-tour="stats"]',
            title: "Live summary",
            intro:
              "A roll-up across every monitored site: average latency, packet loss, and how many events are waiting to sync. These update every couple of seconds.",
          },
          {
            element: '[data-tour="nodes"]',
            title: "Monitored sites",
            intro:
              "Each card is a (fictional) site. During an outage the status flips to Degraded, latency and packet loss climb, and the local queue starts filling.",
          },
          {
            element: '[data-tour="chart"]',
            title: "Live throughput",
            intro:
              "Network throughput and API requests, streaming in real time. Watch for the drop during an outage, then a catch-up surge once buffered data syncs.",
          },
          {
            element: '[data-tour="toggle"]',
            title: "Simulate an outage",
            intro:
              "This button simulates losing connectivity. The app also reacts to your real device going offline, for example by using the Offline throttle in your browser's DevTools.",
          },
          {
            element: '[data-tour="queue"]',
            title: "Offline queue",
            intro:
              "While offline, telemetry isn't lost. Events are written to the browser's IndexedDB, so they even survive a page refresh. When the link returns they sync automatically (the sync target is simulated).",
          },
          {
            element: '[data-tour="feed"]',
            title: "Security event feed",
            intro:
              "A short, in-session feed of notable events, such as connectivity loss and completed syncs, in the style of a SOC console.",
          },
          {
            element: '[data-tour="log"]',
            title: "Activity log",
            intro:
              "A persistent, exportable record of every connectivity change, buffered event, and sync result. Filter by type, export as JSON, or clear it.",
          },
          {
            title: "Your turn",
            intro:
              "Click the blue connection button, wait about 10 seconds while events buffer, then switch back online and watch the queue flush. You can replay this tour anytime with Take a tour.",
          },
        ],
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        disableInteraction: true,
        scrollToElement: true,
        scrollPadding: 90,
        nextLabel: "Next",
        prevLabel: "Back",
        doneLabel: "Got it",
      })
      .start();
  }, []);

  // Auto-start once for first-time visitors
  useEffect(() => {
    if (hasSeen()) return;
    const timer = setTimeout(startTour, 800);
    return () => clearTimeout(timer);
  }, [startTour]);

  return { startTour };
}
