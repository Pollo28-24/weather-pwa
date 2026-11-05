"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    if (!("serviceWorker" in navigator)) {
      console.warn("Este navegador no es compatible con service workers.");
      return;
    }

    navigator.serviceWorker
      .register(new URL("../lib/service-worker.js", import.meta.url), {
        scope: "/",
        updateViaCache: "none",
      })
      .catch((error) => {
        console.error("No se pudo registrar el service worker.", error);
      });
  }, []);

  return null;
}
