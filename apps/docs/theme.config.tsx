import React from "react";

const themeConfig = {
  logo: <span>AIBOS Design System</span>,
  project: {
    link: "https://github.com/your-org/aibos-platform",
  },
  docsRepositoryBase: "https://github.com/your-org/aibos-platform/tree/main",
  footer: {
    text: "AIBOS Design System Documentation © 2024",
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  search: {
    placeholder: "Search documentation...",
  },
  toc: {
    backToTop: true,
  },
  // Customize appearance
  primaryHue: 217, // Blue
  primarySaturation: 100,
};

export default themeConfig;

