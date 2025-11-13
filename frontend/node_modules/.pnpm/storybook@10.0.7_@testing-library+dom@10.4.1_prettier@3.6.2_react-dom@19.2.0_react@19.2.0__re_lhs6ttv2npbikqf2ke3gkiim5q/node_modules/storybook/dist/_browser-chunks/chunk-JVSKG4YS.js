import {
  __name
} from "./chunk-MM7DTO55.js";

// ../node_modules/tinyrainbow/dist/chunk-BVHSVHOK.js
var f = {
  reset: [0, 0],
  bold: [1, 22, "\x1B[22m\x1B[1m"],
  dim: [2, 22, "\x1B[22m\x1B[2m"],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
};
var h = Object.entries(f);
function a(n) {
  return String(n);
}
__name(a, "a");
a.open = "";
a.close = "";
var B = h.reduce(
  (n, [e]) => (n[e] = a, n),
  { isColorSupported: false }
);
function C(n = false) {
  let e = typeof process != "undefined" ? process : void 0, i = (e == null ? void 0 : e.env) || {}, g = (e == null ? void 0 : e.argv) || [];
  return !("NO_COLOR" in i || g.includes("--no-color")) && ("FORCE_COLOR" in i || g.includes("--color") || (e == null ? void 0 : e.platform) === "win32" || n && i.TERM !== "dumb" || "CI" in i) || typeof window != "undefined" && !!window.chrome;
}
__name(C, "C");
function p(n = false) {
  let e = C(n), i = /* @__PURE__ */ __name((r, t, c, o) => {
    let l = "", s2 = 0;
    do
      l += r.substring(s2, o) + c, s2 = o + t.length, o = r.indexOf(t, s2);
    while (~o);
    return l + r.substring(s2);
  }, "i"), g = /* @__PURE__ */ __name((r, t, c = r) => {
    let o = /* @__PURE__ */ __name((l) => {
      let s2 = String(l), b = s2.indexOf(t, r.length);
      return ~b ? r + i(s2, t, c, b) + t : r + s2 + t;
    }, "o");
    return o.open = r, o.close = t, o;
  }, "g"), u = {
    isColorSupported: e
  }, d = /* @__PURE__ */ __name((r) => `\x1B[${r}m`, "d");
  for (let [r, t] of h)
    u[r] = e ? g(
      d(t[0]),
      d(t[1]),
      t[2]
    ) : a;
  return u;
}
__name(p, "p");

// ../node_modules/tinyrainbow/dist/browser.js
var s = p();

