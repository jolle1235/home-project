"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RefreshFunction = () => void | Promise<unknown>;

interface ScrollRefreshOptions {
  threshold?: number;
  cooldownMs?: number;
}

export function useScrollRefresh(
  refetch: RefreshFunction,
  { threshold = 70, cooldownMs = 1200 }: ScrollRefreshOptions = {},
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastScroll = useRef(0);
  const pullStartY = useRef<number | null>(null);
  const lastTriggerTs = useRef(0);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const triggerRefresh = useCallback(async () => {
    const now = Date.now();

    if (isRefreshing || now - lastTriggerTs.current < cooldownMs) return;

    lastTriggerTs.current = now;
    setIsRefreshing(true);

    try {
      await refetchRef.current();
    } finally {
      setIsRefreshing(false);
    }
  }, [cooldownMs, isRefreshing]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isScrollingUp = scrollTop < lastScroll.current;

      if (isScrollingUp && scrollTop <= threshold) {
        void triggerRefresh();
      }

      lastScroll.current = scrollTop;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY <= 0) {
        pullStartY.current = event.touches[0]?.clientY ?? null;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (pullStartY.current === null || window.scrollY > 0) return;

      const currentY = event.touches[0]?.clientY ?? pullStartY.current;
      const pullDistance = currentY - pullStartY.current;

      if (pullDistance > threshold) {
        void triggerRefresh();
        pullStartY.current = null;
      }
    };

    const handleTouchEnd = () => {
      pullStartY.current = null;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, triggerRefresh]);

  return { isRefreshing, refreshNow: triggerRefresh };
}
