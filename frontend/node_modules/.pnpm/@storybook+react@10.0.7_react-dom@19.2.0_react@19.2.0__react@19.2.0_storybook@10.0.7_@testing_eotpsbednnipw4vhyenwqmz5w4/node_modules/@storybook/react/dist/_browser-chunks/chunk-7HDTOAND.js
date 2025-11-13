import {
  applyDecorators
} from "./chunk-BUAOEMNB.js";
import {
  __export,
  __name
} from "./chunk-L5NVL7MD.js";

// src/entry-preview.tsx
var entry_preview_exports = {};
__export(entry_preview_exports, {
  applyDecorators: () => applyDecorators,
  beforeAll: () => beforeAll,
  decorators: () => decorators,
  mount: () => mount,
  parameters: () => parameters,
  render: () => render,
  renderToCanvas: () => renderToCanvas
});
import * as React4 from "react";
import { global as global2 } from "@storybook/global";
import { configure } from "storybook/test";

// src/act-compat.ts
import * as React from "react";
var clonedReact = { ...React };
function setReactActEnvironment(isReactActEnvironment) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = isReactActEnvironment;
}
__name(setReactActEnvironment, "setReactActEnvironment");
function getReactActEnvironment() {
  return globalThis.IS_REACT_ACT_ENVIRONMENT;
}
__name(getReactActEnvironment, "getReactActEnvironment");
function withGlobalActEnvironment(actImplementation) {
  return (callback) => {
    const previousActEnvironment = getReactActEnvironment();
    setReactActEnvironment(true);
    try {
      let callbackNeedsToBeAwaited = false;
      const actResult = actImplementation(() => {
        const result = callback();
        if (result !== null && typeof result === "object" && typeof result.then === "function") {
          callbackNeedsToBeAwaited = true;
        }
        return result;
      });
      if (callbackNeedsToBeAwaited) {
        const thenable = actResult;
        return {
          then: /* @__PURE__ */ __name((resolve, reject) => {
            thenable.then(
              (returnValue) => {
                setReactActEnvironment(previousActEnvironment);
                resolve(returnValue);
              },
              (error) => {
                setReactActEnvironment(previousActEnvironment);
                reject(error);
              }
            );
          }, "then")
        };
      } else {
        setReactActEnvironment(previousActEnvironment);
        return actResult;
      }
    } catch (error) {
      setReactActEnvironment(previousActEnvironment);
      throw error;
    }
  };
}
__name(withGlobalActEnvironment, "withGlobalActEnvironment");
var getAct = /* @__PURE__ */ __name(async ({ disableAct = false } = {}) => {
  if (process.env.NODE_ENV === "production" || disableAct) {
    return (cb) => cb();
  }
  let reactAct;
  if (typeof clonedReact.act === "function") {
    reactAct = clonedReact.act;
  } else {
    const deprecatedTestUtils = await import("react-dom/test-utils");
    reactAct = deprecatedTestUtils?.default?.act ?? deprecatedTestUtils.act;
  }
  return withGlobalActEnvironment(reactAct);
}, "getAct");

// src/render.tsx
import React2 from "react";
var render = /* @__PURE__ */ __name((args, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }
  return React2.createElement(Component, { ...args });
}, "render");

