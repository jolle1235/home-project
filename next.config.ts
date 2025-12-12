// next.config.ts
import type { NextConfig } from "next";

// ---- your runtimeCaching stays the same ----

const runtimeCaching = [
  {
    urlPattern: /^\/_next\/static\/.*/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-static",
      expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },
  {
    urlPattern: /^\/icon\/.*\.(?:png|jpg|svg|webp|ico)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "icons-cache",
      expiration: { maxEntries: 20, maxAgeSeconds: 60 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /^\/api\/admin\/unitTypes.*$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "api-cache",
      expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /^\/api\/admin\/recipeCategories.*$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "api-cache",
      expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "images-cache",
      expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
];

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
});

// ---- Final merged config ----

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
  ],
  images: {
    domains: ["mummum.dk"],
  },
  webpack: (config) => {
    // your custom webpack changes here
    return config;
  },
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs"],
  },
};

// Wrap with PWA plugin
export default withPWA(nextConfig);
