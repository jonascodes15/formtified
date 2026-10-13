import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Link-preview images for client forms are drawn on request, so their fonts and logo must ship with the server code.
  outputFileTracingIncludes: {
    "/f/**": ["./assets/fonts/**/*", "./src/app/icon.svg"],
    "/templates/**": ["./assets/fonts/**/*", "./src/app/icon.svg"],
  },
};

export default nextConfig;
