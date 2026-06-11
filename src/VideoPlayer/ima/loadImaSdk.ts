export const IMA_SDK_URL = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";

const loadPromises = new Map<string, Promise<void>>();

export const isImaSdkLoaded = (): boolean =>
  typeof window !== "undefined" && typeof google !== "undefined" && !!google.ima;

/**
 * Loads the Google IMA HTML5 SDK once per URL per page.
 */
export const loadImaSdk = (sdkUrl: string = IMA_SDK_URL): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IMA SDK can only load in a browser"));
  }

  const url = sdkUrl.trim() || IMA_SDK_URL;

  if (url === IMA_SDK_URL && isImaSdkLoaded()) {
    return Promise.resolve();
  }

  const existing = loadPromises.get(url);
  if (existing) {
    return existing;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const selector = `script[data-zezo-ima-sdk="${url}"]`;
    const scriptEl = document.querySelector<HTMLScriptElement>(selector);
    if (scriptEl) {
      scriptEl.addEventListener("load", () => resolve(), { once: true });
      scriptEl.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google IMA SDK")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.zezoImaSdk = url;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromises.delete(url);
      reject(new Error("Failed to load Google IMA SDK"));
    };
    document.head.appendChild(script);
  });

  loadPromises.set(url, promise);
  return promise;
};
