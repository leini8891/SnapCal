import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SnapCal",
    short_name: "SnapCal",
    description:
      "Singapore-first hawker food logging PWA for fast estimates, one-tap corrections, and daily budget awareness.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff7ef",
    theme_color: "#ef6a43",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