// ../node_modules/@vitest/pretty-format/dist/index.js
function _mergeNamespaces(n, m2) {
  m2.forEach(function(e) {
    e && typeof e !== "string" && !Array.isArray(e) && Object.keys(e).forEach(function(k) {
      if (k !== "default" && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: /* @__PURE__ */ __name(function() {
            return e[k];
          }, "get")
        });
      }
    });
  });
  return Object.freeze(n);
}
__name(_mergeNamespaces, "_mergeNamespaces");
function getKeysOfEnumerableProperties(object, compareKeys) {
  const rawKeys = Object.keys(object);
  const keys = compareKeys === null ? rawKeys : rawKeys.sort(compareKeys);
  if (Object.getOwnPropertySymbols) {
    for (const symbol of Object.getOwnPropertySymbols(object)) {
      if (Object.getOwnPropertyDescriptor(object, symbol).enumerable) {
        keys.push(symbol);
      }
    }
  }
  return keys;
}
__name(getKeysOfEnumerableProperties, "getKeysOfEnumerableProperties");
function printIteratorEntries(iterator, config, indentation, depth, refs, printer2, separator = ": ") {
  let result = "";
  let width = 0;
  let current = iterator.next();
  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    while (!current.done) {
      result += indentationNext;
      if (width++ === config.maxWidth) {
        result += "\u2026";
        break;
      }
      const name = printer2(current.value[0], config, indentationNext, depth, refs);
      const value = printer2(current.value[1], config, indentationNext, depth, refs);
      result += name + separator + value;
      current = iterator.next();
      if (!current.done) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
__name(printIteratorEntries, "printIteratorEntries");
function printIteratorValues(iterator, config, indentation, depth, refs, printer2) {
  let result = "";
  let width = 0;
  let current = iterator.next();
  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    while (!current.done) {
      result += indentationNext;
      if (width++ === config.maxWidth) {
        result += "\u2026";
        break;
      }
      result += printer2(current.value, config, indentationNext, depth, refs);
      current = iterator.next();
      if (!current.done) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
__name(printIteratorValues, "printIteratorValues");
function printListItems(list, config, indentation, depth, refs, printer2) {
  let result = "";
  list = list instanceof ArrayBuffer ? new DataView(list) : list;
  const isDataView = /* @__PURE__ */ __name((l) => l instanceof DataView, "isDataView");
  const length = isDataView(list) ? list.byteLength : list.length;
  if (length > 0) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    for (let i = 0; i < length; i++) {
      result += indentationNext;
      if (i === config.maxWidth) {
        result += "\u2026";
        break;
      }
      if (isDataView(list) || i in list) {
        result += printer2(isDataView(list) ? list.getInt8(i) : list[i], config, indentationNext, depth, refs);
      }
      if (i < length - 1) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
__name(printListItems, "printListItems");
function printObjectProperties(val, config, indentation, depth, refs, printer2) {
  let result = "";
  const keys = getKeysOfEnumerableProperties(val, config.compareKeys);
  if (keys.length > 0) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name = printer2(key, config, indentationNext, depth, refs);
      const value = printer2(val[key], config, indentationNext, depth, refs);
      result += `${indentationNext + name}: ${value}`;
      if (i < keys.length - 1) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
__name(printObjectProperties, "printObjectProperties");
var asymmetricMatcher = typeof Symbol === "function" && Symbol.for ? Symbol.for("jest.asymmetricMatcher") : 1267621;
var SPACE$2 = " ";
var serialize$5 = /* @__PURE__ */ __name((val, config, indentation, depth, refs, printer2) => {
  const stringedValue = val.toString();
  if (stringedValue === "ArrayContaining" || stringedValue === "ArrayNotContaining") {
    if (++depth > config.maxDepth) {
      return `[${stringedValue}]`;
    }
    return `${stringedValue + SPACE$2}[${printListItems(val.sample, config, indentation, depth, refs, printer2)}]`;
  }
  if (stringedValue === "ObjectContaining" || stringedValue === "ObjectNotContaining") {
    if (++depth > config.maxDepth) {
      return `[${stringedValue}]`;
    }
    return `${stringedValue + SPACE$2}{${printObjectProperties(val.sample, config, indentation, depth, refs, printer2)}}`;
  }
  if (stringedValue === "StringMatching" || stringedValue === "StringNotMatching") {
    return stringedValue + SPACE$2 + printer2(val.sample, config, indentation, depth, refs);
  }
  if (stringedValue === "StringContaining" || stringedValue === "StringNotContaining") {
    return stringedValue + SPACE$2 + printer2(val.sample, config, indentation, depth, refs);
  }
  if (typeof val.toAsymmetricMatcher !== "function") {
    throw new TypeError(`Asymmetric matcher ${val.constructor.name} does not implement toAsymmetricMatcher()`);
  }
  return val.toAsymmetricMatcher();
}, "serialize$5");
var test$5 = /* @__PURE__ */ __name((val) => val && val.$$typeof === asymmetricMatcher, "test$5");
var plugin$5 = {
  serialize: serialize$5,
  test: test$5
};
var SPACE$1 = " ";
var OBJECT_NAMES = /* @__PURE__ */ new Set(["DOMStringMap", "NamedNodeMap"]);
var ARRAY_REGEXP = /^(?:HTML\w*Collection|NodeList)$/;
function testName(name) {
  return OBJECT_NAMES.has(name) || ARRAY_REGEXP.test(name);
}
__name(testName, "testName");
var test$4 = /* @__PURE__ */ __name((val) => val && val.constructor && !!val.constructor.name && testName(val.constructor.name), "test$4");
function isNamedNodeMap(collection) {
  return collection.constructor.name === "NamedNodeMap";
}
__name(isNamedNodeMap, "isNamedNodeMap");
var serialize$4 = /* @__PURE__ */ __name((collection, config, indentation, depth, refs, printer2) => {
  const name = collection.constructor.name;
  if (++depth > config.maxDepth) {
    return `[${name}]`;
  }
  return (config.min ? "" : name + SPACE$1) + (OBJECT_NAMES.has(name) ? `{${printObjectProperties(isNamedNodeMap(collection) ? [...collection].reduce((props, attribute) => {
    props[attribute.name] = attribute.value;
    return props;
  }, {}) : { ...collection }, config, indentation, depth, refs, printer2)}}` : `[${printListItems([...collection], config, indentation, depth, refs, printer2)}]`);
}, "serialize$4");
var plugin$4 = {
  serialize: serialize$4,
  test: test$4
};
function escapeHTML(str) {
  return str.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
__name(escapeHTML, "escapeHTML");
function printProps(keys, props, config, indentation, depth, refs, printer2) {
  const indentationNext = indentation + config.indent;
  const colors = config.colors;
  return keys.map((key) => {
    const value = props[key];
    let printed = printer2(value, config, indentationNext, depth, refs);
    if (typeof value !== "string") {
      if (printed.includes("\n")) {
        printed = config.spacingOuter + indentationNext + printed + config.spacingOuter + indentation;
      }
      printed = `{${printed}}`;
    }
    return `${config.spacingInner + indentation + colors.prop.open + key + colors.prop.close}=${colors.value.open}${printed}${colors.value.close}`;
  }).join("");
}
__name(printProps, "printProps");
function printChildren(children, config, indentation, depth, refs, printer2) {
  return children.map((child) => config.spacingOuter + indentation + (typeof child === "string" ? printText(child, config) : printer2(child, config, indentation, depth, refs))).join("");
}
__name(printChildren, "printChildren");
function printText(text, config) {
  const contentColor = config.colors.content;
  return contentColor.open + escapeHTML(text) + contentColor.close;
}
__name(printText, "printText");
function printComment(comment, config) {
  const commentColor = config.colors.comment;
  return `${commentColor.open}<!--${escapeHTML(comment)}-->${commentColor.close}`;
}
__name(printComment, "printComment");
function printElement(type, printedProps, printedChildren, config, indentation) {
  const tagColor = config.colors.tag;
  return `${tagColor.open}<${type}${printedProps && tagColor.close + printedProps + config.spacingOuter + indentation + tagColor.open}${printedChildren ? `>${tagColor.close}${printedChildren}${config.spacingOuter}${indentation}${tagColor.open}</${type}` : `${printedProps && !config.min ? "" : " "}/`}>${tagColor.close}`;
}
__name(printElement, "printElement");
function printElementAsLeaf(type, config) {
  const tagColor = config.colors.tag;
  return `${tagColor.open}<${type}${tagColor.close} \u2026${tagColor.open} />${tagColor.close}`;
}
__name(printElementAsLeaf, "printElementAsLeaf");
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var FRAGMENT_NODE = 11;
var ELEMENT_REGEXP = /^(?:(?:HTML|SVG)\w*)?Element$/;
function testHasAttribute(val) {
  try {
    return typeof val.hasAttribute === "function" && val.hasAttribute("is");
  } catch {
    return false;
  }
}
__name(testHasAttribute, "testHasAttribute");
function testNode(val) {
  const constructorName = val.constructor.name;
  const { nodeType, tagName } = val;
  const isCustomElement = typeof tagName === "string" && tagName.includes("-") || testHasAttribute(val);
  return nodeType === ELEMENT_NODE && (ELEMENT_REGEXP.test(constructorName) || isCustomElement) || nodeType === TEXT_NODE && constructorName === "Text" || nodeType === COMMENT_NODE && constructorName === "Comment" || nodeType === FRAGMENT_NODE && constructorName === "DocumentFragment";
}
__name(testNode, "testNode");
var test$3 = /* @__PURE__ */ __name((val) => {
  var _val$constructor;
  return (val === null || val === void 0 || (_val$constructor = val.constructor) === null || _val$constructor === void 0 ? void 0 : _val$constructor.name) && testNode(val);
}, "test$3");
function nodeIsText(node) {
  return node.nodeType === TEXT_NODE;
}
__name(nodeIsText, "nodeIsText");
function nodeIsComment(node) {
  return node.nodeType === COMMENT_NODE;
}
__name(nodeIsComment, "nodeIsComment");
function nodeIsFragment(node) {
  return node.nodeType === FRAGMENT_NODE;
}
__name(nodeIsFragment, "nodeIsFragment");
var serialize$3 = /* @__PURE__ */ __name((node, config, indentation, depth, refs, printer2) => {
  if (nodeIsText(node)) {
    return printText(node.data, config);
  }
  if (nodeIsComment(node)) {
    return printComment(node.data, config);
  }
  const type = nodeIsFragment(node) ? "DocumentFragment" : node.tagName.toLowerCase();
  if (++depth > config.maxDepth) {
    return printElementAsLeaf(type, config);
  }
  return printElement(type, printProps(nodeIsFragment(node) ? [] : Array.from(node.attributes, (attr) => attr.name).sort(), nodeIsFragment(node) ? {} : [...node.attributes].reduce((props, attribute) => {
    props[attribute.name] = attribute.value;
    return props;
  }, {}), config, indentation + config.indent, depth, refs, printer2), printChildren(Array.prototype.slice.call(node.childNodes || node.children), config, indentation + config.indent, depth, refs, printer2), config, indentation);
}, "serialize$3");
var plugin$3 = {
  serialize: serialize$3,
  test: test$3
};
var IS_ITERABLE_SENTINEL = "@@__IMMUTABLE_ITERABLE__@@";
var IS_LIST_SENTINEL = "@@__IMMUTABLE_LIST__@@";
var IS_KEYED_SENTINEL = "@@__IMMUTABLE_KEYED__@@";
var IS_MAP_SENTINEL = "@@__IMMUTABLE_MAP__@@";
var IS_ORDERED_SENTINEL = "@@__IMMUTABLE_ORDERED__@@";
var IS_RECORD_SENTINEL = "@@__IMMUTABLE_RECORD__@@";
var IS_SEQ_SENTINEL = "@@__IMMUTABLE_SEQ__@@";
var IS_SET_SENTINEL = "@@__IMMUTABLE_SET__@@";
var IS_STACK_SENTINEL = "@@__IMMUTABLE_STACK__@@";
var getImmutableName = /* @__PURE__ */ __name((name) => `Immutable.${name}`, "getImmutableName");
var printAsLeaf = /* @__PURE__ */ __name((name) => `[${name}]`, "printAsLeaf");
var SPACE = " ";
var LAZY = "\u2026";
function printImmutableEntries(val, config, indentation, depth, refs, printer2, type) {
  return ++depth > config.maxDepth ? printAsLeaf(getImmutableName(type)) : `${getImmutableName(type) + SPACE}{${printIteratorEntries(val.entries(), config, indentation, depth, refs, printer2)}}`;
}
__name(printImmutableEntries, "printImmutableEntries");
function getRecordEntries(val) {
  let i = 0;
  return { next() {
    if (i < val._keys.length) {
      const key = val._keys[i++];
      return {
        done: false,
        value: [key, val.get(key)]
      };
    }
    return {
      done: true,
      value: void 0
    };
  } };
}
__name(getRecordEntries, "getRecordEntries");
function printImmutableRecord(val, config, indentation, depth, refs, printer2) {
  const name = getImmutableName(val._name || "Record");
  return ++depth > config.maxDepth ? printAsLeaf(name) : `${name + SPACE}{${printIteratorEntries(getRecordEntries(val), config, indentation, depth, refs, printer2)}}`;
}
__name(printImmutableRecord, "printImmutableRecord");
function printImmutableSeq(val, config, indentation, depth, refs, printer2) {
  const name = getImmutableName("Seq");
  if (++depth > config.maxDepth) {
    return printAsLeaf(name);
  }
  if (val[IS_KEYED_SENTINEL]) {
    return `${name + SPACE}{${val._iter || val._object ? printIteratorEntries(val.entries(), config, indentation, depth, refs, printer2) : LAZY}}`;
  }
  return `${name + SPACE}[${val._iter || val._array || val._collection || val._iterable ? printIteratorValues(val.values(), config, indentation, depth, refs, printer2) : LAZY}]`;
}
__name(printImmutableSeq, "printImmutableSeq");
function printImmutableValues(val, config, indentation, depth, refs, printer2, type) {
  return ++depth > config.maxDepth ? printAsLeaf(getImmutableName(type)) : `${getImmutableName(type) + SPACE}[${printIteratorValues(val.values(), config, indentation, depth, refs, printer2)}]`;
}
__name(printImmutableValues, "printImmutableValues");
var serialize$2 = /* @__PURE__ */ __name((val, config, indentation, depth, refs, printer2) => {
  if (val[IS_MAP_SENTINEL]) {
    return printImmutableEntries(val, config, indentation, depth, refs, printer2, val[IS_ORDERED_SENTINEL] ? "OrderedMap" : "Map");
  }
  if (val[IS_LIST_SENTINEL]) {
    return printImmutableValues(val, config, indentation, depth, refs, printer2, "List");
  }
  if (val[IS_SET_SENTINEL]) {
    return printImmutableValues(val, config, indentation, depth, refs, printer2, val[IS_ORDERED_SENTINEL] ? "OrderedSet" : "Set");
  }
  if (val[IS_STACK_SENTINEL]) {
    return printImmutableValues(val, config, indentation, depth, refs, printer2, "Stack");
  }
  if (val[IS_SEQ_SENTINEL]) {
    return printImmutableSeq(val, config, indentation, depth, refs, printer2);
  }
  return printImmutableRecord(val, config, indentation, depth, refs, printer2);
}, "serialize$2");
var test$2 = /* @__PURE__ */ __name((val) => val && (val[IS_ITERABLE_SENTINEL] === true || val[IS_RECORD_SENTINEL] === true), "test$2");
var plugin$2 = {
  serialize: serialize$2,
  test: test$2
};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
__name(getDefaultExportFromCjs, "getDefaultExportFromCjs");
var reactIs$1 = { exports: {} };
var reactIs_production = {};
var hasRequiredReactIs_production;
function requireReactIs_production() {
  if (hasRequiredReactIs_production) return reactIs_production;
  hasRequiredReactIs_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function typeOf(object) {
    if ("object" === typeof object && null !== object) {
      var $$typeof = object.$$typeof;
      switch ($$typeof) {
        case REACT_ELEMENT_TYPE:
          switch (object = object.type, object) {
            case REACT_FRAGMENT_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_SUSPENSE_TYPE:
            case REACT_SUSPENSE_LIST_TYPE:
            case REACT_VIEW_TRANSITION_TYPE:
              return object;
            default:
              switch (object = object && object.$$typeof, object) {
                case REACT_CONTEXT_TYPE:
                case REACT_FORWARD_REF_TYPE:
                case REACT_LAZY_TYPE:
                case REACT_MEMO_TYPE:
                  return object;
                case REACT_CONSUMER_TYPE:
                  return object;
                default:
                  return $$typeof;
              }
          }
        case REACT_PORTAL_TYPE:
          return $$typeof;
      }
    }
  }
  __name(typeOf, "typeOf");
  reactIs_production.ContextConsumer = REACT_CONSUMER_TYPE;
  reactIs_production.ContextProvider = REACT_CONTEXT_TYPE;
  reactIs_production.Element = REACT_ELEMENT_TYPE;
  reactIs_production.ForwardRef = REACT_FORWARD_REF_TYPE;
  reactIs_production.Fragment = REACT_FRAGMENT_TYPE;
  reactIs_production.Lazy = REACT_LAZY_TYPE;
  reactIs_production.Memo = REACT_MEMO_TYPE;
  reactIs_production.Portal = REACT_PORTAL_TYPE;
  reactIs_production.Profiler = REACT_PROFILER_TYPE;
  reactIs_production.StrictMode = REACT_STRICT_MODE_TYPE;
  reactIs_production.Suspense = REACT_SUSPENSE_TYPE;
  reactIs_production.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
  reactIs_production.isContextConsumer = function(object) {
    return typeOf(object) === REACT_CONSUMER_TYPE;
  };
  reactIs_production.isContextProvider = function(object) {
    return typeOf(object) === REACT_CONTEXT_TYPE;
  };
  reactIs_production.isElement = function(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  };
  reactIs_production.isForwardRef = function(object) {
    return typeOf(object) === REACT_FORWARD_REF_TYPE;
  };
  reactIs_production.isFragment = function(object) {
    return typeOf(object) === REACT_FRAGMENT_TYPE;
  };
  reactIs_production.isLazy = function(object) {
    return typeOf(object) === REACT_LAZY_TYPE;
  };
  reactIs_production.isMemo = function(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
  };
  reactIs_production.isPortal = function(object) {
    return typeOf(object) === REACT_PORTAL_TYPE;
  };
  reactIs_production.isProfiler = function(object) {
    return typeOf(object) === REACT_PROFILER_TYPE;
  };
  reactIs_production.isStrictMode = function(object) {
    return typeOf(object) === REACT_STRICT_MODE_TYPE;
  };
  reactIs_production.isSuspense = function(object) {
    return typeOf(object) === REACT_SUSPENSE_TYPE;
  };
  reactIs_production.isSuspenseList = function(object) {
    return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
  };
  reactIs_production.isValidElementType = function(type) {
    return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? true : false;
  };
  reactIs_production.typeOf = typeOf;
  return reactIs_production;
}
__name(requireReactIs_production, "requireReactIs_production");
var reactIs_development$1 = {};
var hasRequiredReactIs_development$1;
function requireReactIs_development$1() {
  if (hasRequiredReactIs_development$1) return reactIs_development$1;
  hasRequiredReactIs_development$1 = 1;
  "production" !== process.env.NODE_ENV && function() {
    function typeOf(object) {
      if ("object" === typeof object && null !== object) {
        var $$typeof = object.$$typeof;
        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            switch (object = object.type, object) {
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
              case REACT_SUSPENSE_LIST_TYPE:
              case REACT_VIEW_TRANSITION_TYPE:
                return object;
              default:
                switch (object = object && object.$$typeof, object) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                    return object;
                  case REACT_CONSUMER_TYPE:
                    return object;
                  default:
                    return $$typeof;
                }
            }
          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }
    }
    __name(typeOf, "typeOf");
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
    reactIs_development$1.ContextConsumer = REACT_CONSUMER_TYPE;
    reactIs_development$1.ContextProvider = REACT_CONTEXT_TYPE;
    reactIs_development$1.Element = REACT_ELEMENT_TYPE;
    reactIs_development$1.ForwardRef = REACT_FORWARD_REF_TYPE;
    reactIs_development$1.Fragment = REACT_FRAGMENT_TYPE;
    reactIs_development$1.Lazy = REACT_LAZY_TYPE;
    reactIs_development$1.Memo = REACT_MEMO_TYPE;
    reactIs_development$1.Portal = REACT_PORTAL_TYPE;
    reactIs_development$1.Profiler = REACT_PROFILER_TYPE;
    reactIs_development$1.StrictMode = REACT_STRICT_MODE_TYPE;
    reactIs_development$1.Suspense = REACT_SUSPENSE_TYPE;
    reactIs_development$1.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
    reactIs_development$1.isContextConsumer = function(object) {
      return typeOf(object) === REACT_CONSUMER_TYPE;
    };
    reactIs_development$1.isContextProvider = function(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    };
    reactIs_development$1.isElement = function(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    };
    reactIs_development$1.isForwardRef = function(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    };
    reactIs_development$1.isFragment = function(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    };
    reactIs_development$1.isLazy = function(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    };
    reactIs_development$1.isMemo = function(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    };
    reactIs_development$1.isPortal = function(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    };
    reactIs_development$1.isProfiler = function(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    };
    reactIs_development$1.isStrictMode = function(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    };
    reactIs_development$1.isSuspense = function(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    };
    reactIs_development$1.isSuspenseList = function(object) {
      return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
    };
    reactIs_development$1.isValidElementType = function(type) {
      return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? true : false;
    };
    reactIs_development$1.typeOf = typeOf;
  }();
  return reactIs_development$1;
}
__name(requireReactIs_development$1, "requireReactIs_development$1");
var hasRequiredReactIs$1;
function requireReactIs$1() {
  if (hasRequiredReactIs$1) return reactIs$1.exports;
  hasRequiredReactIs$1 = 1;
  if (process.env.NODE_ENV === "production") {
    reactIs$1.exports = requireReactIs_production();
  } else {
    reactIs$1.exports = requireReactIs_development$1();
  }
  return reactIs$1.exports;
}
__name(requireReactIs$1, "requireReactIs$1");
var reactIsExports$1 = requireReactIs$1();
var index$1 = getDefaultExportFromCjs(reactIsExports$1);
var ReactIs19 = _mergeNamespaces({
  __proto__: null,
  default: index$1
}, [reactIsExports$1]);
var reactIs = { exports: {} };
var reactIs_production_min = {};
var hasRequiredReactIs_production_min;
function requireReactIs_production_min() {
  if (hasRequiredReactIs_production_min) return reactIs_production_min;
  hasRequiredReactIs_production_min = 1;
  var b = Symbol.for("react.element"), c = Symbol.for("react.portal"), d = Symbol.for("react.fragment"), e = Symbol.for("react.strict_mode"), f2 = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), h2 = Symbol.for("react.context"), k = Symbol.for("react.server_context"), l = Symbol.for("react.forward_ref"), m2 = Symbol.for("react.suspense"), n = Symbol.for("react.suspense_list"), p2 = Symbol.for("react.memo"), q = Symbol.for("react.lazy"), t = Symbol.for("react.offscreen"), u;
  u = Symbol.for("react.module.reference");
  function v(a2) {
    if ("object" === typeof a2 && null !== a2) {
      var r = a2.$$typeof;
      switch (r) {
        case b:
          switch (a2 = a2.type, a2) {
            case d:
            case f2:
            case e:
            case m2:
            case n:
              return a2;
            default:
              switch (a2 = a2 && a2.$$typeof, a2) {
                case k:
                case h2:
                case l:
                case q:
                case p2:
                case g:
                  return a2;
                default:
                  return r;
              }
          }
        case c:
          return r;
      }
    }
  }
  __name(v, "v");
  reactIs_production_min.ContextConsumer = h2;
  reactIs_production_min.ContextProvider = g;
  reactIs_production_min.Element = b;
  reactIs_production_min.ForwardRef = l;
  reactIs_production_min.Fragment = d;
  reactIs_production_min.Lazy = q;
  reactIs_production_min.Memo = p2;
  reactIs_production_min.Portal = c;
  reactIs_production_min.Profiler = f2;
  reactIs_production_min.StrictMode = e;
  reactIs_production_min.Suspense = m2;
  reactIs_production_min.SuspenseList = n;
  reactIs_production_min.isAsyncMode = function() {
    return false;
  };
  reactIs_production_min.isConcurrentMode = function() {
    return false;
  };
  reactIs_production_min.isContextConsumer = function(a2) {
    return v(a2) === h2;
  };
  reactIs_production_min.isContextProvider = function(a2) {
    return v(a2) === g;
  };
  reactIs_production_min.isElement = function(a2) {
    return "object" === typeof a2 && null !== a2 && a2.$$typeof === b;
  };
  reactIs_production_min.isForwardRef = function(a2) {
    return v(a2) === l;
  };
  reactIs_production_min.isFragment = function(a2) {
    return v(a2) === d;
  };
  reactIs_production_min.isLazy = function(a2) {
    return v(a2) === q;
  };
  reactIs_production_min.isMemo = function(a2) {
    return v(a2) === p2;
  };
  reactIs_production_min.isPortal = function(a2) {
    return v(a2) === c;
  };
  reactIs_production_min.isProfiler = function(a2) {
    return v(a2) === f2;
  };
  reactIs_production_min.isStrictMode = function(a2) {
    return v(a2) === e;
  };
  reactIs_production_min.isSuspense = function(a2) {
    return v(a2) === m2;
  };
  reactIs_production_min.isSuspenseList = function(a2) {
    return v(a2) === n;
  };
  reactIs_production_min.isValidElementType = function(a2) {
    return "string" === typeof a2 || "function" === typeof a2 || a2 === d || a2 === f2 || a2 === e || a2 === m2 || a2 === n || a2 === t || "object" === typeof a2 && null !== a2 && (a2.$$typeof === q || a2.$$typeof === p2 || a2.$$typeof === g || a2.$$typeof === h2 || a2.$$typeof === l || a2.$$typeof === u || void 0 !== a2.getModuleId) ? true : false;
  };
  reactIs_production_min.typeOf = v;
  return reactIs_production_min;
}
__name(requireReactIs_production_min, "requireReactIs_production_min");
var reactIs_development = {};
var hasRequiredReactIs_development;
function requireReactIs_development() {
  if (hasRequiredReactIs_development) return reactIs_development;
  hasRequiredReactIs_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function() {
      var REACT_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_SERVER_CONTEXT_TYPE = Symbol.for("react.server_context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      var enableScopeAPI = false;
      var enableCacheElement = false;
      var enableTransitionTracing = false;
      var enableLegacyHidden = false;
      var enableDebugTracing = false;
      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
      }
      function isValidElementType(type) {
        if (typeof type === "string" || typeof type === "function") {
          return true;
        }
        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === "object" && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
            return true;
          }
        }
        return false;
      }
      __name(isValidElementType, "isValidElementType");
      function typeOf(object) {
        if (typeof object === "object" && object !== null) {
          var $$typeof = object.$$typeof;
          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;
              switch (type) {
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                case REACT_SUSPENSE_LIST_TYPE:
                  return type;
                default:
                  var $$typeofType = type && type.$$typeof;
                  switch ($$typeofType) {
                    case REACT_SERVER_CONTEXT_TYPE:
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;
                    default:
                      return $$typeof;
                  }
              }
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }
        return void 0;
      }
      __name(typeOf, "typeOf");
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element2 = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var SuspenseList = REACT_SUSPENSE_LIST_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;
      var hasWarnedAboutDeprecatedIsConcurrentMode = false;
      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.");
          }
        }
        return false;
      }
      __name(isAsyncMode, "isAsyncMode");
      function isConcurrentMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
            hasWarnedAboutDeprecatedIsConcurrentMode = true;
            console["warn"]("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.");
          }
        }
        return false;
      }
      __name(isConcurrentMode, "isConcurrentMode");
      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }
      __name(isContextConsumer, "isContextConsumer");
      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }
      __name(isContextProvider, "isContextProvider");
      function isElement(object) {
        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      __name(isElement, "isElement");
      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }
      __name(isForwardRef, "isForwardRef");
      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }
      __name(isFragment, "isFragment");
      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }
      __name(isLazy, "isLazy");
      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }
      __name(isMemo, "isMemo");
      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }
      __name(isPortal, "isPortal");
      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }
      __name(isProfiler, "isProfiler");
      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }
      __name(isStrictMode, "isStrictMode");
      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }
      __name(isSuspense, "isSuspense");
      function isSuspenseList(object) {
        return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
      }
      __name(isSuspenseList, "isSuspenseList");
      reactIs_development.ContextConsumer = ContextConsumer;
      reactIs_development.ContextProvider = ContextProvider;
      reactIs_development.Element = Element2;
      reactIs_development.ForwardRef = ForwardRef;
      reactIs_development.Fragment = Fragment;
      reactIs_development.Lazy = Lazy;
      reactIs_development.Memo = Memo;
      reactIs_development.Portal = Portal;
      reactIs_development.Profiler = Profiler;
      reactIs_development.StrictMode = StrictMode;
      reactIs_development.Suspense = Suspense;
      reactIs_development.SuspenseList = SuspenseList;
      reactIs_development.isAsyncMode = isAsyncMode;
      reactIs_development.isConcurrentMode = isConcurrentMode;
      reactIs_development.isContextConsumer = isContextConsumer;
      reactIs_development.isContextProvider = isContextProvider;
      reactIs_development.isElement = isElement;
      reactIs_development.isForwardRef = isForwardRef;
      reactIs_development.isFragment = isFragment;
      reactIs_development.isLazy = isLazy;
      reactIs_development.isMemo = isMemo;
      reactIs_development.isPortal = isPortal;
      reactIs_development.isProfiler = isProfiler;
      reactIs_development.isStrictMode = isStrictMode;
      reactIs_development.isSuspense = isSuspense;
      reactIs_development.isSuspenseList = isSuspenseList;
      reactIs_development.isValidElementType = isValidElementType;
      reactIs_development.typeOf = typeOf;
    })();
  }
  return reactIs_development;
}
__name(requireReactIs_development, "requireReactIs_development");
var hasRequiredReactIs;
function requireReactIs() {
  if (hasRequiredReactIs) return reactIs.exports;
  hasRequiredReactIs = 1;
  if (process.env.NODE_ENV === "production") {
    reactIs.exports = requireReactIs_production_min();
  } else {
    reactIs.exports = requireReactIs_development();
  }
  return reactIs.exports;
}
__name(requireReactIs, "requireReactIs");
var reactIsExports = requireReactIs();
var index = getDefaultExportFromCjs(reactIsExports);
var ReactIs18 = _mergeNamespaces({
  __proto__: null,
  default: index
}, [reactIsExports]);
var reactIsMethods = [
  "isAsyncMode",
  "isConcurrentMode",
  "isContextConsumer",
  "isContextProvider",
  "isElement",
  "isForwardRef",
  "isFragment",
  "isLazy",
  "isMemo",
  "isPortal",
  "isProfiler",
  "isStrictMode",
  "isSuspense",
  "isSuspenseList",
  "isValidElementType"
];
var ReactIs = Object.fromEntries(reactIsMethods.map((m2) => [m2, (v) => ReactIs18[m2](v) || ReactIs19[m2](v)]));
function getChildren(arg, children = []) {
  if (Array.isArray(arg)) {
    for (const item of arg) {
      getChildren(item, children);
    }
  } else if (arg != null && arg !== false && arg !== "") {
    children.push(arg);
  }
  return children;
}
__name(getChildren, "getChildren");
function getType(element) {
  const type = element.type;
  if (typeof type === "string") {
    return type;
  }
  if (typeof type === "function") {
    return type.displayName || type.name || "Unknown";
  }
  if (ReactIs.isFragment(element)) {
    return "React.Fragment";
  }
  if (ReactIs.isSuspense(element)) {
    return "React.Suspense";
  }
  if (typeof type === "object" && type !== null) {
    if (ReactIs.isContextProvider(element)) {
      return "Context.Provider";
    }
    if (ReactIs.isContextConsumer(element)) {
      return "Context.Consumer";
    }
    if (ReactIs.isForwardRef(element)) {
      if (type.displayName) {
        return type.displayName;
      }
      const functionName = type.render.displayName || type.render.name || "";
      return functionName === "" ? "ForwardRef" : `ForwardRef(${functionName})`;
    }
    if (ReactIs.isMemo(element)) {
      const functionName = type.displayName || type.type.displayName || type.type.name || "";
      return functionName === "" ? "Memo" : `Memo(${functionName})`;
    }
  }
  return "UNDEFINED";
}
__name(getType, "getType");
function getPropKeys$1(element) {
  const { props } = element;
  return Object.keys(props).filter((key) => key !== "children" && props[key] !== void 0).sort();
}
__name(getPropKeys$1, "getPropKeys$1");
var serialize$1 = /* @__PURE__ */ __name((element, config, indentation, depth, refs, printer2) => ++depth > config.maxDepth ? printElementAsLeaf(getType(element), config) : printElement(getType(element), printProps(getPropKeys$1(element), element.props, config, indentation + config.indent, depth, refs, printer2), printChildren(getChildren(element.props.children), config, indentation + config.indent, depth, refs, printer2), config, indentation), "serialize$1");
var test$1 = /* @__PURE__ */ __name((val) => val != null && ReactIs.isElement(val), "test$1");
var plugin$1 = {
  serialize: serialize$1,
  test: test$1
};
var testSymbol = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.test.json") : 245830487;
function getPropKeys(object) {
  const { props } = object;
  return props ? Object.keys(props).filter((key) => props[key] !== void 0).sort() : [];
}
__name(getPropKeys, "getPropKeys");
var serialize = /* @__PURE__ */ __name((object, config, indentation, depth, refs, printer2) => ++depth > config.maxDepth ? printElementAsLeaf(object.type, config) : printElement(object.type, object.props ? printProps(getPropKeys(object), object.props, config, indentation + config.indent, depth, refs, printer2) : "", object.children ? printChildren(object.children, config, indentation + config.indent, depth, refs, printer2) : "", config, indentation), "serialize");
var test = /* @__PURE__ */ __name((val) => val && val.$$typeof === testSymbol, "test");
var plugin = {
  serialize,
  test
};
var toString = Object.prototype.toString;
var toISOString = Date.prototype.toISOString;
var errorToString = Error.prototype.toString;
var regExpToString = RegExp.prototype.toString;
function getConstructorName(val) {
  return typeof val.constructor === "function" && val.constructor.name || "Object";
}
__name(getConstructorName, "getConstructorName");
function isWindow(val) {
  return typeof window !== "undefined" && val === window;
}
__name(isWindow, "isWindow");
var SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
var NEWLINE_REGEXP = /\n/g;
var _PrettyFormatPluginError = class _PrettyFormatPluginError extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
    this.name = this.constructor.name;
  }
};
__name(_PrettyFormatPluginError, "PrettyFormatPluginError");
var PrettyFormatPluginError = _PrettyFormatPluginError;
function isToStringedArrayType(toStringed) {
  return toStringed === "[object Array]" || toStringed === "[object ArrayBuffer]" || toStringed === "[object DataView]" || toStringed === "[object Float32Array]" || toStringed === "[object Float64Array]" || toStringed === "[object Int8Array]" || toStringed === "[object Int16Array]" || toStringed === "[object Int32Array]" || toStringed === "[object Uint8Array]" || toStringed === "[object Uint8ClampedArray]" || toStringed === "[object Uint16Array]" || toStringed === "[object Uint32Array]";
}
__name(isToStringedArrayType, "isToStringedArrayType");
function printNumber(val) {
  return Object.is(val, -0) ? "-0" : String(val);
}
__name(printNumber, "printNumber");
function printBigInt(val) {
  return String(`${val}n`);
}
__name(printBigInt, "printBigInt");
function printFunction(val, printFunctionName) {
  if (!printFunctionName) {
    return "[Function]";
  }
  return `[Function ${val.name || "anonymous"}]`;
}
__name(printFunction, "printFunction");
function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, "Symbol($1)");
}
__name(printSymbol, "printSymbol");
function printError(val) {
  return `[${errorToString.call(val)}]`;
}
__name(printError, "printError");
function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false) {
    return `${val}`;
  }
  if (val === void 0) {
    return "undefined";
  }
  if (val === null) {
    return "null";
  }
  const typeOf = typeof val;
  if (typeOf === "number") {
    return printNumber(val);
  }
  if (typeOf === "bigint") {
    return printBigInt(val);
  }
  if (typeOf === "string") {
    if (escapeString) {
      return `"${val.replaceAll(/"|\\/g, "\\$&")}"`;
    }
    return `"${val}"`;
  }
  if (typeOf === "function") {
    return printFunction(val, printFunctionName);
  }
  if (typeOf === "symbol") {
    return printSymbol(val);
  }
  const toStringed = toString.call(val);
  if (toStringed === "[object WeakMap]") {
    return "WeakMap {}";
  }
  if (toStringed === "[object WeakSet]") {
    return "WeakSet {}";
  }
  if (toStringed === "[object Function]" || toStringed === "[object GeneratorFunction]") {
    return printFunction(val, printFunctionName);
  }
  if (toStringed === "[object Symbol]") {
    return printSymbol(val);
  }
  if (toStringed === "[object Date]") {
    return Number.isNaN(+val) ? "Date { NaN }" : toISOString.call(val);
  }
  if (toStringed === "[object Error]") {
    return printError(val);
  }
  if (toStringed === "[object RegExp]") {
    if (escapeRegex) {
      return regExpToString.call(val).replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");
    }
    return regExpToString.call(val);
  }
  if (val instanceof Error) {
    return printError(val);
  }
  return null;
}
__name(printBasicValue, "printBasicValue");
function printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON) {
  if (refs.includes(val)) {
    return "[Circular]";
  }
  refs = [...refs];
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;
  if (config.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === "function" && !hasCalledToJSON) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }
  const toStringed = toString.call(val);
  if (toStringed === "[object Arguments]") {
    return hitMaxDepth ? "[Arguments]" : `${min ? "" : "Arguments "}[${printListItems(val, config, indentation, depth, refs, printer)}]`;
  }
  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth ? `[${val.constructor.name}]` : `${min ? "" : !config.printBasicPrototype && val.constructor.name === "Array" ? "" : `${val.constructor.name} `}[${printListItems(val, config, indentation, depth, refs, printer)}]`;
  }
  if (toStringed === "[object Map]") {
    return hitMaxDepth ? "[Map]" : `Map {${printIteratorEntries(val.entries(), config, indentation, depth, refs, printer, " => ")}}`;
  }
  if (toStringed === "[object Set]") {
    return hitMaxDepth ? "[Set]" : `Set {${printIteratorValues(val.values(), config, indentation, depth, refs, printer)}}`;
  }
  return hitMaxDepth || isWindow(val) ? `[${getConstructorName(val)}]` : `${min ? "" : !config.printBasicPrototype && getConstructorName(val) === "Object" ? "" : `${getConstructorName(val)} `}{${printObjectProperties(val, config, indentation, depth, refs, printer)}}`;
}
__name(printComplexValue, "printComplexValue");
var ErrorPlugin = {
  test: /* @__PURE__ */ __name((val) => val && val instanceof Error, "test"),
  serialize(val, config, indentation, depth, refs, printer2) {
    if (refs.includes(val)) {
      return "[Circular]";
    }
    refs = [...refs, val];
    const hitMaxDepth = ++depth > config.maxDepth;
    const { message, cause, ...rest } = val;
    const entries = {
      message,
      ...typeof cause !== "undefined" ? { cause } : {},
      ...val instanceof AggregateError ? { errors: val.errors } : {},
      ...rest
    };
    const name = val.name !== "Error" ? val.name : getConstructorName(val);
    return hitMaxDepth ? `[${name}]` : `${name} {${printIteratorEntries(Object.entries(entries).values(), config, indentation, depth, refs, printer2)}}`;
  }
};
function isNewPlugin(plugin2) {
  return plugin2.serialize != null;
}
__name(isNewPlugin, "isNewPlugin");
function printPlugin(plugin2, val, config, indentation, depth, refs) {
  let printed;
  try {
    printed = isNewPlugin(plugin2) ? plugin2.serialize(val, config, indentation, depth, refs, printer) : plugin2.print(val, (valChild) => printer(valChild, config, indentation, depth, refs), (str) => {
      const indentationNext = indentation + config.indent;
      return indentationNext + str.replaceAll(NEWLINE_REGEXP, `
${indentationNext}`);
    }, {
      edgeSpacing: config.spacingOuter,
      min: config.min,
      spacing: config.spacingInner
    }, config.colors);
  } catch (error) {
    throw new PrettyFormatPluginError(error.message, error.stack);
  }
  if (typeof printed !== "string") {
    throw new TypeError(`pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`);
  }
  return printed;
}
__name(printPlugin, "printPlugin");
function findPlugin(plugins2, val) {
  for (const plugin2 of plugins2) {
    try {
      if (plugin2.test(val)) {
        return plugin2;
      }
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }
  return null;
}
__name(findPlugin, "findPlugin");
function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin2 = findPlugin(config.plugins, val);
  if (plugin2 !== null) {
    return printPlugin(plugin2, val, config, indentation, depth, refs);
  }
  const basicResult = printBasicValue(val, config.printFunctionName, config.escapeRegex, config.escapeString);
  if (basicResult !== null) {
    return basicResult;
  }
  return printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON);
}
__name(printer, "printer");
var DEFAULT_THEME = {
  comment: "gray",
  content: "reset",
  prop: "yellow",
  tag: "cyan",
  value: "green"
};
var DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
var DEFAULT_OPTIONS = {
  callToJSON: true,
  compareKeys: void 0,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Number.POSITIVE_INFINITY,
  maxWidth: Number.POSITIVE_INFINITY,
  min: false,
  plugins: [],
  printBasicPrototype: true,
  printFunctionName: true,
  theme: DEFAULT_THEME
};
function validateOptions(options) {
  for (const key of Object.keys(options)) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_OPTIONS, key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  }
  if (options.min && options.indent !== void 0 && options.indent !== 0) {
    throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
  }
}
__name(validateOptions, "validateOptions");
function getColorsHighlight() {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = DEFAULT_THEME[key];
    const color = value && s[value];
    if (color && typeof color.close === "string" && typeof color.open === "string") {
      colors[key] = color;
    } else {
      throw new Error(`pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`);
    }
    return colors;
  }, /* @__PURE__ */ Object.create(null));
}
__name(getColorsHighlight, "getColorsHighlight");
function getColorsEmpty() {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = {
      close: "",
      open: ""
    };
    return colors;
  }, /* @__PURE__ */ Object.create(null));
}
__name(getColorsEmpty, "getColorsEmpty");
function getPrintFunctionName(options) {
  return (options === null || options === void 0 ? void 0 : options.printFunctionName) ?? DEFAULT_OPTIONS.printFunctionName;
}
__name(getPrintFunctionName, "getPrintFunctionName");
function getEscapeRegex(options) {
  return (options === null || options === void 0 ? void 0 : options.escapeRegex) ?? DEFAULT_OPTIONS.escapeRegex;
}
__name(getEscapeRegex, "getEscapeRegex");
function getEscapeString(options) {
  return (options === null || options === void 0 ? void 0 : options.escapeString) ?? DEFAULT_OPTIONS.escapeString;
}
__name(getEscapeString, "getEscapeString");
function getConfig(options) {
  return {
    callToJSON: (options === null || options === void 0 ? void 0 : options.callToJSON) ?? DEFAULT_OPTIONS.callToJSON,
    colors: (options === null || options === void 0 ? void 0 : options.highlight) ? getColorsHighlight() : getColorsEmpty(),
    compareKeys: typeof (options === null || options === void 0 ? void 0 : options.compareKeys) === "function" || (options === null || options === void 0 ? void 0 : options.compareKeys) === null ? options.compareKeys : DEFAULT_OPTIONS.compareKeys,
    escapeRegex: getEscapeRegex(options),
    escapeString: getEscapeString(options),
    indent: (options === null || options === void 0 ? void 0 : options.min) ? "" : createIndent((options === null || options === void 0 ? void 0 : options.indent) ?? DEFAULT_OPTIONS.indent),
    maxDepth: (options === null || options === void 0 ? void 0 : options.maxDepth) ?? DEFAULT_OPTIONS.maxDepth,
    maxWidth: (options === null || options === void 0 ? void 0 : options.maxWidth) ?? DEFAULT_OPTIONS.maxWidth,
    min: (options === null || options === void 0 ? void 0 : options.min) ?? DEFAULT_OPTIONS.min,
    plugins: (options === null || options === void 0 ? void 0 : options.plugins) ?? DEFAULT_OPTIONS.plugins,
    printBasicPrototype: (options === null || options === void 0 ? void 0 : options.printBasicPrototype) ?? true,
    printFunctionName: getPrintFunctionName(options),
    spacingInner: (options === null || options === void 0 ? void 0 : options.min) ? " " : "\n",
    spacingOuter: (options === null || options === void 0 ? void 0 : options.min) ? "" : "\n"
  };
}
__name(getConfig, "getConfig");
function createIndent(indent) {
  return Array.from({ length: indent + 1 }).join(" ");
}
__name(createIndent, "createIndent");
function format(val, options) {
  if (options) {
    validateOptions(options);
    if (options.plugins) {
      const plugin2 = findPlugin(options.plugins, val);
      if (plugin2 !== null) {
        return printPlugin(plugin2, val, getConfig(options), "", 0, []);
      }
    }
  }
  const basicResult = printBasicValue(val, getPrintFunctionName(options), getEscapeRegex(options), getEscapeString(options));
  if (basicResult !== null) {
    return basicResult;
  }
  return printComplexValue(val, getConfig(options), "", 0, []);
}
__name(format, "format");
var plugins = {
  AsymmetricMatcher: plugin$5,
  DOMCollection: plugin$4,
  DOMElement: plugin$3,
  Immutable: plugin$2,
  ReactElement: plugin$1,
  ReactTestComponent: plugin,
  Error: ErrorPlugin
};

