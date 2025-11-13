import {
  __name
} from "./_browser-chunks/chunk-JK72E6FR.js";

// src/react-16.tsx
import * as ReactDOM from "react-dom";
var renderElement = /* @__PURE__ */ __name(async (node, el) => {
  return new Promise((resolve) => {
    ReactDOM.render(node, el, () => resolve(null));
  });
}, "renderElement");
var unmountElement = /* @__PURE__ */ __name((el) => {
  ReactDOM.unmountComponentAtNode(el);
}, "unmountElement");
export {
  renderElement,
  unmountElement
};
