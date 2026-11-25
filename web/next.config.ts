import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static: `next build` writes plain files to out/.
  output: "export",
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