// ../node_modules/loupe/lib/helpers.js
var ansiColors = {
  bold: ["1", "22"],
  dim: ["2", "22"],
  italic: ["3", "23"],
  underline: ["4", "24"],
  // 5 & 6 are blinking
  inverse: ["7", "27"],
  hidden: ["8", "28"],
  strike: ["9", "29"],
  // 10-20 are fonts
  // 21-29 are resets for 1-9
  black: ["30", "39"],
  red: ["31", "39"],
  green: ["32", "39"],
  yellow: ["33", "39"],
  blue: ["34", "39"],
  magenta: ["35", "39"],
  cyan: ["36", "39"],
  white: ["37", "39"],
  brightblack: ["30;1", "39"],
  brightred: ["31;1", "39"],
  brightgreen: ["32;1", "39"],
  brightyellow: ["33;1", "39"],
  brightblue: ["34;1", "39"],
  brightmagenta: ["35;1", "39"],
  brightcyan: ["36;1", "39"],
  brightwhite: ["37;1", "39"],
  grey: ["90", "39"]
};
var styles = {
  special: "cyan",
  number: "yellow",
  bigint: "yellow",
  boolean: "yellow",
  undefined: "grey",
  null: "bold",
  string: "green",
  symbol: "green",
  date: "magenta",
  regexp: "red"
};
var truncator = "\u2026";
function colorise(value, styleType) {
  const color = ansiColors[styles[styleType]] || ansiColors[styleType] || "";
  if (!color) {
    return String(value);
  }
  return `\x1B[${color[0]}m${String(value)}\x1B[${color[1]}m`;
}
__name(colorise, "colorise");
function normaliseOptions({
  showHidden = false,
  depth = 2,
  colors = false,
  customInspect = true,
  showProxy = false,
  maxArrayLength = Infinity,
  breakLength = Infinity,
  seen = [],
  // eslint-disable-next-line no-shadow
  truncate: truncate2 = Infinity,
  stylize = String
} = {}, inspect3) {
  const options = {
    showHidden: Boolean(showHidden),
    depth: Number(depth),
    colors: Boolean(colors),
    customInspect: Boolean(customInspect),
    showProxy: Boolean(showProxy),
    maxArrayLength: Number(maxArrayLength),
    breakLength: Number(breakLength),
    truncate: Number(truncate2),
    seen,
    inspect: inspect3,
    stylize
  };
  if (options.colors) {
    options.stylize = colorise;
  }
  return options;
}
__name(normaliseOptions, "normaliseOptions");
function isHighSurrogate(char) {
  return char >= "\uD800" && char <= "\uDBFF";
}
__name(isHighSurrogate, "isHighSurrogate");
function truncate(string, length, tail = truncator) {
  string = String(string);
  const tailLength = tail.length;
  const stringLength = string.length;
  if (tailLength > length && stringLength > tailLength) {
    return tail;
  }
  if (stringLength > length && stringLength > tailLength) {
    let end = length - tailLength;
    if (end > 0 && isHighSurrogate(string[end - 1])) {
      end = end - 1;
    }
    return `${string.slice(0, end)}${tail}`;
  }
  return string;
}
__name(truncate, "truncate");
function inspectList(list, options, inspectItem, separator = ", ") {
  inspectItem = inspectItem || options.inspect;
  const size = list.length;
  if (size === 0)
    return "";
  const originalLength = options.truncate;
  let output = "";
  let peek = "";
  let truncated = "";
  for (let i = 0; i < size; i += 1) {
    const last = i + 1 === list.length;
    const secondToLast = i + 2 === list.length;
    truncated = `${truncator}(${list.length - i})`;
    const value = list[i];
    options.truncate = originalLength - output.length - (last ? 0 : separator.length);
    const string = peek || inspectItem(value, options) + (last ? "" : separator);
    const nextLength = output.length + string.length;
    const truncatedLength = nextLength + truncated.length;
    if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
      break;
    }
    if (!last && !secondToLast && truncatedLength > originalLength) {
      break;
    }
    peek = last ? "" : inspectItem(list[i + 1], options) + (secondToLast ? "" : separator);
    if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
      break;
    }
    output += string;
    if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
      truncated = `${truncator}(${list.length - i - 1})`;
      break;
    }
    truncated = "";
  }
  return `${output}${truncated}`;
}
__name(inspectList, "inspectList");
function quoteComplexKey(key) {
  if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
    return key;
  }
  return JSON.stringify(key).replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
}
__name(quoteComplexKey, "quoteComplexKey");
function inspectProperty([key, value], options) {
  options.truncate -= 2;
  if (typeof key === "string") {
    key = quoteComplexKey(key);
  } else if (typeof key !== "number") {
    key = `[${options.inspect(key, options)}]`;
  }
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key}: ${value}`;
}
__name(inspectProperty, "inspectProperty");

// ../node_modules/loupe/lib/array.js
function inspectArray(array, options) {
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return "[]";
  options.truncate -= 4;
  const listContents = inspectList(array, options);
  options.truncate -= listContents.length;
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `[ ${listContents}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectArray, "inspectArray");

