// next.config.ts
import type { NextConfig } from "next";

/**
 * runtimeCaching rules use string handler names supported by next-pwa:
 * 'StaleWhileRevalidate', 'CacheFirst', etc.
 *
 * We'll use StaleWhileRevalidate so cached responses show instantly
 * while the service worker fetches an update in the background.
 */

const runtimeCaching = [
  // next.js static assets
  {
    urlPattern: /^\/_next\/static\/.*/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-static",
      expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },

  // manifest icons (your project uses /icon/)
  {
    urlPattern: /^\/icon\/.*\.(?:png|jpg|svg|webp|ico)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "icons-cache",
      expiration: { maxEntries: 20, maxAgeSeconds: 60 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },

  // API endpoints you might want to cache (adjust paths if needed)
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

  // fallback for images in other routes
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

const nextConfig: NextConfig = {
  // Keep your sw.js header (helps ensure browser revalidates the service worker)
  headers: async () => {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    domains: ["mummum.dk"],
  },
};

/**
 * Use CommonJS require for next-pwa so it works in both JS/TS configs.
 * next-pwa returns a function that wraps your next config.
 */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
});

export default withPWA(nextConfig);
