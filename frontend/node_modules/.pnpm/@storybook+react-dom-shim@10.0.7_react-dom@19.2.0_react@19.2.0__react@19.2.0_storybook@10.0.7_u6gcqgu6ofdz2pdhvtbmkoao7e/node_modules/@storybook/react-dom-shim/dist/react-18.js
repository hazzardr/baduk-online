import {
  __name
} from "./_browser-chunks/chunk-JK72E6FR.js";

// src/react-18.tsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
var nodes = /* @__PURE__ */ new Map();
function getIsReactActEnvironment() {
  return globalThis.IS_REACT_ACT_ENVIRONMENT;
}
__name(getIsReactActEnvironment, "getIsReactActEnvironment");
var WithCallback = /* @__PURE__ */ __name(({
  callback,
  children
}) => {
  const once = React.useRef();
  React.useLayoutEffect(() => {
    if (once.current === callback) {
      return;
    }
    once.current = callback;
    callback();
  }, [callback]);
  return children;
}, "WithCallback");
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = () => {
    let resolve = null;
    let reject = null;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
var renderElement = /* @__PURE__ */ __name(async (node, el, rootOptions) => {
  const root = await getReactRoot(el, rootOptions);
  if (getIsReactActEnvironment()) {
    root.render(node);
    return;
  }
  const { promise, resolve } = Promise.withResolvers();
  root.render(React.createElement(WithCallback, { callback: resolve }, node));
  return promise;
}, "renderElement");
var unmountElement = /* @__PURE__ */ __name((el, shouldUseNewRootApi) => {
  const root = nodes.get(el);
  if (root) {
    root.unmount();
    nodes.delete(el);
  }
}, "unmountElement");
var getReactRoot = /* @__PURE__ */ __name(async (el, rootOptions) => {
  let root = nodes.get(el);
  if (!root) {
    root = ReactDOM.createRoot(el, rootOptions);
    nodes.set(el, root);
  }
  return root;
}, "getReactRoot");
export {
  renderElement,
  unmountElement
};
