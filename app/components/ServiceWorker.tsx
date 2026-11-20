"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Production: registers the service worker (public/sw.js) and says hello over a
// MessageChannel. When the worker opened /recipes from its last-seen copy, it
// answers once the fresh copy is in: "fresh" → refetch the list; "reload" (a new
// deploy) or "gone" (the server redirected, e.g. to /login) → reload the page.
// Development: removes any worker and its caches, so you never work on old pages.
export default function ServiceWorker() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void removeWorkers();
      return;
    }
    registerAfterLoad();
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<{ type: "fresh" | "reload" | "gone" }>) => {
      if (event.data.type === "fresh") {
        void queryClient.invalidateQueries({ queryKey: ["recipes"] });
      } else {
        window.location.reload();
      }
    };
    navigator.serviceWorker.controller?.postMessage({ type: "hello" }, [channel.port2]);
    return () => channel.port1.close();
  }, [queryClient]);

  return null;
}

// After the page's own load, so the worker's download and install don't compete with it.
function registerAfterLoad() {
  const register = () => void navigator.serviceWorker.register("/sw.js");
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

async function removeWorkers() {
  for (const registration of await navigator.serviceWorker.getRegistrations()) {
    await registration.unregister();
  }
  for (const name of await caches.keys()) await caches.delete(name);
}
