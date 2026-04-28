"use client";

import { Loader2 } from "lucide-react";

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  if (!isRefreshing) return null;

  return (
    <div className="sticky top-2 z-30 flex justify-center pointer-events-none">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Opdaterer...
      </div>
    </div>
  );
}
