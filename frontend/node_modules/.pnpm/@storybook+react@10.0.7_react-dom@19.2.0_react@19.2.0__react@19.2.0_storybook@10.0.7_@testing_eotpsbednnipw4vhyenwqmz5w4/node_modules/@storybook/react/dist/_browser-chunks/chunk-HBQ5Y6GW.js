import {
  applyDecorators
} from "./chunk-BUAOEMNB.js";
import {
  isForwardRef,
  isMemo,
  reactElementToJsxString
} from "./chunk-VVH2AMAL.js";
import {
  __export,
  __name
} from "./chunk-L5NVL7MD.js";

// src/entry-preview-docs.ts
var entry_preview_docs_exports = {};
__export(entry_preview_docs_exports, {
  applyDecorators: () => applyDecorators2,
  decorators: () => decorators,
  parameters: () => parameters
});

// src/docs/jsxDecorator.tsx
import React, { createElement, isValidElement } from "react";
import { logger } from "storybook/internal/client-logger";
import { SourceType, getDocgenSection } from "storybook/internal/docs-tools";
import { emitTransformCode, useEffect, useRef } from "storybook/preview-api";
var reactElementToJSXString = reactElementToJsxString;
var toPascalCase = /* @__PURE__ */ __name((str) => str.charAt(0).toUpperCase() + str.slice(1), "toPascalCase");
var getReactSymbolName = /* @__PURE__ */ __name((elementType) => {
  const elementName = elementType.$$typeof || elementType;
  const symbolDescription = elementName.toString().replace(/^Symbol\((.*)\)$/, "$1");
  const reactComponentName = symbolDescription.split(".").map((segment) => {
    return segment.split("_").map(toPascalCase).join("");
  }).join(".");
  return reactComponentName;
}, "getReactSymbolName");
function simplifyNodeForStringify(node) {
  if (isValidElement(node)) {
    const props = Object.keys(node.props).reduce((acc, cur) => {
      acc[cur] = simplifyNodeForStringify(node.props[cur]);
      return acc;
    }, {});
    return {
      ...node,
      props,
      // @ts-expect-error (this is an internal or removed api)
      _owner: null
    };
  }
  if (Array.isArray(node)) {
    return node.map(simplifyNodeForStringify);
  }
  return node;
}
__name(simplifyNodeForStringify, "simplifyNodeForStringify");
var renderJsx = /* @__PURE__ */ __name((code, options) => {
  if (typeof code === "undefined") {
    logger.warn("Too many skip or undefined component");
    return null;
  }
  let renderedJSX = code;
  const Type = renderedJSX.type;
  for (let i = 0; i < options?.skip; i += 1) {
    if (typeof renderedJSX === "undefined") {
      logger.warn("Cannot skip undefined element");
      return null;
    }
    if (React.Children.count(renderedJSX) > 1) {
      logger.warn("Trying to skip an array of elements");
      return null;
    }
    if (typeof renderedJSX.props.children === "undefined") {
      logger.warn("Not enough children to skip elements.");
      if (typeof renderedJSX.type === "function" && renderedJSX.type.name === "") {
        renderedJSX = React.createElement(Type, { ...renderedJSX.props });
      }
    } else if (typeof renderedJSX.props.children === "function") {
      renderedJSX = renderedJSX.props.children();
    } else {
      renderedJSX = renderedJSX.props.children;
    }
  }
  let displayNameDefaults;
  if (typeof options?.displayName === "string") {
    displayNameDefaults = { showFunctions: true, displayName: /* @__PURE__ */ __name(() => options.displayName, "displayName") };
  } else {
    displayNameDefaults = {
      // To get exotic component names resolving properly
      displayName: /* @__PURE__ */ __name((el) => {
        if (el.type.displayName) {
          return el.type.displayName;
        } else if (getDocgenSection(el.type, "displayName")) {
          return getDocgenSection(el.type, "displayName");
        } else if (el.type.render?.displayName) {
          return el.type.render.displayName;
        } else if (typeof el.type === "symbol" || el.type.$$typeof && typeof el.type.$$typeof === "symbol") {
          return getReactSymbolName(el.type);
        } else if (el.type.name && el.type.name !== "_default") {
          return el.type.name;
        } else if (typeof el.type === "function") {
          return "No Display Name";
        } else if (isForwardRef(el.type)) {
          return el.type.render.name;
        } else if (isMemo(el.type)) {
          return el.type.type.name;
        } else {
          return el.type;
        }
      }, "displayName")
    };
  }
  const filterDefaults = {
    filterProps: /* @__PURE__ */ __name((value, key) => value !== void 0, "filterProps")
  };
  const opts = {
    ...displayNameDefaults,
    ...filterDefaults,
    ...options
  };
  const result = React.Children.map(code, (c) => {
    const child = typeof c === "number" ? c.toString() : c;
    const toJSXString = typeof reactElementToJSXString === "function" ? reactElementToJSXString : (
      // @ts-expect-error (Converted from ts-ignore)
      reactElementToJSXString.default
    );
    let string = toJSXString(simplifyNodeForStringify(child), opts);
    if (string.indexOf("&quot;") > -1) {
      const matches = string.match(/\S+=\\"([^"]*)\\"/g);
      if (matches) {
        matches.forEach((match) => {
          string = string.replace(match, match.replace(/&quot;/g, "'"));
        });
      }
    }
    return string;
  }).join("\n");
  return result.replace(/function\s+noRefCheck\(\)\s*\{\}/g, "() => {}");
}, "renderJsx");
var defaultOpts = {
  skip: 0,
  showFunctions: false,
  enableBeautify: true,
  showDefaultProps: false
};
var skipJsxRender = /* @__PURE__ */ __name((context) => {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;
  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }
  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}, "skipJsxRender");
