import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dreamweaver Oracle Engine - AI Roleplay Platform",
    short_name: "Oracle Engine",
    description:
      "Advanced AI-powered roleplay engine with multi-character adventures, world building, and intelligent character memory systems",
    start_url: "/",
    display: "standalone",
    scope: "/",
    background_color: "#0a0514",
    theme_color: "#b16ae8",
    orientation: "portrait-primary",
    categories: ["entertainment", "productivity", "social"],
    screenshots: [
      {
        src: "/icon.svg",
        sizes: "540x720",
        form_factor: "narrow",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "1280x720",
        form_factor: "wide",
        type: "image/svg+xml",
      },
    ],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/placeholder-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to Oracle Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
      {
        name: "Characters",
        short_name: "Characters",
        description: "View your characters",
        url: "/characters",
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
      {
        name: "LoreWorld",
        short_name: "LoreWorld",
        description: "Create and manage lore",
        url: "/loreworld",
        icons: [{ src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "media",
            accept: ["image/*", "video/*"],
          },
        ],
      },
    },
  }
}
