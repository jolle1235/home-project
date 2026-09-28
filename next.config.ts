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
  // Drinks are recipes with type "drink"; old drinks links go to that view.
  async redirects() {
    return [
      { source: "/drinks", destination: "/recipes?type=drink", permanent: false },
      { source: "/drinks/:path*", destination: "/recipes?type=drink", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/recipes", destination: "/features/recipes" },
      { source: "/recipes/:path*", destination: "/features/recipes/:path*" },
      { source: "/add-recipe", destination: "/features/recipes/add-recipe" },
      {
        source: "/add-recipe/:path*",
        destination: "/features/recipes/add-recipe/:path*",
      },
      {
        source: "/shoppinglist",
        destination: "/features/shoppingList",
      },
      {
        source: "/shoppinglist/:path*",
        destination: "/features/shoppingList/:path*",
      },
      { source: "/weekPlanner", destination: "/features/weekplanner" },
      {
        source: "/weekPlanner/:path*",
        destination: "/features/weekplanner/:path*",
      },
      { source: "/admin", destination: "/features/admin" },
      { source: "/admin/:path*", destination: "/features/admin/:path*" },
    ];
  },
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
