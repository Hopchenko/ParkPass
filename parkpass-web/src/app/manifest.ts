import type { MetadataRoute } from "next";

// Swedish only — the app is Swedish-first and the manifest format has no
// per-locale variants. English UI stays reachable at /en after install.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParkPass",
    short_name: "ParkPass",
    description:
      "Bocka av alla 31 svenska nationalparker. Samla en nål för varje park du besöker.",
    lang: "sv",
    start_url: "/",
    display: "standalone",
    theme_color: "#c67139",
    background_color: "#f5ead8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
