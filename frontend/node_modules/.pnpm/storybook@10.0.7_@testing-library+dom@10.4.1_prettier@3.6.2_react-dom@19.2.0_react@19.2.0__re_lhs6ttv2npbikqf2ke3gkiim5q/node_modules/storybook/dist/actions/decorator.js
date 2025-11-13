import {
  actions
} from "../_browser-chunks/chunk-PB6FZ3WE.js";
import {
  PARAM_KEY
} from "../_browser-chunks/chunk-XW6KSYKF.js";
import {
  __name
} from "../_browser-chunks/chunk-MM7DTO55.js";

// src/actions/decorator.ts
import { makeDecorator, useEffect } from "storybook/preview-api";
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var isIE = Element != null && !Element.prototype.matches;
var matchesMethod = isIE ? "msMatchesSelector" : "matches";
var hasMatchInAncestry = /* @__PURE__ */ __name((element, selector) => {
  if (element[matchesMethod](selector)) {
    return true;
  }
  const parent = element.parentElement;
  if (!parent) {
    return false;
  }
  return hasMatchInAncestry(parent, selector);
}, "hasMatchInAncestry");
var createHandlers = /* @__PURE__ */ __name((actionsFn, ...handles) => {
  const actionsObject = actionsFn(...handles);
  return Object.entries(actionsObject).map(([key, action]) => {
    const [_, eventName, selector] = key.match(delegateEventSplitter) || [];
    return {
      eventName,
      handler: /* @__PURE__ */ __name((e) => {
        if (!selector || hasMatchInAncestry(e.target, selector)) {
          action(e);
        }
      }, "handler")
    };
  });
}, "createHandlers");
var applyEventHandlers = /* @__PURE__ */ __name((actionsFn, ...handles) => {
  const root = typeof globalThis.document !== "undefined" && globalThis.document.getElementById("storybook-root");
  useEffect(() => {
    if (root) {
      const handlers = createHandlers(actionsFn, ...handles);
      handlers.forEach(({ eventName, handler }) => root.addEventListener(eventName, handler));
      return () => handlers.forEach(({ eventName, handler }) => root.removeEventListener(eventName, handler));
    }
    return void 0;
  }, [root, actionsFn, handles]);
}, "applyEventHandlers");
var withActions = makeDecorator({
  name: "withActions",
  parameterName: PARAM_KEY,
  skipIfNoParametersOrOptions: true,
  wrapper: /* @__PURE__ */ __name((getStory, context, { parameters }) => {
    if (parameters?.handles) {
      applyEventHandlers(actions, ...parameters.handles);
    }
    return getStory(context);
  }, "wrapper")
});
export {
  withActions
};
