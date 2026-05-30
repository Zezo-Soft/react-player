const SKIP_SELECTORS = [
  ".videoAdUiSkipButton",
  ".videoAdUiSkipContainer button",
  ".videoAdUiSkipContainer",
  '[id*="skip_button" i]',
  '[aria-label*="Skip ad" i]',
  '[aria-label*="Skip Ad" i]',
];

const isSkipControl = (el: HTMLElement): boolean => {
  if (SKIP_SELECTORS.some((sel) => el.matches(sel))) return true;
  const label = el.getAttribute("aria-label") ?? el.textContent ?? "";
  return /skip(\s+ad)?/i.test(label.trim());
};

export const findNativeSkip = (root: ParentNode): HTMLElement | null => {
  for (const selector of SKIP_SELECTORS) {
    const match = root.querySelector<HTMLElement>(selector);
    if (match) return match;
  }

  for (const el of root.querySelectorAll<HTMLElement>("button, [role='button']")) {
    if (isSkipControl(el)) return el;
  }

  for (const iframe of root.querySelectorAll<HTMLIFrameElement>("iframe")) {
    try {
      if (!iframe.contentDocument?.body) continue;
      const inner = findNativeSkip(iframe.contentDocument.body);
      if (inner) return inner;
    } catch {
      /* cross-origin */
    }
  }

  return null;
};

/** Clears hide styles so IMA's skip handler receives a real activation. */
export const activateNativeSkip = (element: HTMLElement): void => {
  const chain: HTMLElement[] = [element];
  let parent = element.parentElement;
  while (parent) {
    chain.push(parent);
    if (parent.tagName === "IFRAME") break;
    parent = parent.parentElement;
  }

  for (const el of chain) {
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("opacity");
    el.style.removeProperty("clip");
    el.style.removeProperty("width");
    el.style.removeProperty("height");
    el.style.removeProperty("overflow");
    el.style.removeProperty("position");
  }

  element.focus?.();

  const opts: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
  };
  element.dispatchEvent(new MouseEvent("mousedown", opts));
  element.dispatchEvent(new MouseEvent("mouseup", opts));
  element.dispatchEvent(new MouseEvent("click", opts));
  element.click();
};

export type ImaSkipResult = "native" | "api" | "stop" | "failed";

/** Skips the current ad when skippable. */
export const triggerImaSkip = (
  manager: google.ima.AdsManager | null,
  roots: HTMLElement[]
): ImaSkipResult => {
  if (!manager?.getAdSkippableState()) return "failed";

  for (const root of roots) {
    const nativeSkip = findNativeSkip(root);
    if (nativeSkip) {
      activateNativeSkip(nativeSkip);
      return "native";
    }
  }

  try {
    manager.focus();
  } catch {
    /* optional */
  }

  try {
    manager.skip();
    return "api";
  } catch {
    /* fall through */
  }

  try {
    manager.stop();
    return "stop";
  } catch {
    return "failed";
  }
};
