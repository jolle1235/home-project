// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tab switches within 30 s come from the client cache. Data lives in TanStack Query, so
    // your own edits still show at once (see the recipe editor's setQueryData).
    staleTimes: { dynamic: 30 },
  },
  // Images are behind the login. The optimizer fetches its source without the
  // user's cookie (on Vercel from Vercel's own servers), so the browser loads
  // /api/images/<id> itself; that route sends a year-long private cache header.
  images: { unoptimized: true },
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
          // The hand-written service worker; always check for a new one.
          value: "no-cache",
        },
      ],
    },
  ],
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs"],
  },
};

export default nextConfig;