var isMdx = /* @__PURE__ */ __name((node) => node.type?.displayName === "MDXCreateElement" && !!node.props?.mdxType, "isMdx");
var mdxToJsx = /* @__PURE__ */ __name((node) => {
  if (!isMdx(node)) {
    return node;
  }
  const { mdxType, originalType, children, ...rest } = node.props;
  let jsxChildren = [];
  if (children) {
    const array = Array.isArray(children) ? children : [children];
    jsxChildren = array.map(mdxToJsx);
  }
  return createElement(originalType, rest, ...jsxChildren);
}, "mdxToJsx");
var jsxDecorator = /* @__PURE__ */ __name((storyFn, context) => {
  const jsx = useRef(void 0);
  const story = storyFn();
  const skip = skipJsxRender(context);
  const options = {
    ...defaultOpts,
    ...context?.parameters.jsx || {}
  };
  const storyJsx = context.originalStoryFn(context.args, context);
  useEffect(() => {
    if (skip) {
      return;
    }
    const sourceJsx = mdxToJsx(storyJsx);
    const rendered = renderJsx(sourceJsx, options);
    if (rendered && jsx.current !== rendered) {
      emitTransformCode(rendered, context);
      jsx.current = rendered;
    }
  });
  return story;
}, "jsxDecorator");

// src/docs/applyDecorators.ts
var applyDecorators2 = /* @__PURE__ */ __name((storyFn, decorators2) => {
  const jsxIndex = decorators2.findIndex((d) => d.originalFn === jsxDecorator);
  const reorderedDecorators = jsxIndex === -1 ? decorators2 : [...decorators2.splice(jsxIndex, 1), ...decorators2];
  return applyDecorators(storyFn, reorderedDecorators);
}, "applyDecorators");

// src/entry-preview-docs.ts
var decorators = [jsxDecorator];
var parameters = {
  docs: {
    story: { inline: true }
  }
};

export {
  applyDecorators2 as applyDecorators,
  decorators,
  parameters,
  entry_preview_docs_exports
};
