import { useEffect, useState } from "react";
import logoAsset from "@/assets/bean-professor-logo.png.asset.json";

export const DEFAULT_LOGO_URL = logoAsset.url;
const STORAGE_KEY = "bp:brand-logo";
const EVENT = "bp:brand-logo-change";

export function readStoredLogo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLogo(dataUrl: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch {
    /* quota — ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearLogo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Current brand logo (custom crop if the user set one, otherwise the shipped mark). */
export function useBrandLogo() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO_URL);

  useEffect(() => {
    const sync = () => setLogo(readStoredLogo() ?? DEFAULT_LOGO_URL);
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return logo;
}

/** Keeps the browser tab icon in sync with the chosen logo. */
export function useFaviconSync() {
  const logo = useBrandLogo();

  useEffect(() => {
    const href = logo === DEFAULT_LOGO_URL ? "/favicon.png" : logo;
    const type = href.startsWith("data:") ? href.slice(5, href.indexOf(";")) : "image/png";
    for (const rel of ["icon", "apple-touch-icon"]) {
      let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.type = type;
      link.href = href;
    }
  }, [logo]);
}