// ../node_modules/loupe/lib/typedarray.js
var getArrayName = /* @__PURE__ */ __name((array) => {
  if (typeof Buffer === "function" && array instanceof Buffer) {
    return "Buffer";
  }
  if (array[Symbol.toStringTag]) {
    return array[Symbol.toStringTag];
  }
  return array.constructor.name;
}, "getArrayName");
function inspectTypedArray(array, options) {
  const name = getArrayName(array);
  options.truncate -= name.length + 4;
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return `${name}[]`;
  let output = "";
  for (let i = 0; i < array.length; i++) {
    const string = `${options.stylize(truncate(array[i], options.truncate), "number")}${i === array.length - 1 ? "" : ", "}`;
    options.truncate -= string.length;
    if (array[i] !== array.length && options.truncate <= 3) {
      output += `${truncator}(${array.length - array[i] + 1})`;
      break;
    }
    output += string;
  }
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `${name}[ ${output}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectTypedArray, "inspectTypedArray");

// ../node_modules/loupe/lib/date.js
function inspectDate(dateObject, options) {
  const stringRepresentation = dateObject.toJSON();
  if (stringRepresentation === null) {
    return "Invalid Date";
  }
  const split = stringRepresentation.split("T");
  const date = split[0];
  return options.stylize(`${date}T${truncate(split[1], options.truncate - date.length - 1)}`, "date");
}
__name(inspectDate, "inspectDate");

// ../node_modules/loupe/lib/function.js
function inspectFunction(func, options) {
  const functionType = func[Symbol.toStringTag] || "Function";
  const name = func.name;
  if (!name) {
    return options.stylize(`[${functionType}]`, "special");
  }
  return options.stylize(`[${functionType} ${truncate(name, options.truncate - 11)}]`, "special");
}
__name(inspectFunction, "inspectFunction");

// ../node_modules/loupe/lib/map.js
function inspectMapEntry([key, value], options) {
  options.truncate -= 4;
  key = options.inspect(key, options);
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key} => ${value}`;
}
__name(inspectMapEntry, "inspectMapEntry");
function mapToEntries(map) {
  const entries = [];
  map.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
}
__name(mapToEntries, "mapToEntries");
function inspectMap(map, options) {
  if (map.size === 0)
    return "Map{}";
  options.truncate -= 7;
  return `Map{ ${inspectList(mapToEntries(map), options, inspectMapEntry)} }`;
}
__name(inspectMap, "inspectMap");

// ../node_modules/loupe/lib/number.js
var isNaN = Number.isNaN || ((i) => i !== i);
function inspectNumber(number, options) {
  if (isNaN(number)) {
    return options.stylize("NaN", "number");
  }
  if (number === Infinity) {
    return options.stylize("Infinity", "number");
  }
  if (number === -Infinity) {
    return options.stylize("-Infinity", "number");
  }
  if (number === 0) {
    return options.stylize(1 / number === Infinity ? "+0" : "-0", "number");
  }
  return options.stylize(truncate(String(number), options.truncate), "number");
}
__name(inspectNumber, "inspectNumber");

// ../node_modules/loupe/lib/bigint.js
function inspectBigInt(number, options) {
  let nums = truncate(number.toString(), options.truncate - 1);
  if (nums !== truncator)
    nums += "n";
  return options.stylize(nums, "bigint");
}
__name(inspectBigInt, "inspectBigInt");

// ../node_modules/loupe/lib/regexp.js
function inspectRegExp(value, options) {
  const flags = value.toString().split("/")[2];
  const sourceLength = options.truncate - (2 + flags.length);
  const source = value.source;
  return options.stylize(`/${truncate(source, sourceLength)}/${flags}`, "regexp");
}
__name(inspectRegExp, "inspectRegExp");

// ../node_modules/loupe/lib/set.js
function arrayFromSet(set) {
  const values = [];
  set.forEach((value) => {
    values.push(value);
  });
  return values;
}
__name(arrayFromSet, "arrayFromSet");
function inspectSet(set, options) {
  if (set.size === 0)
    return "Set{}";
  options.truncate -= 7;
  return `Set{ ${inspectList(arrayFromSet(set), options)} }`;
}
__name(inspectSet, "inspectSet");

// ../node_modules/loupe/lib/string.js
var stringEscapeChars = new RegExp("['\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]", "g");
var escapeCharacters = {
  "\b": "\\b",
  "	": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  "'": "\\'",
  "\\": "\\\\"
};
var hex = 16;
var unicodeLength = 4;
function escape(char) {
  return escapeCharacters[char] || `\\u${`0000${char.charCodeAt(0).toString(hex)}`.slice(-unicodeLength)}`;
}
__name(escape, "escape");
function inspectString(string, options) {
  if (stringEscapeChars.test(string)) {
    string = string.replace(stringEscapeChars, escape);
  }
  return options.stylize(`'${truncate(string, options.truncate - 2)}'`, "string");
}
__name(inspectString, "inspectString");

// ../node_modules/loupe/lib/symbol.js
function inspectSymbol(value) {
  if ("description" in Symbol.prototype) {
    return value.description ? `Symbol(${value.description})` : "Symbol()";
  }
  return value.toString();
}
__name(inspectSymbol, "inspectSymbol");

// ../node_modules/loupe/lib/promise.js
var getPromiseValue = /* @__PURE__ */ __name(() => "Promise{\u2026}", "getPromiseValue");
var promise_default = getPromiseValue;

// ../node_modules/loupe/lib/object.js
function inspectObject(object, options) {
  const properties = Object.getOwnPropertyNames(object);
  const symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : [];
  if (properties.length === 0 && symbols.length === 0) {
    return "{}";
  }
  options.truncate -= 4;
  options.seen = options.seen || [];
  if (options.seen.includes(object)) {
    return "[Circular]";
  }
  options.seen.push(object);
  const propertyContents = inspectList(properties.map((key) => [key, object[key]]), options, inspectProperty);
  const symbolContents = inspectList(symbols.map((key) => [key, object[key]]), options, inspectProperty);
  options.seen.pop();
  let sep = "";
  if (propertyContents && symbolContents) {
    sep = ", ";
  }
  return `{ ${propertyContents}${sep}${symbolContents} }`;
}
__name(inspectObject, "inspectObject");

// ../node_modules/loupe/lib/class.js
var toStringTag = typeof Symbol !== "undefined" && Symbol.toStringTag ? Symbol.toStringTag : false;
function inspectClass(value, options) {
  let name = "";
  if (toStringTag && toStringTag in value) {
    name = value[toStringTag];
  }
  name = name || value.constructor.name;
  if (!name || name === "_class") {
    name = "<Anonymous Class>";
  }
  options.truncate -= name.length;
  return `${name}${inspectObject(value, options)}`;
}
__name(inspectClass, "inspectClass");

// ../node_modules/loupe/lib/arguments.js
function inspectArguments(args, options) {
  if (args.length === 0)
    return "Arguments[]";
  options.truncate -= 13;
  return `Arguments[ ${inspectList(args, options)} ]`;
}
__name(inspectArguments, "inspectArguments");

// ../node_modules/loupe/lib/error.js
var errorKeys = [
  "stack",
  "line",
  "column",
  "name",
  "message",
  "fileName",
  "lineNumber",
  "columnNumber",
  "number",
  "description",
  "cause"
];
function inspectObject2(error, options) {
  const properties = Object.getOwnPropertyNames(error).filter((key) => errorKeys.indexOf(key) === -1);
  const name = error.name;
  options.truncate -= name.length;
  let message = "";
  if (typeof error.message === "string") {
    message = truncate(error.message, options.truncate);
  } else {
    properties.unshift("message");
  }
  message = message ? `: ${message}` : "";
  options.truncate -= message.length + 5;
  options.seen = options.seen || [];
  if (options.seen.includes(error)) {
    return "[Circular]";
  }
  options.seen.push(error);
  const propertyContents = inspectList(properties.map((key) => [key, error[key]]), options, inspectProperty);
  return `${name}${message}${propertyContents ? ` { ${propertyContents} }` : ""}`;
}
__name(inspectObject2, "inspectObject");

// ../node_modules/loupe/lib/html.js
function inspectAttribute([key, value], options) {
  options.truncate -= 3;
  if (!value) {
    return `${options.stylize(String(key), "yellow")}`;
  }
  return `${options.stylize(String(key), "yellow")}=${options.stylize(`"${value}"`, "string")}`;
}
__name(inspectAttribute, "inspectAttribute");
function inspectNodeCollection(collection, options) {
  return inspectList(collection, options, inspectNode, "\n");
}
__name(inspectNodeCollection, "inspectNodeCollection");
function inspectNode(node, options) {
  switch (node.nodeType) {
    case 1:
      return inspectHTML(node, options);
    case 3:
      return options.inspect(node.data, options);
    default:
      return options.inspect(node, options);
  }
}
__name(inspectNode, "inspectNode");
function inspectHTML(element, options) {
  const properties = element.getAttributeNames();
  const name = element.tagName.toLowerCase();
  const head = options.stylize(`<${name}`, "special");
  const headClose = options.stylize(`>`, "special");
  const tail = options.stylize(`</${name}>`, "special");
  options.truncate -= name.length * 2 + 5;
  let propertyContents = "";
  if (properties.length > 0) {
    propertyContents += " ";
    propertyContents += inspectList(properties.map((key) => [key, element.getAttribute(key)]), options, inspectAttribute, " ");
  }
  options.truncate -= propertyContents.length;
  const truncate2 = options.truncate;
  let children = inspectNodeCollection(element.children, options);
  if (children && children.length > truncate2) {
    children = `${truncator}(${element.children.length})`;
  }
  return `${head}${propertyContents}${headClose}${children}${tail}`;
}
__name(inspectHTML, "inspectHTML");

// ../node_modules/loupe/lib/index.js
var symbolsSupported = typeof Symbol === "function" && typeof Symbol.for === "function";
var chaiInspect = symbolsSupported ? Symbol.for("chai/inspect") : "@@chai/inspect";
var nodeInspect = Symbol.for("nodejs.util.inspect.custom");
var constructorMap = /* @__PURE__ */ new WeakMap();
var stringTagMap = {};
var baseTypesMap = {
  undefined: /* @__PURE__ */ __name((value, options) => options.stylize("undefined", "undefined"), "undefined"),
  null: /* @__PURE__ */ __name((value, options) => options.stylize("null", "null"), "null"),
  boolean: /* @__PURE__ */ __name((value, options) => options.stylize(String(value), "boolean"), "boolean"),
  Boolean: /* @__PURE__ */ __name((value, options) => options.stylize(String(value), "boolean"), "Boolean"),
  number: inspectNumber,
  Number: inspectNumber,
  bigint: inspectBigInt,
  BigInt: inspectBigInt,
  string: inspectString,
  String: inspectString,
  function: inspectFunction,
  Function: inspectFunction,
  symbol: inspectSymbol,
  // A Symbol polyfill will return `Symbol` not `symbol` from typedetect
  Symbol: inspectSymbol,
  Array: inspectArray,
  Date: inspectDate,
  Map: inspectMap,
  Set: inspectSet,
  RegExp: inspectRegExp,
  Promise: promise_default,
  // WeakSet, WeakMap are totally opaque to us
  WeakSet: /* @__PURE__ */ __name((value, options) => options.stylize("WeakSet{\u2026}", "special"), "WeakSet"),
  WeakMap: /* @__PURE__ */ __name((value, options) => options.stylize("WeakMap{\u2026}", "special"), "WeakMap"),
  Arguments: inspectArguments,
  Int8Array: inspectTypedArray,
  Uint8Array: inspectTypedArray,
  Uint8ClampedArray: inspectTypedArray,
  Int16Array: inspectTypedArray,
  Uint16Array: inspectTypedArray,
  Int32Array: inspectTypedArray,
  Uint32Array: inspectTypedArray,
  Float32Array: inspectTypedArray,
  Float64Array: inspectTypedArray,
  Generator: /* @__PURE__ */ __name(() => "", "Generator"),
  DataView: /* @__PURE__ */ __name(() => "", "DataView"),
  ArrayBuffer: /* @__PURE__ */ __name(() => "", "ArrayBuffer"),
  Error: inspectObject2,
  HTMLCollection: inspectNodeCollection,
  NodeList: inspectNodeCollection
};
var inspectCustom = /* @__PURE__ */ __name((value, options, type, inspectFn) => {
  if (chaiInspect in value && typeof value[chaiInspect] === "function") {
    return value[chaiInspect](options);
  }
  if (nodeInspect in value && typeof value[nodeInspect] === "function") {
    return value[nodeInspect](options.depth, options, inspectFn);
  }
  if ("inspect" in value && typeof value.inspect === "function") {
    return value.inspect(options.depth, options);
  }
  if ("constructor" in value && constructorMap.has(value.constructor)) {
    return constructorMap.get(value.constructor)(value, options);
  }
  if (stringTagMap[type]) {
    return stringTagMap[type](value, options);
  }
  return "";
}, "inspectCustom");
var toString2 = Object.prototype.toString;
function inspect(value, opts = {}) {
  const options = normaliseOptions(opts, inspect);
  const { customInspect } = options;
  let type = value === null ? "null" : typeof value;
  if (type === "object") {
    type = toString2.call(value).slice(8, -1);
  }
  if (type in baseTypesMap) {
    return baseTypesMap[type](value, options);
  }
  if (customInspect && value) {
    const output = inspectCustom(value, options, type, inspect);
    if (output) {
      if (typeof output === "string")
        return output;
      return inspect(output, options);
    }
  }
  const proto = value ? Object.getPrototypeOf(value) : false;
  if (proto === Object.prototype || proto === null) {
    return inspectObject(value, options);
  }
  if (value && typeof HTMLElement === "function" && value instanceof HTMLElement) {
    return inspectHTML(value, options);
  }
  if ("constructor" in value) {
    if (value.constructor !== Object) {
      return inspectClass(value, options);
    }
    return inspectObject(value, options);
  }
  if (value === Object(value)) {
    return inspectObject(value, options);
  }
  return options.stylize(String(value), type);
}
__name(inspect, "inspect");

