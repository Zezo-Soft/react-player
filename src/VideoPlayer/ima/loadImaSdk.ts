const IMA_SDK_URL = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";

let loadPromise: Promise<void> | null = null;

export const isImaSdkLoaded = (): boolean =>
  typeof window !== "undefined" && typeof google !== "undefined" && !!google.ima;

/**
 * Loads the Google IMA HTML5 SDK once per page.
 */
export const loadImaSdk = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IMA SDK can only load in a browser"));
  }

  if (isImaSdkLoaded()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-zezo-ima-sdk="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google IMA SDK")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = IMA_SDK_URL;
    script.async = true;
    script.dataset.zezoImaSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google IMA SDK"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};
