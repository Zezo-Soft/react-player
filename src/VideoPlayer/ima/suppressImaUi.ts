/** Selectors for IMA chrome we hide — skip controls are excluded (clicked programmatically). */
const HIDE_SELECTORS = [
  ".ima-controls-div",
  ".ima-countdown-div",
  ".ima-seek-bar-div",
  ".ima-mute-div",
  ".ima-fullscreen-div",
  ".videoAdUiAttribution",
  ".videoAdUiLearnMore",
  ".videoAdUiTopBar",
  ".videoAdUiBottomBar",
  ".videoAdUiPreSkipButton",
];

const hide = (el: HTMLElement): void => {
  el.style.setProperty("display", "none", "important");
  el.style.setProperty("visibility", "hidden", "important");
  el.style.setProperty("pointer-events", "none", "important");
};

/** Visually hides skip UI but keeps it in the DOM so programmatic click works. */
const tuckAwaySkip = (el: HTMLElement): void => {
  el.style.setProperty("position", "fixed", "important");
  el.style.setProperty("left", "-9999px", "important");
  el.style.setProperty("top", "-9999px", "important");
  el.style.setProperty("width", "1px", "important");
  el.style.setProperty("height", "1px", "important");
  el.style.setProperty("opacity", "0", "important");
  el.style.setProperty("overflow", "hidden", "important");
  el.style.setProperty("pointer-events", "auto", "important");
};

const isSkipElement = (el: HTMLElement): boolean => {
  const label = el.getAttribute("aria-label") ?? el.textContent ?? "";
  return (
    el.classList.contains("videoAdUiSkipButton") ||
    el.classList.contains("videoAdUiSkipContainer") ||
    /skip(\s+ad)?/i.test(label.trim())
  );
};

const suppressInRoot = (root: ParentNode): void => {
  for (const selector of HIDE_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach(hide);
  }

  root.querySelectorAll<HTMLElement>('[class*="videoAdUi"]').forEach((el) => {
    if (isSkipElement(el)) {
      tuckAwaySkip(el);
    } else if (
      !el.classList.contains("videoAdUiSkipButton") &&
      !el.classList.contains("videoAdUiSkipContainer")
    ) {
      hide(el);
    }
  });

  root.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
    try {
      if (iframe.contentDocument?.body) {
        suppressInRoot(iframe.contentDocument.body);
      }
    } catch {
      /* cross-origin — leave iframe; skip may still be reachable via stop() */
    }
  });
};

export const suppressImaUi = (roots: HTMLElement[]): void => {
  roots.forEach((root) => suppressInRoot(root));
};

export const getImaUiRoots = (
  container: HTMLElement | null,
  wrapper: HTMLElement | null
): HTMLElement[] => {
  const roots: HTMLElement[] = [];
  if (wrapper) roots.push(wrapper);
  if (container && container !== wrapper) roots.push(container);
  return roots;
};

export const watchImaUi = (roots: HTMLElement[]): (() => void) => {
  const apply = () => suppressImaUi(roots);
  apply();

  const observer = new MutationObserver(apply);
  for (const root of roots) {
    observer.observe(root, { childList: true, subtree: true });
  }

  return () => observer.disconnect();
};