// ../node_modules/@vitest/utils/dist/chunk-_commonjsHelpers.js
var { AsymmetricMatcher, DOMCollection, DOMElement, Immutable, ReactElement, ReactTestComponent } = plugins;
var PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher
];
function stringify(object, maxDepth = 10, { maxLength, ...options } = {}) {
  const MAX_LENGTH = maxLength ?? 1e4;
  let result;
  try {
    result = format(object, {
      maxDepth,
      escapeString: false,
      plugins: PLUGINS,
      ...options
    });
  } catch {
    result = format(object, {
      callToJSON: false,
      maxDepth,
      escapeString: false,
      plugins: PLUGINS,
      ...options
    });
  }
  return result.length >= MAX_LENGTH && maxDepth > 1 ? stringify(object, Math.floor(Math.min(maxDepth, Number.MAX_SAFE_INTEGER) / 2), {
    maxLength,
    ...options
  }) : result;
}
__name(stringify, "stringify");
var formatRegExp = /%[sdjifoOc%]/g;
function format2(...args) {
  if (typeof args[0] !== "string") {
    const objects = [];
    for (let i2 = 0; i2 < args.length; i2++) {
      objects.push(inspect2(args[i2], {
        depth: 0,
        colors: false
      }));
    }
    return objects.join(" ");
  }
  const len = args.length;
  let i = 1;
  const template = args[0];
  let str = String(template).replace(formatRegExp, (x) => {
    if (x === "%%") {
      return "%";
    }
    if (i >= len) {
      return x;
    }
    switch (x) {
      case "%s": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        if (typeof value === "number" && value === 0 && 1 / value < 0) {
          return "-0";
        }
        if (typeof value === "object" && value !== null) {
          if (typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
            return value.toString();
          }
          return inspect2(value, {
            depth: 0,
            colors: false
          });
        }
        return String(value);
      }
      case "%d": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        return Number(value).toString();
      }
      case "%i": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        return Number.parseInt(String(value)).toString();
      }
      case "%f":
        return Number.parseFloat(String(args[i++])).toString();
      case "%o":
        return inspect2(args[i++], {
          showHidden: true,
          showProxy: true
        });
      case "%O":
        return inspect2(args[i++]);
      case "%c": {
        i++;
        return "";
      }
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (err) {
          const m2 = err.message;
          if (m2.includes("circular structure") || m2.includes("cyclic structures") || m2.includes("cyclic object")) {
            return "[Circular]";
          }
          throw err;
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== "object") {
      str += ` ${x}`;
    } else {
      str += ` ${inspect2(x)}`;
    }
  }
  return str;
}
__name(format2, "format");
function inspect2(obj, options = {}) {
  if (options.truncate === 0) {
    options.truncate = Number.POSITIVE_INFINITY;
  }
  return inspect(obj, options);
}
__name(inspect2, "inspect");
function getDefaultExportFromCjs2(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
__name(getDefaultExportFromCjs2, "getDefaultExportFromCjs");

// ../node_modules/@vitest/utils/dist/helpers.js
function assertTypes(value, name, types) {
  const receivedType = typeof value;
  const pass = types.includes(receivedType);
  if (!pass) {
    throw new TypeError(`${name} value must be ${types.join(" or ")}, received "${receivedType}"`);
  }
}
__name(assertTypes, "assertTypes");
function isObject(item) {
  return item != null && typeof item === "object" && !Array.isArray(item);
}
__name(isObject, "isObject");
function isFinalObj(obj) {
  return obj === Object.prototype || obj === Function.prototype || obj === RegExp.prototype;
}
__name(isFinalObj, "isFinalObj");
function getType2(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}
__name(getType2, "getType");
function collectOwnProperties(obj, collector) {
  const collect = typeof collector === "function" ? collector : (key) => collector.add(key);
  Object.getOwnPropertyNames(obj).forEach(collect);
  Object.getOwnPropertySymbols(obj).forEach(collect);
}
__name(collectOwnProperties, "collectOwnProperties");
function getOwnProperties(obj) {
  const ownProps = /* @__PURE__ */ new Set();
  if (isFinalObj(obj)) {
    return [];
  }
  collectOwnProperties(obj, ownProps);
  return Array.from(ownProps);
}
__name(getOwnProperties, "getOwnProperties");
var defaultCloneOptions = { forceWritable: false };
function deepClone(val, options = defaultCloneOptions) {
  const seen = /* @__PURE__ */ new WeakMap();
  return clone(val, seen, options);
}
__name(deepClone, "deepClone");
function clone(val, seen, options = defaultCloneOptions) {
  let k, out;
  if (seen.has(val)) {
    return seen.get(val);
  }
  if (Array.isArray(val)) {
    out = Array.from({ length: k = val.length });
    seen.set(val, out);
    while (k--) {
      out[k] = clone(val[k], seen, options);
    }
    return out;
  }
  if (Object.prototype.toString.call(val) === "[object Object]") {
    out = Object.create(Object.getPrototypeOf(val));
    seen.set(val, out);
    const props = getOwnProperties(val);
    for (const k2 of props) {
      const descriptor = Object.getOwnPropertyDescriptor(val, k2);
      if (!descriptor) {
        continue;
      }
      const cloned = clone(val[k2], seen, options);
      if (options.forceWritable) {
        Object.defineProperty(out, k2, {
          enumerable: descriptor.enumerable,
          configurable: true,
          writable: true,
          value: cloned
        });
      } else if ("get" in descriptor) {
        Object.defineProperty(out, k2, {
          ...descriptor,
          get() {
            return cloned;
          }
        });
      } else {
        Object.defineProperty(out, k2, {
          ...descriptor,
          value: cloned
        });
      }
    }
    return out;
  }
  return val;
}
__name(clone, "clone");
function noop() {
}
__name(noop, "noop");

// ../node_modules/@vitest/utils/dist/diff.js
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;
var _Diff = class _Diff {
  0;
  1;
  constructor(op, text) {
    this[0] = op;
    this[1] = text;
  }
};
__name(_Diff, "Diff");
var Diff = _Diff;
function diff_commonPrefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return 0;
  }
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
}
__name(diff_commonPrefix, "diff_commonPrefix");
function diff_commonSuffix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
    return 0;
  }
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
}
__name(diff_commonSuffix, "diff_commonSuffix");
function diff_commonOverlap_(text1, text2) {
  const text1_length = text1.length;
  const text2_length = text2.length;
  if (text1_length === 0 || text2_length === 0) {
    return 0;
  }
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  const text_length = Math.min(text1_length, text2_length);
  if (text1 === text2) {
    return text_length;
  }
  let best = 0;
  let length = 1;
  while (true) {
    const pattern = text1.substring(text_length - length);
    const found = text2.indexOf(pattern);
    if (found === -1) {
      return best;
    }
    length += found;
    if (found === 0 || text1.substring(text_length - length) === text2.substring(0, length)) {
      best = length;
      length++;
    }
  }
}
__name(diff_commonOverlap_, "diff_commonOverlap_");
function diff_cleanupSemantic(diffs) {
  let changes = false;
  const equalities = [];
  let equalitiesLength = 0;
  let lastEquality = null;
  let pointer = 0;
  let length_insertions1 = 0;
  let length_deletions1 = 0;
  let length_insertions2 = 0;
  let length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] === DIFF_EQUAL) {
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastEquality = diffs[pointer][1];
    } else {
      if (diffs[pointer][0] === DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      if (lastEquality && lastEquality.length <= Math.max(length_insertions1, length_deletions1) && lastEquality.length <= Math.max(length_insertions2, length_deletions2)) {
        diffs.splice(equalities[equalitiesLength - 1], 0, new Diff(DIFF_DELETE, lastEquality));
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastEquality = null;
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) {
    diff_cleanupMerge(diffs);
  }
  diff_cleanupSemanticLossless(diffs);
  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
      const deletion = diffs[pointer - 1][1];
      const insertion = diffs[pointer][1];
      const overlap_length1 = diff_commonOverlap_(deletion, insertion);
      const overlap_length2 = diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
          diffs.splice(pointer, 0, new Diff(DIFF_EQUAL, insertion.substring(0, overlap_length1)));
          diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
          diffs.splice(pointer, 0, new Diff(DIFF_EQUAL, deletion.substring(0, overlap_length2)));
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] = deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
}
__name(diff_cleanupSemantic, "diff_cleanupSemantic");
var nonAlphaNumericRegex_ = /[^a-z0-9]/i;
var whitespaceRegex_ = /\s/;
var linebreakRegex_ = /[\r\n]/;
var blanklineEndRegex_ = /\n\r?\n$/;
var blanklineStartRegex_ = /^\r?\n\r?\n/;
function diff_cleanupSemanticLossless(diffs) {
  let pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      let equality1 = diffs[pointer - 1][1];
      let edit = diffs[pointer][1];
      let equality2 = diffs[pointer + 1][1];
      const commonOffset = diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        const commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }
      let bestEquality1 = equality1;
      let bestEdit = edit;
      let bestEquality2 = equality2;
      let bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        const score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }
      if (diffs[pointer - 1][1] !== bestEquality1) {
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
}
__name(diff_cleanupSemanticLossless, "diff_cleanupSemanticLossless");
function diff_cleanupMerge(diffs) {
  diffs.push(new Diff(DIFF_EQUAL, ""));
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = "";
  let text_insert = "";
  let commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] === DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, new Diff(DIFF_EQUAL, text_insert.substring(0, commonlength)));
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length - commonlength);
              text_delete = text_delete.substring(0, text_delete.length - commonlength);
            }
          }
          pointer -= count_delete + count_insert;
          diffs.splice(pointer, count_delete + count_insert);
          if (text_delete.length) {
            diffs.splice(pointer, 0, new Diff(DIFF_DELETE, text_delete));
            pointer++;
          }
          if (text_insert.length) {
            diffs.splice(pointer, 0, new Diff(DIFF_INSERT, text_insert));
            pointer++;
          }
          pointer++;
        } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = "";
        text_insert = "";
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === "") {
    diffs.pop();
  }
  let changes = false;
  pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) {
    diff_cleanupMerge(diffs);
  }
}
__name(diff_cleanupMerge, "diff_cleanupMerge");
function diff_cleanupSemanticScore_(one, two) {
  if (!one || !two) {
    return 6;
  }
  const char1 = one.charAt(one.length - 1);
  const char2 = two.charAt(0);
  const nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
  const nonAlphaNumeric2 = char2.match(nonAlphaNumericRegex_);
  const whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
  const whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
  const lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
  const lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
  const blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
  const blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);
  if (blankLine1 || blankLine2) {
    return 5;
  } else if (lineBreak1 || lineBreak2) {
    return 4;
  } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
    return 3;
  } else if (whitespace1 || whitespace2) {
    return 2;
  } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
    return 1;
  }
  return 0;
}
__name(diff_cleanupSemanticScore_, "diff_cleanupSemanticScore_");
var NO_DIFF_MESSAGE = "Compared values have no visual difference.";
var SIMILAR_MESSAGE = "Compared values serialize to the same structure.\nPrinting internal object structure without calling `toJSON` instead.";
var build = {};
var hasRequiredBuild;
function requireBuild() {
  if (hasRequiredBuild) return build;
  hasRequiredBuild = 1;
  Object.defineProperty(build, "__esModule", {
    value: true
  });
  build.default = diffSequence;
  const pkg = "diff-sequences";
  const NOT_YET_SET = 0;
  const countCommonItemsF = /* @__PURE__ */ __name((aIndex, aEnd, bIndex, bEnd, isCommon) => {
    let nCommon = 0;
    while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
      aIndex += 1;
      bIndex += 1;
      nCommon += 1;
    }
    return nCommon;
  }, "countCommonItemsF");
  const countCommonItemsR = /* @__PURE__ */ __name((aStart, aIndex, bStart, bIndex, isCommon) => {
    let nCommon = 0;
    while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
      aIndex -= 1;
      bIndex -= 1;
      nCommon += 1;
    }
    return nCommon;
  }, "countCommonItemsR");
  const extendPathsF = /* @__PURE__ */ __name((d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF) => {
    let iF = 0;
    let kF = -d;
    let aFirst = aIndexesF[iF];
    let aIndexPrev1 = aFirst;
    aIndexesF[iF] += countCommonItemsF(
      aFirst + 1,
      aEnd,
      bF + aFirst - kF + 1,
      bEnd,
      isCommon
    );
    const nF = d < iMaxF ? d : iMaxF;
    for (iF += 1, kF += 2; iF <= nF; iF += 1, kF += 2) {
      if (iF !== d && aIndexPrev1 < aIndexesF[iF]) {
        aFirst = aIndexesF[iF];
      } else {
        aFirst = aIndexPrev1 + 1;
        if (aEnd <= aFirst) {
          return iF - 1;
        }
      }
      aIndexPrev1 = aIndexesF[iF];
      aIndexesF[iF] = aFirst + countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);
    }
    return iMaxF;
  }, "extendPathsF");
  const extendPathsR = /* @__PURE__ */ __name((d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR) => {
    let iR = 0;
    let kR = d;
    let aFirst = aIndexesR[iR];
    let aIndexPrev1 = aFirst;
    aIndexesR[iR] -= countCommonItemsR(
      aStart,
      aFirst - 1,
      bStart,
      bR + aFirst - kR - 1,
      isCommon
    );
    const nR = d < iMaxR ? d : iMaxR;
    for (iR += 1, kR -= 2; iR <= nR; iR += 1, kR -= 2) {
      if (iR !== d && aIndexesR[iR] < aIndexPrev1) {
        aFirst = aIndexesR[iR];
      } else {
        aFirst = aIndexPrev1 - 1;
        if (aFirst < aStart) {
          return iR - 1;
        }
      }
      aIndexPrev1 = aIndexesR[iR];
      aIndexesR[iR] = aFirst - countCommonItemsR(
        aStart,
        aFirst - 1,
        bStart,
        bR + aFirst - kR - 1,
        isCommon
      );
    }
    return iMaxR;
  }, "extendPathsR");
  const extendOverlappablePathsF = /* @__PURE__ */ __name((d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
    const bF = bStart - aStart;
    const aLength = aEnd - aStart;
    const bLength = bEnd - bStart;
    const baDeltaLength = bLength - aLength;
    const kMinOverlapF = -baDeltaLength - (d - 1);
    const kMaxOverlapF = -baDeltaLength + (d - 1);
    let aIndexPrev1 = NOT_YET_SET;
    const nF = d < iMaxF ? d : iMaxF;
    for (let iF = 0, kF = -d; iF <= nF; iF += 1, kF += 2) {
      const insert = iF === 0 || iF !== d && aIndexPrev1 < aIndexesF[iF];
      const aLastPrev = insert ? aIndexesF[iF] : aIndexPrev1;
      const aFirst = insert ? aLastPrev : aLastPrev + 1;
      const bFirst = bF + aFirst - kF;
      const nCommonF = countCommonItemsF(
        aFirst + 1,
        aEnd,
        bFirst + 1,
        bEnd,
        isCommon
      );
      const aLast = aFirst + nCommonF;
      aIndexPrev1 = aIndexesF[iF];
      aIndexesF[iF] = aLast;
      if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
        const iR = (d - 1 - (kF + baDeltaLength)) / 2;
        if (iR <= iMaxR && aIndexesR[iR] - 1 <= aLast) {
          const bLastPrev = bF + aLastPrev - (insert ? kF + 1 : kF - 1);
          const nCommonR = countCommonItemsR(
            aStart,
            aLastPrev,
            bStart,
            bLastPrev,
            isCommon
          );
          const aIndexPrevFirst = aLastPrev - nCommonR;
          const bIndexPrevFirst = bLastPrev - nCommonR;
          const aEndPreceding = aIndexPrevFirst + 1;
          const bEndPreceding = bIndexPrevFirst + 1;
          division.nChangePreceding = d - 1;
          if (d - 1 === aEndPreceding + bEndPreceding - aStart - bStart) {
            division.aEndPreceding = aStart;
            division.bEndPreceding = bStart;
          } else {
            division.aEndPreceding = aEndPreceding;
            division.bEndPreceding = bEndPreceding;
          }
          division.nCommonPreceding = nCommonR;
          if (nCommonR !== 0) {
            division.aCommonPreceding = aEndPreceding;
            division.bCommonPreceding = bEndPreceding;
          }
          division.nCommonFollowing = nCommonF;
          if (nCommonF !== 0) {
            division.aCommonFollowing = aFirst + 1;
            division.bCommonFollowing = bFirst + 1;
          }
          const aStartFollowing = aLast + 1;
          const bStartFollowing = bFirst + nCommonF + 1;
          division.nChangeFollowing = d - 1;
          if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
            division.aStartFollowing = aEnd;
            division.bStartFollowing = bEnd;
          } else {
            division.aStartFollowing = aStartFollowing;
            division.bStartFollowing = bStartFollowing;
          }
          return true;
        }
      }
    }
    return false;
  }, "extendOverlappablePathsF");
  const extendOverlappablePathsR = /* @__PURE__ */ __name((d, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, iMaxF, aIndexesR, iMaxR, division) => {
    const bR = bEnd - aEnd;
    const aLength = aEnd - aStart;
    const bLength = bEnd - bStart;
    const baDeltaLength = bLength - aLength;
    const kMinOverlapR = baDeltaLength - d;
    const kMaxOverlapR = baDeltaLength + d;
    let aIndexPrev1 = NOT_YET_SET;
    const nR = d < iMaxR ? d : iMaxR;
    for (let iR = 0, kR = d; iR <= nR; iR += 1, kR -= 2) {
      const insert = iR === 0 || iR !== d && aIndexesR[iR] < aIndexPrev1;
      const aLastPrev = insert ? aIndexesR[iR] : aIndexPrev1;
      const aFirst = insert ? aLastPrev : aLastPrev - 1;
      const bFirst = bR + aFirst - kR;
      const nCommonR = countCommonItemsR(
        aStart,
        aFirst - 1,
        bStart,
        bFirst - 1,
        isCommon
      );
      const aLast = aFirst - nCommonR;
      aIndexPrev1 = aIndexesR[iR];
      aIndexesR[iR] = aLast;
      if (kMinOverlapR <= kR && kR <= kMaxOverlapR) {
        const iF = (d + (kR - baDeltaLength)) / 2;
        if (iF <= iMaxF && aLast - 1 <= aIndexesF[iF]) {
          const bLast = bFirst - nCommonR;
          division.nChangePreceding = d;
          if (d === aLast + bLast - aStart - bStart) {
            division.aEndPreceding = aStart;
            division.bEndPreceding = bStart;
          } else {
            division.aEndPreceding = aLast;
            division.bEndPreceding = bLast;
          }
          division.nCommonPreceding = nCommonR;
          if (nCommonR !== 0) {
            division.aCommonPreceding = aLast;
            division.bCommonPreceding = bLast;
          }
          division.nChangeFollowing = d - 1;
          if (d === 1) {
            division.nCommonFollowing = 0;
            division.aStartFollowing = aEnd;
            division.bStartFollowing = bEnd;
          } else {
            const bLastPrev = bR + aLastPrev - (insert ? kR - 1 : kR + 1);
            const nCommonF = countCommonItemsF(
              aLastPrev,
              aEnd,
              bLastPrev,
              bEnd,
              isCommon
            );
            division.nCommonFollowing = nCommonF;
            if (nCommonF !== 0) {
              division.aCommonFollowing = aLastPrev;
              division.bCommonFollowing = bLastPrev;
            }
            const aStartFollowing = aLastPrev + nCommonF;
            const bStartFollowing = bLastPrev + nCommonF;
            if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
              division.aStartFollowing = aEnd;
              division.bStartFollowing = bEnd;
            } else {
              division.aStartFollowing = aStartFollowing;
              division.bStartFollowing = bStartFollowing;
            }
          }
          return true;
        }
      }
    }
    return false;
  }, "extendOverlappablePathsR");
  const divide = /* @__PURE__ */ __name((nChange, aStart, aEnd, bStart, bEnd, isCommon, aIndexesF, aIndexesR, division) => {
    const bF = bStart - aStart;
    const bR = bEnd - aEnd;
    const aLength = aEnd - aStart;
    const bLength = bEnd - bStart;
    const baDeltaLength = bLength - aLength;
    let iMaxF = aLength;
    let iMaxR = aLength;
    aIndexesF[0] = aStart - 1;
    aIndexesR[0] = aEnd;
    if (baDeltaLength % 2 === 0) {
      const dMin = (nChange || baDeltaLength) / 2;
      const dMax = (aLength + bLength) / 2;
      for (let d = 1; d <= dMax; d += 1) {
        iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
        if (d < dMin) {
          iMaxR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
        } else if (
          // If a reverse path overlaps a forward path in the same diagonal,
          // return a division of the index intervals at the middle change.
          extendOverlappablePathsR(
            d,
            aStart,
            aEnd,
            bStart,
            bEnd,
            isCommon,
            aIndexesF,
            iMaxF,
            aIndexesR,
            iMaxR,
            division
          )
        ) {
          return;
        }
      }
    } else {
      const dMin = ((nChange || baDeltaLength) + 1) / 2;
      const dMax = (aLength + bLength + 1) / 2;
      let d = 1;
      iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
      for (d += 1; d <= dMax; d += 1) {
        iMaxR = extendPathsR(
          d - 1,
          aStart,
          bStart,
          bR,
          isCommon,
          aIndexesR,
          iMaxR
        );
        if (d < dMin) {
          iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
        } else if (
          // If a forward path overlaps a reverse path in the same diagonal,
          // return a division of the index intervals at the middle change.
          extendOverlappablePathsF(
            d,
            aStart,
            aEnd,
            bStart,
            bEnd,
            isCommon,
            aIndexesF,
            iMaxF,
            aIndexesR,
            iMaxR,
            division
          )
        ) {
          return;
        }
      }
    }
    throw new Error(
      `${pkg}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`
    );
  }, "divide");
  const findSubsequences = /* @__PURE__ */ __name((nChange, aStart, aEnd, bStart, bEnd, transposed, callbacks, aIndexesF, aIndexesR, division) => {
    if (bEnd - bStart < aEnd - aStart) {
      transposed = !transposed;
      if (transposed && callbacks.length === 1) {
        const { foundSubsequence: foundSubsequence2, isCommon: isCommon2 } = callbacks[0];
        callbacks[1] = {
          foundSubsequence: /* @__PURE__ */ __name((nCommon, bCommon, aCommon) => {
            foundSubsequence2(nCommon, aCommon, bCommon);
          }, "foundSubsequence"),
          isCommon: /* @__PURE__ */ __name((bIndex, aIndex) => isCommon2(aIndex, bIndex), "isCommon")
        };
      }
      const tStart = aStart;
      const tEnd = aEnd;
      aStart = bStart;
      aEnd = bEnd;
      bStart = tStart;
      bEnd = tEnd;
    }
    const { foundSubsequence, isCommon } = callbacks[transposed ? 1 : 0];
    divide(
      nChange,
      aStart,
      aEnd,
      bStart,
      bEnd,
      isCommon,
      aIndexesF,
      aIndexesR,
      division
    );
    const {
      nChangePreceding,
      aEndPreceding,
      bEndPreceding,
      nCommonPreceding,
      aCommonPreceding,
      bCommonPreceding,
      nCommonFollowing,
      aCommonFollowing,
      bCommonFollowing,
      nChangeFollowing,
      aStartFollowing,
      bStartFollowing
    } = division;
    if (aStart < aEndPreceding && bStart < bEndPreceding) {
      findSubsequences(
        nChangePreceding,
        aStart,
        aEndPreceding,
        bStart,
        bEndPreceding,
        transposed,
        callbacks,
        aIndexesF,
        aIndexesR,
        division
      );
    }
    if (nCommonPreceding !== 0) {
      foundSubsequence(nCommonPreceding, aCommonPreceding, bCommonPreceding);
    }
    if (nCommonFollowing !== 0) {
      foundSubsequence(nCommonFollowing, aCommonFollowing, bCommonFollowing);
    }
    if (aStartFollowing < aEnd && bStartFollowing < bEnd) {
      findSubsequences(
        nChangeFollowing,
        aStartFollowing,
        aEnd,
        bStartFollowing,
        bEnd,
        transposed,
        callbacks,
        aIndexesF,
        aIndexesR,
        division
      );
    }
  }, "findSubsequences");
  const validateLength = /* @__PURE__ */ __name((name, arg) => {
    if (typeof arg !== "number") {
      throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a number`);
    }
    if (!Number.isSafeInteger(arg)) {
      throw new RangeError(`${pkg}: ${name} value ${arg} is not a safe integer`);
    }
    if (arg < 0) {
      throw new RangeError(`${pkg}: ${name} value ${arg} is a negative integer`);
    }
  }, "validateLength");
  const validateCallback = /* @__PURE__ */ __name((name, arg) => {
    const type = typeof arg;
    if (type !== "function") {
      throw new TypeError(`${pkg}: ${name} typeof ${type} is not a function`);
    }
  }, "validateCallback");
  function diffSequence(aLength, bLength, isCommon, foundSubsequence) {
    validateLength("aLength", aLength);
    validateLength("bLength", bLength);
    validateCallback("isCommon", isCommon);
    validateCallback("foundSubsequence", foundSubsequence);
    const nCommonF = countCommonItemsF(0, aLength, 0, bLength, isCommon);
    if (nCommonF !== 0) {
      foundSubsequence(nCommonF, 0, 0);
    }
    if (aLength !== nCommonF || bLength !== nCommonF) {
      const aStart = nCommonF;
      const bStart = nCommonF;
      const nCommonR = countCommonItemsR(
        aStart,
        aLength - 1,
        bStart,
        bLength - 1,
        isCommon
      );
      const aEnd = aLength - nCommonR;
      const bEnd = bLength - nCommonR;
      const nCommonFR = nCommonF + nCommonR;
      if (aLength !== nCommonFR && bLength !== nCommonFR) {
        const nChange = 0;
        const transposed = false;
        const callbacks = [
          {
            foundSubsequence,
            isCommon
          }
        ];
        const aIndexesF = [NOT_YET_SET];
        const aIndexesR = [NOT_YET_SET];
        const division = {
          aCommonFollowing: NOT_YET_SET,
          aCommonPreceding: NOT_YET_SET,
          aEndPreceding: NOT_YET_SET,
          aStartFollowing: NOT_YET_SET,
          bCommonFollowing: NOT_YET_SET,
          bCommonPreceding: NOT_YET_SET,
          bEndPreceding: NOT_YET_SET,
          bStartFollowing: NOT_YET_SET,
          nChangeFollowing: NOT_YET_SET,
          nChangePreceding: NOT_YET_SET,
          nCommonFollowing: NOT_YET_SET,
          nCommonPreceding: NOT_YET_SET
        };
        findSubsequences(
          nChange,
          aStart,
          aEnd,
          bStart,
          bEnd,
          transposed,
          callbacks,
          aIndexesF,
          aIndexesR,
          division
        );
      }
      if (nCommonR !== 0) {
        foundSubsequence(nCommonR, aEnd, bEnd);
      }
    }
  }
  __name(diffSequence, "diffSequence");
  return build;
}
__name(requireBuild, "requireBuild");
var buildExports = requireBuild();
var diffSequences = getDefaultExportFromCjs2(buildExports);
function formatTrailingSpaces(line, trailingSpaceFormatter) {
  return line.replace(/\s+$/, (match) => trailingSpaceFormatter(match));
}
__name(formatTrailingSpaces, "formatTrailingSpaces");
function printDiffLine(line, isFirstOrLast, color, indicator, trailingSpaceFormatter, emptyFirstOrLastLinePlaceholder) {
  return line.length !== 0 ? color(`${indicator} ${formatTrailingSpaces(line, trailingSpaceFormatter)}`) : indicator !== " " ? color(indicator) : isFirstOrLast && emptyFirstOrLastLinePlaceholder.length !== 0 ? color(`${indicator} ${emptyFirstOrLastLinePlaceholder}`) : "";
}
__name(printDiffLine, "printDiffLine");
function printDeleteLine(line, isFirstOrLast, { aColor, aIndicator, changeLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder }) {
  return printDiffLine(line, isFirstOrLast, aColor, aIndicator, changeLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder);
}
__name(printDeleteLine, "printDeleteLine");
function printInsertLine(line, isFirstOrLast, { bColor, bIndicator, changeLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder }) {
  return printDiffLine(line, isFirstOrLast, bColor, bIndicator, changeLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder);
}
__name(printInsertLine, "printInsertLine");
function printCommonLine(line, isFirstOrLast, { commonColor, commonIndicator, commonLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder }) {
  return printDiffLine(line, isFirstOrLast, commonColor, commonIndicator, commonLineTrailingSpaceColor, emptyFirstOrLastLinePlaceholder);
}
__name(printCommonLine, "printCommonLine");
function createPatchMark(aStart, aEnd, bStart, bEnd, { patchColor }) {
  return patchColor(`@@ -${aStart + 1},${aEnd - aStart} +${bStart + 1},${bEnd - bStart} @@`);
}
__name(createPatchMark, "createPatchMark");
function joinAlignedDiffsNoExpand(diffs, options) {
  const iLength = diffs.length;
  const nContextLines = options.contextLines;
  const nContextLines2 = nContextLines + nContextLines;
  let jLength = iLength;
  let hasExcessAtStartOrEnd = false;
  let nExcessesBetweenChanges = 0;
  let i = 0;
  while (i !== iLength) {
    const iStart = i;
    while (i !== iLength && diffs[i][0] === DIFF_EQUAL) {
      i += 1;
    }
    if (iStart !== i) {
      if (iStart === 0) {
        if (i > nContextLines) {
          jLength -= i - nContextLines;
          hasExcessAtStartOrEnd = true;
        }
      } else if (i === iLength) {
        const n = i - iStart;
        if (n > nContextLines) {
          jLength -= n - nContextLines;
          hasExcessAtStartOrEnd = true;
        }
      } else {
        const n = i - iStart;
        if (n > nContextLines2) {
          jLength -= n - nContextLines2;
          nExcessesBetweenChanges += 1;
        }
      }
    }
    while (i !== iLength && diffs[i][0] !== DIFF_EQUAL) {
      i += 1;
    }
  }
  const hasPatch = nExcessesBetweenChanges !== 0 || hasExcessAtStartOrEnd;
  if (nExcessesBetweenChanges !== 0) {
    jLength += nExcessesBetweenChanges + 1;
  } else if (hasExcessAtStartOrEnd) {
    jLength += 1;
  }
  const jLast = jLength - 1;
  const lines = [];
  let jPatchMark = 0;
  if (hasPatch) {
    lines.push("");
  }
  let aStart = 0;
  let bStart = 0;
  let aEnd = 0;
  let bEnd = 0;
  const pushCommonLine = /* @__PURE__ */ __name((line) => {
    const j = lines.length;
    lines.push(printCommonLine(line, j === 0 || j === jLast, options));
    aEnd += 1;
    bEnd += 1;
  }, "pushCommonLine");
  const pushDeleteLine = /* @__PURE__ */ __name((line) => {
    const j = lines.length;
    lines.push(printDeleteLine(line, j === 0 || j === jLast, options));
    aEnd += 1;
  }, "pushDeleteLine");
  const pushInsertLine = /* @__PURE__ */ __name((line) => {
    const j = lines.length;
    lines.push(printInsertLine(line, j === 0 || j === jLast, options));
    bEnd += 1;
  }, "pushInsertLine");
  i = 0;
  while (i !== iLength) {
    let iStart = i;
    while (i !== iLength && diffs[i][0] === DIFF_EQUAL) {
      i += 1;
    }
    if (iStart !== i) {
      if (iStart === 0) {
        if (i > nContextLines) {
          iStart = i - nContextLines;
          aStart = iStart;
          bStart = iStart;
          aEnd = aStart;
          bEnd = bStart;
        }
        for (let iCommon = iStart; iCommon !== i; iCommon += 1) {
          pushCommonLine(diffs[iCommon][1]);
        }
      } else if (i === iLength) {
        const iEnd = i - iStart > nContextLines ? iStart + nContextLines : i;
        for (let iCommon = iStart; iCommon !== iEnd; iCommon += 1) {
          pushCommonLine(diffs[iCommon][1]);
        }
      } else {
        const nCommon = i - iStart;
        if (nCommon > nContextLines2) {
          const iEnd = iStart + nContextLines;
          for (let iCommon = iStart; iCommon !== iEnd; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
          lines[jPatchMark] = createPatchMark(aStart, aEnd, bStart, bEnd, options);
          jPatchMark = lines.length;
          lines.push("");
          const nOmit = nCommon - nContextLines2;
          aStart = aEnd + nOmit;
          bStart = bEnd + nOmit;
          aEnd = aStart;
          bEnd = bStart;
          for (let iCommon = i - nContextLines; iCommon !== i; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
        } else {
          for (let iCommon = iStart; iCommon !== i; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
        }
      }
    }
    while (i !== iLength && diffs[i][0] === DIFF_DELETE) {
      pushDeleteLine(diffs[i][1]);
      i += 1;
    }
    while (i !== iLength && diffs[i][0] === DIFF_INSERT) {
      pushInsertLine(diffs[i][1]);
      i += 1;
    }
  }
  if (hasPatch) {
    lines[jPatchMark] = createPatchMark(aStart, aEnd, bStart, bEnd, options);
  }
  return lines.join("\n");
}
__name(joinAlignedDiffsNoExpand, "joinAlignedDiffsNoExpand");
function joinAlignedDiffsExpand(diffs, options) {
  return diffs.map((diff2, i, diffs2) => {
    const line = diff2[1];
    const isFirstOrLast = i === 0 || i === diffs2.length - 1;
    switch (diff2[0]) {
      case DIFF_DELETE:
        return printDeleteLine(line, isFirstOrLast, options);
      case DIFF_INSERT:
        return printInsertLine(line, isFirstOrLast, options);
      default:
        return printCommonLine(line, isFirstOrLast, options);
    }
  }).join("\n");
}
__name(joinAlignedDiffsExpand, "joinAlignedDiffsExpand");
var noColor = /* @__PURE__ */ __name((string) => string, "noColor");
var DIFF_CONTEXT_DEFAULT = 5;
var DIFF_TRUNCATE_THRESHOLD_DEFAULT = 0;
function getDefaultOptions() {
  return {
    aAnnotation: "Expected",
    aColor: s.green,
    aIndicator: "-",
    bAnnotation: "Received",
    bColor: s.red,
    bIndicator: "+",
    changeColor: s.inverse,
    changeLineTrailingSpaceColor: noColor,
    commonColor: s.dim,
    commonIndicator: " ",
    commonLineTrailingSpaceColor: noColor,
    compareKeys: void 0,
    contextLines: DIFF_CONTEXT_DEFAULT,
    emptyFirstOrLastLinePlaceholder: "",
    expand: false,
    includeChangeCounts: false,
    omitAnnotationLines: false,
    patchColor: s.yellow,
    printBasicPrototype: false,
    truncateThreshold: DIFF_TRUNCATE_THRESHOLD_DEFAULT,
    truncateAnnotation: "... Diff result is truncated",
    truncateAnnotationColor: noColor
  };
}
__name(getDefaultOptions, "getDefaultOptions");
function getCompareKeys(compareKeys) {
  return compareKeys && typeof compareKeys === "function" ? compareKeys : void 0;
}
__name(getCompareKeys, "getCompareKeys");
function getContextLines(contextLines) {
  return typeof contextLines === "number" && Number.isSafeInteger(contextLines) && contextLines >= 0 ? contextLines : DIFF_CONTEXT_DEFAULT;
}
__name(getContextLines, "getContextLines");
function normalizeDiffOptions(options = {}) {
  return {
    ...getDefaultOptions(),
    ...options,
    compareKeys: getCompareKeys(options.compareKeys),
    contextLines: getContextLines(options.contextLines)
  };
}
__name(normalizeDiffOptions, "normalizeDiffOptions");
function isEmptyString(lines) {
  return lines.length === 1 && lines[0].length === 0;
}
__name(isEmptyString, "isEmptyString");
function countChanges(diffs) {
  let a2 = 0;
  let b = 0;
  diffs.forEach((diff2) => {
    switch (diff2[0]) {
      case DIFF_DELETE:
        a2 += 1;
        break;
      case DIFF_INSERT:
        b += 1;
        break;
    }
  });
  return {
    a: a2,
    b
  };
}
__name(countChanges, "countChanges");
function printAnnotation({ aAnnotation, aColor, aIndicator, bAnnotation, bColor, bIndicator, includeChangeCounts, omitAnnotationLines }, changeCounts) {
  if (omitAnnotationLines) {
    return "";
  }
  let aRest = "";
  let bRest = "";
  if (includeChangeCounts) {
    const aCount = String(changeCounts.a);
    const bCount = String(changeCounts.b);
    const baAnnotationLengthDiff = bAnnotation.length - aAnnotation.length;
    const aAnnotationPadding = " ".repeat(Math.max(0, baAnnotationLengthDiff));
    const bAnnotationPadding = " ".repeat(Math.max(0, -baAnnotationLengthDiff));
    const baCountLengthDiff = bCount.length - aCount.length;
    const aCountPadding = " ".repeat(Math.max(0, baCountLengthDiff));
    const bCountPadding = " ".repeat(Math.max(0, -baCountLengthDiff));
    aRest = `${aAnnotationPadding}  ${aIndicator} ${aCountPadding}${aCount}`;
    bRest = `${bAnnotationPadding}  ${bIndicator} ${bCountPadding}${bCount}`;
  }
  const a2 = `${aIndicator} ${aAnnotation}${aRest}`;
  const b = `${bIndicator} ${bAnnotation}${bRest}`;
  return `${aColor(a2)}
${bColor(b)}

`;
}
__name(printAnnotation, "printAnnotation");
function printDiffLines(diffs, truncated, options) {
  return printAnnotation(options, countChanges(diffs)) + (options.expand ? joinAlignedDiffsExpand(diffs, options) : joinAlignedDiffsNoExpand(diffs, options)) + (truncated ? options.truncateAnnotationColor(`
${options.truncateAnnotation}`) : "");
}
__name(printDiffLines, "printDiffLines");
function diffLinesUnified(aLines, bLines, options) {
  const normalizedOptions = normalizeDiffOptions(options);
  const [diffs, truncated] = diffLinesRaw(isEmptyString(aLines) ? [] : aLines, isEmptyString(bLines) ? [] : bLines, normalizedOptions);
  return printDiffLines(diffs, truncated, normalizedOptions);
}
__name(diffLinesUnified, "diffLinesUnified");
function diffLinesUnified2(aLinesDisplay, bLinesDisplay, aLinesCompare, bLinesCompare, options) {
  if (isEmptyString(aLinesDisplay) && isEmptyString(aLinesCompare)) {
    aLinesDisplay = [];
    aLinesCompare = [];
  }
  if (isEmptyString(bLinesDisplay) && isEmptyString(bLinesCompare)) {
    bLinesDisplay = [];
    bLinesCompare = [];
  }
  if (aLinesDisplay.length !== aLinesCompare.length || bLinesDisplay.length !== bLinesCompare.length) {
    return diffLinesUnified(aLinesDisplay, bLinesDisplay, options);
  }
  const [diffs, truncated] = diffLinesRaw(aLinesCompare, bLinesCompare, options);
  let aIndex = 0;
  let bIndex = 0;
  diffs.forEach((diff2) => {
    switch (diff2[0]) {
      case DIFF_DELETE:
        diff2[1] = aLinesDisplay[aIndex];
        aIndex += 1;
        break;
      case DIFF_INSERT:
        diff2[1] = bLinesDisplay[bIndex];
        bIndex += 1;
        break;
      default:
        diff2[1] = bLinesDisplay[bIndex];
        aIndex += 1;
        bIndex += 1;
    }
  });
  return printDiffLines(diffs, truncated, normalizeDiffOptions(options));
}
__name(diffLinesUnified2, "diffLinesUnified2");
function diffLinesRaw(aLines, bLines, options) {
  const truncate2 = (options === null || options === void 0 ? void 0 : options.truncateThreshold) ?? false;
  const truncateThreshold = Math.max(Math.floor((options === null || options === void 0 ? void 0 : options.truncateThreshold) ?? 0), 0);
  const aLength = truncate2 ? Math.min(aLines.length, truncateThreshold) : aLines.length;
  const bLength = truncate2 ? Math.min(bLines.length, truncateThreshold) : bLines.length;
  const truncated = aLength !== aLines.length || bLength !== bLines.length;
  const isCommon = /* @__PURE__ */ __name((aIndex2, bIndex2) => aLines[aIndex2] === bLines[bIndex2], "isCommon");
  const diffs = [];
  let aIndex = 0;
  let bIndex = 0;
  const foundSubsequence = /* @__PURE__ */ __name((nCommon, aCommon, bCommon) => {
    for (; aIndex !== aCommon; aIndex += 1) {
      diffs.push(new Diff(DIFF_DELETE, aLines[aIndex]));
    }
    for (; bIndex !== bCommon; bIndex += 1) {
      diffs.push(new Diff(DIFF_INSERT, bLines[bIndex]));
    }
    for (; nCommon !== 0; nCommon -= 1, aIndex += 1, bIndex += 1) {
      diffs.push(new Diff(DIFF_EQUAL, bLines[bIndex]));
    }
  }, "foundSubsequence");
  diffSequences(aLength, bLength, isCommon, foundSubsequence);
  for (; aIndex !== aLength; aIndex += 1) {
    diffs.push(new Diff(DIFF_DELETE, aLines[aIndex]));
  }
  for (; bIndex !== bLength; bIndex += 1) {
    diffs.push(new Diff(DIFF_INSERT, bLines[bIndex]));
  }
  return [diffs, truncated];
}
__name(diffLinesRaw, "diffLinesRaw");
function getType3(value) {
  if (value === void 0) {
    return "undefined";
  } else if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (typeof value === "function") {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "string") {
    return "string";
  } else if (typeof value === "bigint") {
    return "bigint";
  } else if (typeof value === "object") {
    if (value != null) {
      if (value.constructor === RegExp) {
        return "regexp";
      } else if (value.constructor === Map) {
        return "map";
      } else if (value.constructor === Set) {
        return "set";
      } else if (value.constructor === Date) {
        return "date";
      }
    }
    return "object";
  } else if (typeof value === "symbol") {
    return "symbol";
  }
  throw new Error(`value of unknown type: ${value}`);
}
__name(getType3, "getType");
function getNewLineSymbol(string) {
  return string.includes("\r\n") ? "\r\n" : "\n";
}
__name(getNewLineSymbol, "getNewLineSymbol");
function diffStrings(a2, b, options) {
  const truncate2 = (options === null || options === void 0 ? void 0 : options.truncateThreshold) ?? false;
  const truncateThreshold = Math.max(Math.floor((options === null || options === void 0 ? void 0 : options.truncateThreshold) ?? 0), 0);
  let aLength = a2.length;
  let bLength = b.length;
  if (truncate2) {
    const aMultipleLines = a2.includes("\n");
    const bMultipleLines = b.includes("\n");
    const aNewLineSymbol = getNewLineSymbol(a2);
    const bNewLineSymbol = getNewLineSymbol(b);
    const _a = aMultipleLines ? `${a2.split(aNewLineSymbol, truncateThreshold).join(aNewLineSymbol)}
` : a2;
    const _b = bMultipleLines ? `${b.split(bNewLineSymbol, truncateThreshold).join(bNewLineSymbol)}
` : b;
    aLength = _a.length;
    bLength = _b.length;
  }
  const truncated = aLength !== a2.length || bLength !== b.length;
  const isCommon = /* @__PURE__ */ __name((aIndex2, bIndex2) => a2[aIndex2] === b[bIndex2], "isCommon");
  let aIndex = 0;
  let bIndex = 0;
  const diffs = [];
  const foundSubsequence = /* @__PURE__ */ __name((nCommon, aCommon, bCommon) => {
    if (aIndex !== aCommon) {
      diffs.push(new Diff(DIFF_DELETE, a2.slice(aIndex, aCommon)));
    }
    if (bIndex !== bCommon) {
      diffs.push(new Diff(DIFF_INSERT, b.slice(bIndex, bCommon)));
    }
    aIndex = aCommon + nCommon;
    bIndex = bCommon + nCommon;
    diffs.push(new Diff(DIFF_EQUAL, b.slice(bCommon, bIndex)));
  }, "foundSubsequence");
  diffSequences(aLength, bLength, isCommon, foundSubsequence);
  if (aIndex !== aLength) {
    diffs.push(new Diff(DIFF_DELETE, a2.slice(aIndex)));
  }
  if (bIndex !== bLength) {
    diffs.push(new Diff(DIFF_INSERT, b.slice(bIndex)));
  }
  return [diffs, truncated];
}
__name(diffStrings, "diffStrings");
function concatenateRelevantDiffs(op, diffs, changeColor) {
  return diffs.reduce((reduced, diff2) => reduced + (diff2[0] === DIFF_EQUAL ? diff2[1] : diff2[0] === op && diff2[1].length !== 0 ? changeColor(diff2[1]) : ""), "");
}
__name(concatenateRelevantDiffs, "concatenateRelevantDiffs");
var _ChangeBuffer = class _ChangeBuffer {
  op;
  line;
  lines;
  changeColor;
  constructor(op, changeColor) {
    this.op = op;
    this.line = [];
    this.lines = [];
    this.changeColor = changeColor;
  }
  pushSubstring(substring) {
    this.pushDiff(new Diff(this.op, substring));
  }
  pushLine() {
    this.lines.push(this.line.length !== 1 ? new Diff(this.op, concatenateRelevantDiffs(this.op, this.line, this.changeColor)) : this.line[0][0] === this.op ? this.line[0] : new Diff(this.op, this.line[0][1]));
    this.line.length = 0;
  }
  isLineEmpty() {
    return this.line.length === 0;
  }
  // Minor input to buffer.
  pushDiff(diff2) {
    this.line.push(diff2);
  }
  // Main input to buffer.
  align(diff2) {
    const string = diff2[1];
    if (string.includes("\n")) {
      const substrings = string.split("\n");
      const iLast = substrings.length - 1;
      substrings.forEach((substring, i) => {
        if (i < iLast) {
          this.pushSubstring(substring);
          this.pushLine();
        } else if (substring.length !== 0) {
          this.pushSubstring(substring);
        }
      });
    } else {
      this.pushDiff(diff2);
    }
  }
  // Output from buffer.
  moveLinesTo(lines) {
    if (!this.isLineEmpty()) {
      this.pushLine();
    }
    lines.push(...this.lines);
    this.lines.length = 0;
  }
};
__name(_ChangeBuffer, "ChangeBuffer");
var ChangeBuffer = _ChangeBuffer;
var _CommonBuffer = class _CommonBuffer {
  deleteBuffer;
  insertBuffer;
  lines;
  constructor(deleteBuffer, insertBuffer) {
    this.deleteBuffer = deleteBuffer;
    this.insertBuffer = insertBuffer;
    this.lines = [];
  }
  pushDiffCommonLine(diff2) {
    this.lines.push(diff2);
  }
  pushDiffChangeLines(diff2) {
    const isDiffEmpty = diff2[1].length === 0;
    if (!isDiffEmpty || this.deleteBuffer.isLineEmpty()) {
      this.deleteBuffer.pushDiff(diff2);
    }
    if (!isDiffEmpty || this.insertBuffer.isLineEmpty()) {
      this.insertBuffer.pushDiff(diff2);
    }
  }
  flushChangeLines() {
    this.deleteBuffer.moveLinesTo(this.lines);
    this.insertBuffer.moveLinesTo(this.lines);
  }
  // Input to buffer.
  align(diff2) {
    const op = diff2[0];
    const string = diff2[1];
    if (string.includes("\n")) {
      const substrings = string.split("\n");
      const iLast = substrings.length - 1;
      substrings.forEach((substring, i) => {
        if (i === 0) {
          const subdiff = new Diff(op, substring);
          if (this.deleteBuffer.isLineEmpty() && this.insertBuffer.isLineEmpty()) {
            this.flushChangeLines();
            this.pushDiffCommonLine(subdiff);
          } else {
            this.pushDiffChangeLines(subdiff);
            this.flushChangeLines();
          }
        } else if (i < iLast) {
          this.pushDiffCommonLine(new Diff(op, substring));
        } else if (substring.length !== 0) {
          this.pushDiffChangeLines(new Diff(op, substring));
        }
      });
    } else {
      this.pushDiffChangeLines(diff2);
    }
  }
  // Output from buffer.
  getLines() {
    this.flushChangeLines();
    return this.lines;
  }
};
__name(_CommonBuffer, "CommonBuffer");
var CommonBuffer = _CommonBuffer;
function getAlignedDiffs(diffs, changeColor) {
  const deleteBuffer = new ChangeBuffer(DIFF_DELETE, changeColor);
  const insertBuffer = new ChangeBuffer(DIFF_INSERT, changeColor);
  const commonBuffer = new CommonBuffer(deleteBuffer, insertBuffer);
  diffs.forEach((diff2) => {
    switch (diff2[0]) {
      case DIFF_DELETE:
        deleteBuffer.align(diff2);
        break;
      case DIFF_INSERT:
        insertBuffer.align(diff2);
        break;
      default:
        commonBuffer.align(diff2);
    }
  });
  return commonBuffer.getLines();
}
__name(getAlignedDiffs, "getAlignedDiffs");
function hasCommonDiff(diffs, isMultiline) {
  if (isMultiline) {
    const iLast = diffs.length - 1;
    return diffs.some((diff2, i) => diff2[0] === DIFF_EQUAL && (i !== iLast || diff2[1] !== "\n"));
  }
  return diffs.some((diff2) => diff2[0] === DIFF_EQUAL);
}
__name(hasCommonDiff, "hasCommonDiff");
function diffStringsUnified(a2, b, options) {
  if (a2 !== b && a2.length !== 0 && b.length !== 0) {
    const isMultiline = a2.includes("\n") || b.includes("\n");
    const [diffs, truncated] = diffStringsRaw(isMultiline ? `${a2}
` : a2, isMultiline ? `${b}
` : b, true, options);
    if (hasCommonDiff(diffs, isMultiline)) {
      const optionsNormalized = normalizeDiffOptions(options);
      const lines = getAlignedDiffs(diffs, optionsNormalized.changeColor);
      return printDiffLines(lines, truncated, optionsNormalized);
    }
  }
  return diffLinesUnified(a2.split("\n"), b.split("\n"), options);
}
__name(diffStringsUnified, "diffStringsUnified");
function diffStringsRaw(a2, b, cleanup, options) {
  const [diffs, truncated] = diffStrings(a2, b, options);
  if (cleanup) {
    diff_cleanupSemantic(diffs);
  }
  return [diffs, truncated];
}
__name(diffStringsRaw, "diffStringsRaw");
function getCommonMessage(message, options) {
  const { commonColor } = normalizeDiffOptions(options);
  return commonColor(message);
}
__name(getCommonMessage, "getCommonMessage");
var { AsymmetricMatcher: AsymmetricMatcher2, DOMCollection: DOMCollection2, DOMElement: DOMElement2, Immutable: Immutable2, ReactElement: ReactElement2, ReactTestComponent: ReactTestComponent2 } = plugins;
var PLUGINS2 = [
  ReactTestComponent2,
  ReactElement2,
  DOMElement2,
  DOMCollection2,
  Immutable2,
  AsymmetricMatcher2,
  plugins.Error
];
var FORMAT_OPTIONS = {
  maxDepth: 20,
  plugins: PLUGINS2
};
var FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false,
  maxDepth: 8,
  plugins: PLUGINS2
};
function diff(a2, b, options) {
  if (Object.is(a2, b)) {
    return "";
  }
  const aType = getType3(a2);
  let expectedType = aType;
  let omitDifference = false;
  if (aType === "object" && typeof a2.asymmetricMatch === "function") {
    if (a2.$$typeof !== Symbol.for("jest.asymmetricMatcher")) {
      return void 0;
    }
    if (typeof a2.getExpectedType !== "function") {
      return void 0;
    }
    expectedType = a2.getExpectedType();
    omitDifference = expectedType === "string";
  }
  if (expectedType !== getType3(b)) {
    let truncate2 = function(s2) {
      return s2.length <= MAX_LENGTH ? s2 : `${s2.slice(0, MAX_LENGTH)}...`;
    };
    __name(truncate2, "truncate");
    const { aAnnotation, aColor, aIndicator, bAnnotation, bColor, bIndicator } = normalizeDiffOptions(options);
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    let aDisplay = format(a2, formatOptions);
    let bDisplay = format(b, formatOptions);
    const MAX_LENGTH = 1e5;
    aDisplay = truncate2(aDisplay);
    bDisplay = truncate2(bDisplay);
    const aDiff = `${aColor(`${aIndicator} ${aAnnotation}:`)} 
${aDisplay}`;
    const bDiff = `${bColor(`${bIndicator} ${bAnnotation}:`)} 
${bDisplay}`;
    return `${aDiff}

${bDiff}`;
  }
  if (omitDifference) {
    return void 0;
  }
  switch (aType) {
    case "string":
      return diffLinesUnified(a2.split("\n"), b.split("\n"), options);
    case "boolean":
    case "number":
      return comparePrimitive(a2, b, options);
    case "map":
      return compareObjects(sortMap(a2), sortMap(b), options);
    case "set":
      return compareObjects(sortSet(a2), sortSet(b), options);
    default:
      return compareObjects(a2, b, options);
  }
}
__name(diff, "diff");
function comparePrimitive(a2, b, options) {
  const aFormat = format(a2, FORMAT_OPTIONS);
  const bFormat = format(b, FORMAT_OPTIONS);
  return aFormat === bFormat ? "" : diffLinesUnified(aFormat.split("\n"), bFormat.split("\n"), options);
}
__name(comparePrimitive, "comparePrimitive");
function sortMap(map) {
  return new Map(Array.from(map.entries()).sort());
}
__name(sortMap, "sortMap");
function sortSet(set) {
  return new Set(Array.from(set.values()).sort());
}
__name(sortSet, "sortSet");
function compareObjects(a2, b, options) {
  let difference;
  let hasThrown = false;
  try {
    const formatOptions = getFormatOptions(FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a2, b, formatOptions, options);
  } catch {
    hasThrown = true;
  }
  const noDiffMessage = getCommonMessage(NO_DIFF_MESSAGE, options);
  if (difference === void 0 || difference === noDiffMessage) {
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a2, b, formatOptions, options);
    if (difference !== noDiffMessage && !hasThrown) {
      difference = `${getCommonMessage(SIMILAR_MESSAGE, options)}

${difference}`;
    }
  }
  return difference;
}
__name(compareObjects, "compareObjects");
function getFormatOptions(formatOptions, options) {
  const { compareKeys, printBasicPrototype, maxDepth } = normalizeDiffOptions(options);
  return {
    ...formatOptions,
    compareKeys,
    printBasicPrototype,
    maxDepth: maxDepth ?? formatOptions.maxDepth
  };
}
__name(getFormatOptions, "getFormatOptions");
function getObjectsDifference(a2, b, formatOptions, options) {
  const formatOptionsZeroIndent = {
    ...formatOptions,
    indent: 0
  };
  const aCompare = format(a2, formatOptionsZeroIndent);
  const bCompare = format(b, formatOptionsZeroIndent);
  if (aCompare === bCompare) {
    return getCommonMessage(NO_DIFF_MESSAGE, options);
  } else {
    const aDisplay = format(a2, formatOptions);
    const bDisplay = format(b, formatOptions);
    return diffLinesUnified2(aDisplay.split("\n"), bDisplay.split("\n"), aCompare.split("\n"), bCompare.split("\n"), options);
  }
}
__name(getObjectsDifference, "getObjectsDifference");
var MAX_DIFF_STRING_LENGTH = 2e4;
function isAsymmetricMatcher(data) {
  const type = getType2(data);
  return type === "Object" && typeof data.asymmetricMatch === "function";
}
__name(isAsymmetricMatcher, "isAsymmetricMatcher");
function isReplaceable(obj1, obj2) {
  const obj1Type = getType2(obj1);
  const obj2Type = getType2(obj2);
  return obj1Type === obj2Type && (obj1Type === "Object" || obj1Type === "Array");
}
__name(isReplaceable, "isReplaceable");
function printDiffOrStringify(received, expected, options) {
  const { aAnnotation, bAnnotation } = normalizeDiffOptions(options);
  if (typeof expected === "string" && typeof received === "string" && expected.length > 0 && received.length > 0 && expected.length <= MAX_DIFF_STRING_LENGTH && received.length <= MAX_DIFF_STRING_LENGTH && expected !== received) {
    if (expected.includes("\n") || received.includes("\n")) {
      return diffStringsUnified(expected, received, options);
    }
    const [diffs] = diffStringsRaw(expected, received, true);
    const hasCommonDiff2 = diffs.some((diff2) => diff2[0] === DIFF_EQUAL);
    const printLabel = getLabelPrinter(aAnnotation, bAnnotation);
    const expectedLine = printLabel(aAnnotation) + printExpected(getCommonAndChangedSubstrings(diffs, DIFF_DELETE, hasCommonDiff2));
    const receivedLine = printLabel(bAnnotation) + printReceived(getCommonAndChangedSubstrings(diffs, DIFF_INSERT, hasCommonDiff2));
    return `${expectedLine}
${receivedLine}`;
  }
  const clonedExpected = deepClone(expected, { forceWritable: true });
  const clonedReceived = deepClone(received, { forceWritable: true });
  const { replacedExpected, replacedActual } = replaceAsymmetricMatcher(clonedReceived, clonedExpected);
  const difference = diff(replacedExpected, replacedActual, options);
  return difference;
}
__name(printDiffOrStringify, "printDiffOrStringify");
function replaceAsymmetricMatcher(actual, expected, actualReplaced = /* @__PURE__ */ new WeakSet(), expectedReplaced = /* @__PURE__ */ new WeakSet()) {
  if (actual instanceof Error && expected instanceof Error && typeof actual.cause !== "undefined" && typeof expected.cause === "undefined") {
    delete actual.cause;
    return {
      replacedActual: actual,
      replacedExpected: expected
    };
  }
  if (!isReplaceable(actual, expected)) {
    return {
      replacedActual: actual,
      replacedExpected: expected
    };
  }
  if (actualReplaced.has(actual) || expectedReplaced.has(expected)) {
    return {
      replacedActual: actual,
      replacedExpected: expected
    };
  }
  actualReplaced.add(actual);
  expectedReplaced.add(expected);
  getOwnProperties(expected).forEach((key) => {
    const expectedValue = expected[key];
    const actualValue = actual[key];
    if (isAsymmetricMatcher(expectedValue)) {
      if (expectedValue.asymmetricMatch(actualValue)) {
        actual[key] = expectedValue;
      }
    } else if (isAsymmetricMatcher(actualValue)) {
      if (actualValue.asymmetricMatch(expectedValue)) {
        expected[key] = actualValue;
      }
    } else if (isReplaceable(actualValue, expectedValue)) {
      const replaced = replaceAsymmetricMatcher(actualValue, expectedValue, actualReplaced, expectedReplaced);
      actual[key] = replaced.replacedActual;
      expected[key] = replaced.replacedExpected;
    }
  });
  return {
    replacedActual: actual,
    replacedExpected: expected
  };
}
__name(replaceAsymmetricMatcher, "replaceAsymmetricMatcher");
function getLabelPrinter(...strings) {
  const maxLength = strings.reduce((max, string) => string.length > max ? string.length : max, 0);
  return (string) => `${string}: ${" ".repeat(maxLength - string.length)}`;
}
__name(getLabelPrinter, "getLabelPrinter");
var SPACE_SYMBOL = "\xB7";
function replaceTrailingSpaces(text) {
  return text.replace(/\s+$/gm, (spaces) => SPACE_SYMBOL.repeat(spaces.length));
}
__name(replaceTrailingSpaces, "replaceTrailingSpaces");
function printReceived(object) {
  return s.red(replaceTrailingSpaces(stringify(object)));
}
__name(printReceived, "printReceived");
function printExpected(value) {
  return s.green(replaceTrailingSpaces(stringify(value)));
}
__name(printExpected, "printExpected");
function getCommonAndChangedSubstrings(diffs, op, hasCommonDiff2) {
  return diffs.reduce((reduced, diff2) => reduced + (diff2[0] === DIFF_EQUAL ? diff2[1] : diff2[0] === op ? hasCommonDiff2 ? s.inverse(diff2[1]) : diff2[1] : ""), "");
}
__name(getCommonAndChangedSubstrings, "getCommonAndChangedSubstrings");

// ../node_modules/@vitest/utils/dist/error.js
var IS_RECORD_SYMBOL = "@@__IMMUTABLE_RECORD__@@";
var IS_COLLECTION_SYMBOL = "@@__IMMUTABLE_ITERABLE__@@";
function isImmutable(v) {
  return v && (v[IS_COLLECTION_SYMBOL] || v[IS_RECORD_SYMBOL]);
}
__name(isImmutable, "isImmutable");
var OBJECT_PROTO = Object.getPrototypeOf({});
function getUnserializableMessage(err) {
  if (err instanceof Error) {
    return `<unserializable>: ${err.message}`;
  }
  if (typeof err === "string") {
    return `<unserializable>: ${err}`;
  }
  return "<unserializable>";
}
__name(getUnserializableMessage, "getUnserializableMessage");
function serializeValue(val, seen = /* @__PURE__ */ new WeakMap()) {
  if (!val || typeof val === "string") {
    return val;
  }
  if (val instanceof Error && "toJSON" in val && typeof val.toJSON === "function") {
    const jsonValue = val.toJSON();
    if (jsonValue && jsonValue !== val && typeof jsonValue === "object") {
      if (typeof val.message === "string") {
        safe(() => jsonValue.message ?? (jsonValue.message = val.message));
      }
      if (typeof val.stack === "string") {
        safe(() => jsonValue.stack ?? (jsonValue.stack = val.stack));
      }
      if (typeof val.name === "string") {
        safe(() => jsonValue.name ?? (jsonValue.name = val.name));
      }
      if (val.cause != null) {
        safe(() => jsonValue.cause ?? (jsonValue.cause = serializeValue(val.cause, seen)));
      }
    }
    return serializeValue(jsonValue, seen);
  }
  if (typeof val === "function") {
    return `Function<${val.name || "anonymous"}>`;
  }
  if (typeof val === "symbol") {
    return val.toString();
  }
  if (typeof val !== "object") {
    return val;
  }
  if (typeof Buffer !== "undefined" && val instanceof Buffer) {
    return `<Buffer(${val.length}) ...>`;
  }
  if (typeof Uint8Array !== "undefined" && val instanceof Uint8Array) {
    return `<Uint8Array(${val.length}) ...>`;
  }
  if (isImmutable(val)) {
    return serializeValue(val.toJSON(), seen);
  }
  if (val instanceof Promise || val.constructor && val.constructor.prototype === "AsyncFunction") {
    return "Promise";
  }
  if (typeof Element !== "undefined" && val instanceof Element) {
    return val.tagName;
  }
  if (typeof val.asymmetricMatch === "function") {
    return `${val.toString()} ${format2(val.sample)}`;
  }
  if (typeof val.toJSON === "function") {
    return serializeValue(val.toJSON(), seen);
  }
  if (seen.has(val)) {
    return seen.get(val);
  }
  if (Array.isArray(val)) {
    const clone2 = new Array(val.length);
    seen.set(val, clone2);
    val.forEach((e, i) => {
      try {
        clone2[i] = serializeValue(e, seen);
      } catch (err) {
        clone2[i] = getUnserializableMessage(err);
      }
    });
    return clone2;
  } else {
    const clone2 = /* @__PURE__ */ Object.create(null);
    seen.set(val, clone2);
    let obj = val;
    while (obj && obj !== OBJECT_PROTO) {
      Object.getOwnPropertyNames(obj).forEach((key) => {
        if (key in clone2) {
          return;
        }
        try {
          clone2[key] = serializeValue(val[key], seen);
        } catch (err) {
          delete clone2[key];
          clone2[key] = getUnserializableMessage(err);
        }
      });
      obj = Object.getPrototypeOf(obj);
    }
    return clone2;
  }
}
__name(serializeValue, "serializeValue");
function safe(fn) {
  try {
    return fn();
  } catch {
  }
}
__name(safe, "safe");
function normalizeErrorMessage(message) {
  return message.replace(/__(vite_ssr_import|vi_import)_\d+__\./g, "");
}
__name(normalizeErrorMessage, "normalizeErrorMessage");
function processError(_err, diffOptions, seen = /* @__PURE__ */ new WeakSet()) {
  if (!_err || typeof _err !== "object") {
    return { message: String(_err) };
  }
  const err = _err;
  if (err.showDiff || err.showDiff === void 0 && err.expected !== void 0 && err.actual !== void 0) {
    err.diff = printDiffOrStringify(err.actual, err.expected, {
      ...diffOptions,
      ...err.diffOptions
    });
  }
  if ("expected" in err && typeof err.expected !== "string") {
    err.expected = stringify(err.expected, 10);
  }
  if ("actual" in err && typeof err.actual !== "string") {
    err.actual = stringify(err.actual, 10);
  }
  try {
    if (typeof err.message === "string") {
      err.message = normalizeErrorMessage(err.message);
    }
  } catch {
  }
  try {
    if (!seen.has(err) && typeof err.cause === "object") {
      seen.add(err);
      err.cause = processError(err.cause, diffOptions, seen);
    }
  } catch {
  }
  try {
    return serializeValue(err);
  } catch (e) {
    return serializeValue(new Error(`Failed to fully serialize error: ${e === null || e === void 0 ? void 0 : e.message}
Inner error message: ${err === null || err === void 0 ? void 0 : err.message}`));
  }
}
__name(processError, "processError");

export {
  s,
  stringify,
  getDefaultExportFromCjs2 as getDefaultExportFromCjs,
  assertTypes,
  isObject,
  getType2 as getType,
  noop,
  diff,
  printDiffOrStringify,
  processError
};
