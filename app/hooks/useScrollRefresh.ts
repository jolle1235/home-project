"use client";
import { useEffect, useRef } from "react";

export function useScrollRefresh(refetch: () => void, threshold = 100) {
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Trigger refetch only when scrolling up near top
      if (scrollTop < lastScroll.current && scrollTop < threshold) {
        refetch();
      }

      lastScroll.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [refetch, threshold]);
}
