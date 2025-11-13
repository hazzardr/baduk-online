import {
  __name
} from "./chunk-MM7DTO55.js";

// src/preview-api/modules/preview-web/render/animation-utils.ts
var ANIMATION_TIMEOUT = 5e3;
function isTestEnvironment() {
  try {
    return (
      // @ts-expect-error This property exists in Vitest browser mode
      !!globalThis.__vitest_browser__ || !!globalThis.window?.navigator?.userAgent?.match(/StorybookTestRunner/)
    );
  } catch {
    return false;
  }
}
__name(isTestEnvironment, "isTestEnvironment");
function pauseAnimations(atEnd = true) {
  if (!("document" in globalThis && "createElement" in globalThis.document)) {
    return () => {
    };
  }
  const disableStyle = document.createElement("style");
  disableStyle.textContent = `*, *:before, *:after {
    animation: none !important;
  }`;
  document.head.appendChild(disableStyle);
  const pauseStyle = document.createElement("style");
  pauseStyle.textContent = `*, *:before, *:after {
    animation-delay: 0s !important;
    animation-direction: ${atEnd ? "reverse" : "normal"} !important;
    animation-play-state: paused !important;
    transition: none !important;
  }`;
  document.head.appendChild(pauseStyle);
  document.body.clientHeight;
  document.head.removeChild(disableStyle);
  return () => {
    pauseStyle.parentNode?.removeChild(pauseStyle);
  };
}
__name(pauseAnimations, "pauseAnimations");
async function waitForAnimations(signal) {
  if (!("document" in globalThis && "getAnimations" in globalThis.document && "querySelectorAll" in globalThis.document)) {
    return;
  }
  let timedOut = false;
  await Promise.race([
    // After 50ms, retrieve any running animations and wait for them to finish
    // If new animations are created while waiting, we'll wait for them too
    new Promise((resolve) => {
      setTimeout(() => {
        const animationRoots = [globalThis.document, ...getShadowRoots(globalThis.document)];
        const checkAnimationsFinished = /* @__PURE__ */ __name(async () => {
          if (timedOut || signal?.aborted) {
            return;
          }
          const runningAnimations = animationRoots.flatMap((el) => el?.getAnimations?.() || []).filter((a) => a.playState === "running" && !isInfiniteAnimation(a));
          if (runningAnimations.length > 0) {
            await Promise.all(runningAnimations.map((a) => a.finished));
            await checkAnimationsFinished();
          }
        }, "checkAnimationsFinished");
        checkAnimationsFinished().then(resolve);
      }, 100);
    }),
    // If animations don't finish within the timeout, continue without waiting
    new Promise(
      (resolve) => setTimeout(() => {
        timedOut = true;
        resolve(void 0);
      }, ANIMATION_TIMEOUT)
    )
  ]);
}
__name(waitForAnimations, "waitForAnimations");
function getShadowRoots(doc) {
  return [doc, ...doc.querySelectorAll("*")].reduce((acc, el) => {
    if ("shadowRoot" in el && el.shadowRoot) {
      acc.push(el.shadowRoot, ...getShadowRoots(el.shadowRoot));
    }
    return acc;
  }, []);
}
__name(getShadowRoots, "getShadowRoots");
function isInfiniteAnimation(anim) {
  if (anim instanceof CSSAnimation && anim.effect instanceof KeyframeEffect && anim.effect.target) {
    const style = getComputedStyle(anim.effect.target, anim.effect.pseudoElement);
    const index = style.animationName?.split(", ").indexOf(anim.animationName);
    const iterations = style.animationIterationCount.split(", ")[index];
    return iterations === "infinite";
  }
  return false;
}
__name(isInfiniteAnimation, "isInfiniteAnimation");

export {
  isTestEnvironment,
  pauseAnimations,
  waitForAnimations
};