// src/renderToCanvas.tsx
import React3, { Fragment, Component as ReactComponent, StrictMode } from "react";
import { global } from "@storybook/global";
var { FRAMEWORK_OPTIONS } = global;
var _ErrorBoundary = class _ErrorBoundary extends ReactComponent {
  constructor() {
    super(...arguments);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidMount() {
    const { hasError } = this.state;
    const { showMain } = this.props;
    if (!hasError) {
      showMain();
    }
  }
  componentDidCatch(err) {
    const { showException } = this.props;
    showException(err);
  }
  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    return hasError ? null : children;
  }
};
__name(_ErrorBoundary, "ErrorBoundary");
var ErrorBoundary = _ErrorBoundary;
var Wrapper = FRAMEWORK_OPTIONS?.strictMode ? StrictMode : Fragment;
var actQueue = [];
var isActing = false;
var processActQueue = /* @__PURE__ */ __name(async () => {
  if (isActing || actQueue.length === 0) {
    return;
  }
  isActing = true;
  const actTask = actQueue.shift();
  if (actTask) {
    await actTask();
  }
  isActing = false;
  processActQueue();
}, "processActQueue");
async function renderToCanvas({
  storyContext,
  unboundStoryFn,
  showMain,
  showException,
  forceRemount
}, canvasElement) {
  const { renderElement, unmountElement } = await import("@storybook/react-dom-shim");
  const Story = unboundStoryFn;
  const isPortableStory = storyContext.parameters.__isPortableStory;
  const content = isPortableStory ? React3.createElement(Story, { ...storyContext }) : React3.createElement(ErrorBoundary, { key: storyContext.id, showMain, showException }, React3.createElement(Story, { ...storyContext }));
  const element = Wrapper ? React3.createElement(Wrapper, null, content) : content;
  if (forceRemount) {
    unmountElement(canvasElement);
  }
  const act = await getAct({ disableAct: storyContext.viewMode === "docs" });
  await new Promise(async (resolve, reject) => {
    actQueue.push(async () => {
      try {
        await act(async () => {
          await renderElement(element, canvasElement, storyContext?.parameters?.react?.rootOptions);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    processActQueue();
  });
  return async () => {
    await act(() => {
      unmountElement(canvasElement);
    });
  };
}
__name(renderToCanvas, "renderToCanvas");

// src/mount.ts
var mount = /* @__PURE__ */ __name((context) => async (ui) => {
  if (ui != null) {
    context.originalStoryFn = () => ui;
  }
  await context.renderToCanvas();
  return context.canvas;
}, "mount");

// src/entry-preview.tsx
var decorators = [
  (story, context) => {
    if (!context.parameters?.react?.rsc) {
      return story();
    }
    const [major, minor] = React4.version.split(".").map((part) => parseInt(part, 10));
    if (!Number.isInteger(major) || !Number.isInteger(minor)) {
      throw new Error("Unable to parse React version");
    }
    if (major < 18 || major === 18 && minor < 3) {
      throw new Error("React Server Components require React >= 18.3");
    }
    return React4.createElement(React4.Suspense, null, story());
  },
  (story, context) => {
    if (context.tags?.includes("test-fn") && !global2.FEATURES?.experimentalTestSyntax) {
      throw new Error(
        "To use the experimental test function, you must enable the experimentalTestSyntax feature flag. See https://storybook.js.org/docs/10/api/main-config/main-config-features#experimentalTestSyntax"
      );
    }
    return story();
  }
];
var parameters = {
  renderer: "react"
};
var beforeAll = /* @__PURE__ */ __name(async () => {
  try {
    const act = await getAct();
    configure({
      unstable_advanceTimersWrapper: /* @__PURE__ */ __name((cb) => {
        return act(cb);
      }, "unstable_advanceTimersWrapper"),
      // For more context about why we need disable act warnings in waitFor:
      // https://github.com/reactwg/react-18/discussions/102
      asyncWrapper: /* @__PURE__ */ __name(async (cb) => {
        const previousActEnvironment = getReactActEnvironment();
        setReactActEnvironment(false);
        try {
          const result = await cb();
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 0);
            if (jestFakeTimersAreEnabled()) {
              jest.advanceTimersByTime(0);
            }
          });
          return result;
        } finally {
          setReactActEnvironment(previousActEnvironment);
        }
      }, "asyncWrapper"),
      eventWrapper: /* @__PURE__ */ __name((cb) => {
        let result;
        act(() => {
          result = cb();
          return result;
        });
        return result;
      }, "eventWrapper")
    });
  } catch (e) {
  }
}, "beforeAll");
function jestFakeTimersAreEnabled() {
  if (typeof jest !== "undefined" && jest !== null) {
    return (
      // legacy timers
      setTimeout._isMockFunction === true || // modern timers
      Object.prototype.hasOwnProperty.call(setTimeout, "clock")
    );
  }
  return false;
}
__name(jestFakeTimersAreEnabled, "jestFakeTimersAreEnabled");

export {
  render,
  renderToCanvas,
  mount,
  decorators,
  parameters,
  beforeAll,
  entry_preview_exports
};
