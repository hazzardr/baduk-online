import {
  __commonJS,
  __name,
  __toESM
} from "./chunk-L5NVL7MD.js";

// ../../node_modules/@base2/pretty-print-object/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/@base2/pretty-print-object/dist/index.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var seen = [];
    function isObj(value) {
      var type = typeof value;
      return value !== null && (type === "object" || type === "function");
    }
    __name(isObj, "isObj");
    function isRegexp(value) {
      return Object.prototype.toString.call(value) === "[object RegExp]";
    }
    __name(isRegexp, "isRegexp");
    function getOwnEnumPropSymbols(object) {
      return Object.getOwnPropertySymbols(object).filter(function(keySymbol) {
        return Object.prototype.propertyIsEnumerable.call(object, keySymbol);
      });
    }
    __name(getOwnEnumPropSymbols, "getOwnEnumPropSymbols");
    function prettyPrint2(input, options, pad) {
      if (pad === void 0) {
        pad = "";
      }
      var defaultOptions = {
        indent: "	",
        singleQuotes: true
      };
      var combinedOptions = __assign(__assign({}, defaultOptions), options);
      var tokens;
      if (combinedOptions.inlineCharacterLimit === void 0) {
        tokens = {
          newLine: "\n",
          newLineOrSpace: "\n",
          pad,
          indent: pad + combinedOptions.indent
        };
      } else {
        tokens = {
          newLine: "@@__PRETTY_PRINT_NEW_LINE__@@",
          newLineOrSpace: "@@__PRETTY_PRINT_NEW_LINE_OR_SPACE__@@",
          pad: "@@__PRETTY_PRINT_PAD__@@",
          indent: "@@__PRETTY_PRINT_INDENT__@@"
        };
      }
      var expandWhiteSpace = /* @__PURE__ */ __name(function(string) {
        if (combinedOptions.inlineCharacterLimit === void 0) {
          return string;
        }
        var oneLined = string.replace(new RegExp(tokens.newLine, "g"), "").replace(new RegExp(tokens.newLineOrSpace, "g"), " ").replace(new RegExp(tokens.pad + "|" + tokens.indent, "g"), "");
        if (oneLined.length <= combinedOptions.inlineCharacterLimit) {
          return oneLined;
        }
        return string.replace(new RegExp(tokens.newLine + "|" + tokens.newLineOrSpace, "g"), "\n").replace(new RegExp(tokens.pad, "g"), pad).replace(new RegExp(tokens.indent, "g"), pad + combinedOptions.indent);
      }, "expandWhiteSpace");
      if (seen.indexOf(input) !== -1) {
        return '"[Circular]"';
      }
      if (input === null || input === void 0 || typeof input === "number" || typeof input === "boolean" || typeof input === "function" || typeof input === "symbol" || isRegexp(input)) {
        return String(input);
      }
      if (input instanceof Date) {
        return "new Date('" + input.toISOString() + "')";
      }
      if (Array.isArray(input)) {
        if (input.length === 0) {
          return "[]";
        }
        seen.push(input);
        var ret = "[" + tokens.newLine + input.map(function(el, i) {
          var eol = input.length - 1 === i ? tokens.newLine : "," + tokens.newLineOrSpace;
          var value = prettyPrint2(el, combinedOptions, pad + combinedOptions.indent);
          if (combinedOptions.transform) {
            value = combinedOptions.transform(input, i, value);
          }
          return tokens.indent + value + eol;
        }).join("") + tokens.pad + "]";
        seen.pop();
        return expandWhiteSpace(ret);
      }
      if (isObj(input)) {
        var objKeys_1 = __spreadArrays(Object.keys(input), getOwnEnumPropSymbols(input));
        if (combinedOptions.filter) {
          objKeys_1 = objKeys_1.filter(function(el) {
            return combinedOptions.filter && combinedOptions.filter(input, el);
          });
        }
        if (objKeys_1.length === 0) {
          return "{}";
        }
        seen.push(input);
        var ret = "{" + tokens.newLine + objKeys_1.map(function(el, i) {
          var eol = objKeys_1.length - 1 === i ? tokens.newLine : "," + tokens.newLineOrSpace;
          var isSymbol = typeof el === "symbol";
          var isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el.toString());
          var key = isSymbol || isClassic ? el : prettyPrint2(el, combinedOptions);
          var value = prettyPrint2(input[el], combinedOptions, pad + combinedOptions.indent);
          if (combinedOptions.transform) {
            value = combinedOptions.transform(input, el, value);
          }
          return tokens.indent + String(key) + ": " + value + eol;
        }).join("") + tokens.pad + "}";
        seen.pop();
        return expandWhiteSpace(ret);
      }
      input = String(input).replace(/[\r\n]/g, function(x) {
        return x === "\n" ? "\\n" : "\\r";
      });
      if (!combinedOptions.singleQuotes) {
        input = input.replace(/"/g, '\\"');
        return '"' + input + '"';
      }
      input = input.replace(/\\?'/g, "\\'");
      return "'" + input + "'";
    }
    __name(prettyPrint2, "prettyPrint");
    exports.prettyPrint = prettyPrint2;
  }
});

// ../../node_modules/react-element-to-jsx-string/node_modules/react-is/cjs/react-is.production.min.js
var require_react_is_production_min = __commonJS({
  "../../node_modules/react-element-to-jsx-string/node_modules/react-is/cjs/react-is.production.min.js"(exports) {
    "use strict";
    var b = Symbol.for("react.element");
    var c = Symbol.for("react.portal");
    var d = Symbol.for("react.fragment");
    var e = Symbol.for("react.strict_mode");
    var f = Symbol.for("react.profiler");
    var g = Symbol.for("react.provider");
    var h = Symbol.for("react.context");
    var k = Symbol.for("react.server_context");
    var l = Symbol.for("react.forward_ref");
    var m = Symbol.for("react.suspense");
    var n = Symbol.for("react.suspense_list");
    var p = Symbol.for("react.memo");
    var q = Symbol.for("react.lazy");
    var t = Symbol.for("react.offscreen");
    var u;
    u = Symbol.for("react.module.reference");
    function v(a) {
      if ("object" === typeof a && null !== a) {
        var r = a.$$typeof;
        switch (r) {
          case b:
            switch (a = a.type, a) {
              case d:
              case f:
              case e:
              case m:
              case n:
                return a;
              default:
                switch (a = a && a.$$typeof, a) {
                  case k:
                  case h:
                  case l:
                  case q:
                  case p:
                  case g:
                    return a;
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
    exports.ContextConsumer = h;
    exports.ContextProvider = g;
    exports.Element = b;
    exports.ForwardRef = l;
    exports.Fragment = d;
    exports.Lazy = q;
    exports.Memo = p;
    exports.Portal = c;
    exports.Profiler = f;
    exports.StrictMode = e;
    exports.Suspense = m;
    exports.SuspenseList = n;
    exports.isAsyncMode = function() {
      return false;
    };
    exports.isConcurrentMode = function() {
      return false;
    };
    exports.isContextConsumer = function(a) {
      return v(a) === h;
    };
    exports.isContextProvider = function(a) {
      return v(a) === g;
    };
    exports.isElement = function(a) {
      return "object" === typeof a && null !== a && a.$$typeof === b;
    };
    exports.isForwardRef = function(a) {
      return v(a) === l;
    };
    exports.isFragment = function(a) {
      return v(a) === d;
    };
    exports.isLazy = function(a) {
      return v(a) === q;
    };
    exports.isMemo = function(a) {
      return v(a) === p;
    };
    exports.isPortal = function(a) {
      return v(a) === c;
    };
    exports.isProfiler = function(a) {
      return v(a) === f;
    };
    exports.isStrictMode = function(a) {
      return v(a) === e;
    };
    exports.isSuspense = function(a) {
      return v(a) === m;
    };
    exports.isSuspenseList = function(a) {
      return v(a) === n;
    };
    exports.isValidElementType = function(a) {
      return "string" === typeof a || "function" === typeof a || a === d || a === f || a === e || a === m || a === n || a === t || "object" === typeof a && null !== a && (a.$$typeof === q || a.$$typeof === p || a.$$typeof === g || a.$$typeof === h || a.$$typeof === l || a.$$typeof === u || void 0 !== a.getModuleId) ? true : false;
    };
    exports.typeOf = v;
  }
});

// ../../node_modules/react-element-to-jsx-string/node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "../../node_modules/react-element-to-jsx-string/node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
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
        var Element = REACT_ELEMENT_TYPE;
        var ForwardRef2 = REACT_FORWARD_REF_TYPE;
        var Fragment2 = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo2 = REACT_MEMO_TYPE;
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
        function isContextConsumer2(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        __name(isContextConsumer2, "isContextConsumer");
        function isContextProvider2(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        __name(isContextProvider2, "isContextProvider");
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        __name(isElement, "isElement");
        function isForwardRef3(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        __name(isForwardRef3, "isForwardRef");
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        __name(isFragment, "isFragment");
        function isLazy2(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        __name(isLazy2, "isLazy");
        function isMemo3(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        __name(isMemo3, "isMemo");
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        __name(isPortal, "isPortal");
        function isProfiler2(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        __name(isProfiler2, "isProfiler");
        function isStrictMode2(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        __name(isStrictMode2, "isStrictMode");
        function isSuspense2(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        __name(isSuspense2, "isSuspense");
        function isSuspenseList(object) {
          return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
        }
        __name(isSuspenseList, "isSuspenseList");
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element;
        exports.ForwardRef = ForwardRef2;
        exports.Fragment = Fragment2;
        exports.Lazy = Lazy;
        exports.Memo = Memo2;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.SuspenseList = SuspenseList;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer2;
        exports.isContextProvider = isContextProvider2;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef3;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy2;
        exports.isMemo = isMemo3;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler2;
        exports.isStrictMode = isStrictMode2;
        exports.isSuspense = isSuspense2;
        exports.isSuspenseList = isSuspenseList;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// ../../node_modules/react-element-to-jsx-string/node_modules/react-is/index.js
var require_react_is = __commonJS({
  "../../node_modules/react-element-to-jsx-string/node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_is_production_min();
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// src/docs/lib/componentTypes.ts
var isMemo = /* @__PURE__ */ __name((component) => component.$$typeof === Symbol.for("react.memo"), "isMemo");
var isForwardRef = /* @__PURE__ */ __name((component) => component.$$typeof === Symbol.for("react.forward_ref"), "isForwardRef");

// ../../node_modules/is-plain-object/dist/is-plain-object.mjs
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
__name(isObject, "isObject");
function isPlainObject(o) {
  var ctor, prot;
  if (isObject(o) === false) return false;
  ctor = o.constructor;
  if (ctor === void 0) return true;
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }
  return true;
}
__name(isPlainObject, "isPlainObject");

// ../../node_modules/react-element-to-jsx-string/dist/esm/index.js
var import_pretty_print_object = __toESM(require_dist());
var import_react_is = __toESM(require_react_is());
import * as React from "react";
import React__default, { Fragment, isValidElement as isValidElement2 } from "react";
var spacer = /* @__PURE__ */ __name(function(times, tabStop) {
  if (times === 0) {
    return "";
  }
  return new Array(times * tabStop).fill(" ").join("");
}, "spacer");
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
__name(_arrayLikeToArray, "_arrayLikeToArray");
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
__name(_arrayWithoutHoles, "_arrayWithoutHoles");
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
__name(_defineProperty, "_defineProperty");
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
__name(_iterableToArray, "_iterableToArray");
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
__name(_nonIterableSpread, "_nonIterableSpread");
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
__name(ownKeys, "ownKeys");
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
__name(_objectSpread2, "_objectSpread2");
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
__name(_toConsumableArray, "_toConsumableArray");
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
__name(_toPrimitive, "_toPrimitive");
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
__name(_toPropertyKey, "_toPropertyKey");
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
__name(_typeof, "_typeof");
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
__name(_unsupportedIterableToArray, "_unsupportedIterableToArray");
function safeSortObject(value, seen) {
  if (value === null || _typeof(value) !== "object") {
    return value;
  }
  if (value instanceof Date || value instanceof RegExp) {
    return value;
  }
  if (React.isValidElement(value)) {
    var copyObj = _objectSpread2({}, value);
    delete copyObj._owner;
    return copyObj;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map(function(v) {
      return safeSortObject(v, seen);
    });
  }
  return Object.keys(value).sort().reduce(function(result, key) {
    if (key === "current" || seen.has(value[key])) {
      result[key] = "[Circular]";
    } else {
      result[key] = safeSortObject(value[key], seen);
    }
    return result;
  }, {});
}
__name(safeSortObject, "safeSortObject");
function sortObject(value) {
  return safeSortObject(value, /* @__PURE__ */ new WeakSet());
}
__name(sortObject, "sortObject");
var createStringTreeNode = /* @__PURE__ */ __name(function createStringTreeNode2(value) {
  return {
    type: "string",
    value
  };
}, "createStringTreeNode");
var createNumberTreeNode = /* @__PURE__ */ __name(function createNumberTreeNode2(value) {
  return {
    type: "number",
    value
  };
}, "createNumberTreeNode");
var createReactElementTreeNode = /* @__PURE__ */ __name(function createReactElementTreeNode2(displayName, props, defaultProps, childrens) {
  return {
    type: "ReactElement",
    displayName,
    props,
    defaultProps,
    childrens
  };
}, "createReactElementTreeNode");
var createReactFragmentTreeNode = /* @__PURE__ */ __name(function createReactFragmentTreeNode2(key, childrens) {
  return {
    type: "ReactFragment",
    key,
    childrens
  };
}, "createReactFragmentTreeNode");
var supportFragment = Boolean(Fragment);
var getFunctionTypeName = /* @__PURE__ */ __name(function getFunctionTypeName2(functionType) {
  if (!functionType.name || functionType.name === "_default") {
    return "No Display Name";
  }
  return functionType.name;
}, "getFunctionTypeName");
var _getWrappedComponentDisplayName = /* @__PURE__ */ __name(function getWrappedComponentDisplayName(Component) {
  switch (true) {
    case Boolean(Component.displayName):
      return Component.displayName;
    case Component.$$typeof === import_react_is.Memo:
      return _getWrappedComponentDisplayName(Component.type);
    case Component.$$typeof === import_react_is.ForwardRef:
      return _getWrappedComponentDisplayName(Component.render);
    default:
      return getFunctionTypeName(Component);
  }
}, "getWrappedComponentDisplayName");
var getReactElementDisplayName = /* @__PURE__ */ __name(function getReactElementDisplayName2(element) {
  switch (true) {
    case typeof element.type === "string":
      return element.type;
    case typeof element.type === "function":
      if (element.type.displayName) {
        return element.type.displayName;
      }
      return getFunctionTypeName(element.type);
    case (0, import_react_is.isForwardRef)(element):
    case (0, import_react_is.isMemo)(element):
      return _getWrappedComponentDisplayName(element.type);
    case (0, import_react_is.isContextConsumer)(element):
      return "".concat(element.type._context.displayName || "Context", ".Consumer");
    case (0, import_react_is.isContextProvider)(element):
      return "".concat(element.type._context.displayName || "Context", ".Provider");
    case (0, import_react_is.isLazy)(element):
      return "Lazy";
    case (0, import_react_is.isProfiler)(element):
      return "Profiler";
    case (0, import_react_is.isStrictMode)(element):
      return "StrictMode";
    case (0, import_react_is.isSuspense)(element):
      return "Suspense";
    default:
      return "UnknownElementType";
  }
}, "getReactElementDisplayName");
var noChildren = /* @__PURE__ */ __name(function noChildren2(propsValue, propName) {
  return propName !== "children";
}, "noChildren");
var onlyMeaningfulChildren = /* @__PURE__ */ __name(function onlyMeaningfulChildren2(children) {
  return children !== true && children !== false && children !== null && children !== "";
}, "onlyMeaningfulChildren");
var filterProps = /* @__PURE__ */ __name(function filterProps2(originalProps, cb) {
  var filteredProps = {};
  Object.keys(originalProps).filter(function(key) {
    return cb(originalProps[key], key);
  }).forEach(function(key) {
    return filteredProps[key] = originalProps[key];
  });
  return filteredProps;
}, "filterProps");
var _parseReactElement = /* @__PURE__ */ __name(function parseReactElement(element, options) {
  var _options$displayName = options.displayName, displayNameFn = _options$displayName === void 0 ? getReactElementDisplayName : _options$displayName;
  if (typeof element === "string") {
    return createStringTreeNode(element);
  } else if (typeof element === "number") {
    return createNumberTreeNode(element);
  } else if (!React__default.isValidElement(element)) {
    throw new Error("react-element-to-jsx-string: Expected a React.Element, got `".concat(_typeof(element), "`"));
  }
  var displayName = displayNameFn(element);
  var props = filterProps(element.props, noChildren);
  if (element.ref !== null) {
    props.ref = element.ref;
  }
  var key = element.key;
  if (typeof key === "string" && key.search(/^\./)) {
    props.key = key;
  }
  var defaultProps = filterProps(element.type.defaultProps || {}, noChildren);
  var childrens = React__default.Children.toArray(element.props.children).filter(onlyMeaningfulChildren).map(function(child) {
    return _parseReactElement(child, options);
  });
  if (supportFragment && element.type === Fragment) {
    return createReactFragmentTreeNode(key, childrens);
  }
  return createReactElementTreeNode(displayName, props, defaultProps, childrens);
}, "parseReactElement");
function noRefCheck() {
}
__name(noRefCheck, "noRefCheck");
var inlineFunction = /* @__PURE__ */ __name(function inlineFunction2(fn) {
  return fn.toString().split("\n").map(function(line) {
    return line.trim();
  }).join("");
}, "inlineFunction");
var defaultFunctionValue = inlineFunction;
var formatFunction = /* @__PURE__ */ __name(function(fn, options) {
  var _options$functionValu = options.functionValue, functionValue = _options$functionValu === void 0 ? defaultFunctionValue : _options$functionValu, showFunctions = options.showFunctions;
  if (!showFunctions && functionValue === defaultFunctionValue) {
    return functionValue(noRefCheck);
  }
  return functionValue(fn);
}, "formatFunction");
var formatComplexDataStructure = /* @__PURE__ */ __name(function(value, inline, lvl, options) {
  var normalizedValue = sortObject(value);
  var stringifiedValue = (0, import_pretty_print_object.prettyPrint)(normalizedValue, {
    transform: /* @__PURE__ */ __name(function transform(currentObj, prop, originalResult) {
      var currentValue = currentObj[prop];
      if (currentValue && isValidElement2(currentValue)) {
        return formatTreeNode(_parseReactElement(currentValue, options), true, lvl, options);
      }
      if (typeof currentValue === "function") {
        return formatFunction(currentValue, options);
      }
      return originalResult;
    }, "transform")
  });
  if (inline) {
    return stringifiedValue.replace(/\s+/g, " ").replace(/{ /g, "{").replace(/ }/g, "}").replace(/\[ /g, "[").replace(/ ]/g, "]");
  }
  return stringifiedValue.replace(/\t/g, spacer(1, options.tabStop)).replace(/\n([^$])/g, "\n".concat(spacer(lvl + 1, options.tabStop), "$1"));
}, "formatComplexDataStructure");
var escape$1 = /* @__PURE__ */ __name(function escape(s) {
  return s.replace(/"/g, "&quot;");
}, "escape");
var formatPropValue = /* @__PURE__ */ __name(function formatPropValue2(propValue, inline, lvl, options) {
  if (typeof propValue === "number") {
    return "{".concat(String(propValue), "}");
  }
  if (typeof propValue === "string") {
    return '"'.concat(escape$1(propValue), '"');
  }
  if (_typeof(propValue) === "symbol") {
    var symbolDescription = propValue.valueOf().toString().replace(/Symbol\((.*)\)/, "$1");
    if (!symbolDescription) {
      return "{Symbol()}";
    }
    return "{Symbol('".concat(symbolDescription, "')}");
  }
  if (typeof propValue === "function") {
    return "{".concat(formatFunction(propValue, options), "}");
  }
  if (isValidElement2(propValue)) {
    return "{".concat(formatTreeNode(_parseReactElement(propValue, options), true, lvl, options), "}");
  }
  if (propValue instanceof Date) {
    if (isNaN(propValue.valueOf())) {
      return "{new Date(NaN)}";
    }
    return '{new Date("'.concat(propValue.toISOString(), '")}');
  }
  if (isPlainObject(propValue) || Array.isArray(propValue)) {
    return "{".concat(formatComplexDataStructure(propValue, inline, lvl, options), "}");
  }
  return "{".concat(String(propValue), "}");
}, "formatPropValue");
var formatProp = /* @__PURE__ */ __name(function(name, hasValue, value, hasDefaultValue, defaultValue, inline, lvl, options) {
  if (!hasValue && !hasDefaultValue) {
    throw new Error('The prop "'.concat(name, '" has no value and no default: could not be formatted'));
  }
  var usedValue = hasValue ? value : defaultValue;
  var useBooleanShorthandSyntax = options.useBooleanShorthandSyntax, tabStop = options.tabStop;
  var formattedPropValue = formatPropValue(usedValue, inline, lvl, options);
  var attributeFormattedInline = " ";
  var attributeFormattedMultiline = "\n".concat(spacer(lvl + 1, tabStop));
  var isMultilineAttribute = formattedPropValue.includes("\n");
  if (useBooleanShorthandSyntax && formattedPropValue === "{false}" && !hasDefaultValue) {
    attributeFormattedInline = "";
    attributeFormattedMultiline = "";
  } else if (useBooleanShorthandSyntax && formattedPropValue === "{true}") {
    attributeFormattedInline += "".concat(name);
    attributeFormattedMultiline += "".concat(name);
  } else {
    attributeFormattedInline += "".concat(name, "=").concat(formattedPropValue);
    attributeFormattedMultiline += "".concat(name, "=").concat(formattedPropValue);
  }
  return {
    attributeFormattedInline,
    attributeFormattedMultiline,
    isMultilineAttribute
  };
}, "formatProp");
var mergeSiblingPlainStringChildrenReducer = /* @__PURE__ */ __name(function(previousNodes, currentNode) {
  var nodes = previousNodes.slice(0, previousNodes.length > 0 ? previousNodes.length - 1 : 0);
  var previousNode = previousNodes[previousNodes.length - 1];
  if (previousNode && (currentNode.type === "string" || currentNode.type === "number") && (previousNode.type === "string" || previousNode.type === "number")) {
    nodes.push(createStringTreeNode(String(previousNode.value) + String(currentNode.value)));
  } else {
    if (previousNode) {
      nodes.push(previousNode);
    }
    nodes.push(currentNode);
  }
  return nodes;
}, "mergeSiblingPlainStringChildrenReducer");
var isKeyOrRefProps = /* @__PURE__ */ __name(function isKeyOrRefProps2(propName) {
  return ["key", "ref"].includes(propName);
}, "isKeyOrRefProps");
var sortPropsByNames = /* @__PURE__ */ __name(function(shouldSortUserProps) {
  return function(props) {
    var haveKeyProp = props.includes("key");
    var haveRefProp = props.includes("ref");
    var userPropsOnly = props.filter(function(oneProp) {
      return !isKeyOrRefProps(oneProp);
    });
    var sortedProps = shouldSortUserProps ? _toConsumableArray(userPropsOnly.sort()) : _toConsumableArray(userPropsOnly);
    if (haveRefProp) {
      sortedProps.unshift("ref");
    }
    if (haveKeyProp) {
      sortedProps.unshift("key");
    }
    return sortedProps;
  };
}, "sortPropsByNames");
function createPropFilter(props, filter) {
  if (Array.isArray(filter)) {
    return function(key) {
      return filter.indexOf(key) === -1;
    };
  } else {
    return function(key) {
      return filter(props[key], key);
    };
  }
}
__name(createPropFilter, "createPropFilter");
var compensateMultilineStringElementIndentation = /* @__PURE__ */ __name(function compensateMultilineStringElementIndentation2(element, formattedElement, inline, lvl, options) {
  var tabStop = options.tabStop;
  if (element.type === "string") {
    return formattedElement.split("\n").map(function(line, offset) {
      if (offset === 0) {
        return line;
      }
      return "".concat(spacer(lvl, tabStop)).concat(line);
    }).join("\n");
  }
  return formattedElement;
}, "compensateMultilineStringElementIndentation");
var formatOneChildren = /* @__PURE__ */ __name(function formatOneChildren2(inline, lvl, options) {
  return function(element) {
    return compensateMultilineStringElementIndentation(element, formatTreeNode(element, inline, lvl, options), inline, lvl, options);
  };
}, "formatOneChildren");
var onlyPropsWithOriginalValue = /* @__PURE__ */ __name(function onlyPropsWithOriginalValue2(defaultProps, props) {
  return function(propName) {
    var haveDefaultValue = Object.keys(defaultProps).includes(propName);
    return !haveDefaultValue || haveDefaultValue && defaultProps[propName] !== props[propName];
  };
}, "onlyPropsWithOriginalValue");
var isInlineAttributeTooLong = /* @__PURE__ */ __name(function isInlineAttributeTooLong2(attributes, inlineAttributeString, lvl, tabStop, maxInlineAttributesLineLength) {
  if (!maxInlineAttributesLineLength) {
    return attributes.length > 1;
  }
  return spacer(lvl, tabStop).length + inlineAttributeString.length > maxInlineAttributesLineLength;
}, "isInlineAttributeTooLong");
var shouldRenderMultilineAttr = /* @__PURE__ */ __name(function shouldRenderMultilineAttr2(attributes, inlineAttributeString, containsMultilineAttr, inline, lvl, tabStop, maxInlineAttributesLineLength) {
  return (isInlineAttributeTooLong(attributes, inlineAttributeString, lvl, tabStop, maxInlineAttributesLineLength) || containsMultilineAttr) && !inline;
}, "shouldRenderMultilineAttr");
var formatReactElementNode = /* @__PURE__ */ __name(function(node, inline, lvl, options) {
  var type = node.type, _node$displayName = node.displayName, displayName = _node$displayName === void 0 ? "" : _node$displayName, childrens = node.childrens, _node$props = node.props, props = _node$props === void 0 ? {} : _node$props, _node$defaultProps = node.defaultProps, defaultProps = _node$defaultProps === void 0 ? {} : _node$defaultProps;
  if (type !== "ReactElement") {
    throw new Error('The "formatReactElementNode" function could only format node of type "ReactElement". Given:  '.concat(type));
  }
  var filterProps3 = options.filterProps, maxInlineAttributesLineLength = options.maxInlineAttributesLineLength, showDefaultProps = options.showDefaultProps, sortProps = options.sortProps, tabStop = options.tabStop;
  var out = "<".concat(displayName);
  var outInlineAttr = out;
  var outMultilineAttr = out;
  var containsMultilineAttr = false;
  var visibleAttributeNames = [];
  var propFilter = createPropFilter(props, filterProps3);
  Object.keys(props).filter(propFilter).filter(onlyPropsWithOriginalValue(defaultProps, props)).forEach(function(propName) {
    return visibleAttributeNames.push(propName);
  });
  Object.keys(defaultProps).filter(propFilter).filter(function() {
    return showDefaultProps;
  }).filter(function(defaultPropName) {
    return !visibleAttributeNames.includes(defaultPropName);
  }).forEach(function(defaultPropName) {
    return visibleAttributeNames.push(defaultPropName);
  });
  var attributes = sortPropsByNames(sortProps)(visibleAttributeNames);
  attributes.forEach(function(attributeName) {
    var _formatProp = formatProp(attributeName, Object.keys(props).includes(attributeName), props[attributeName], Object.keys(defaultProps).includes(attributeName), defaultProps[attributeName], inline, lvl, options), attributeFormattedInline = _formatProp.attributeFormattedInline, attributeFormattedMultiline = _formatProp.attributeFormattedMultiline, isMultilineAttribute = _formatProp.isMultilineAttribute;
    if (isMultilineAttribute) {
      containsMultilineAttr = true;
    }
    outInlineAttr += attributeFormattedInline;
    outMultilineAttr += attributeFormattedMultiline;
  });
  outMultilineAttr += "\n".concat(spacer(lvl, tabStop));
  if (shouldRenderMultilineAttr(attributes, outInlineAttr, containsMultilineAttr, inline, lvl, tabStop, maxInlineAttributesLineLength)) {
    out = outMultilineAttr;
  } else {
    out = outInlineAttr;
  }
  if (childrens && childrens.length > 0) {
    var newLvl = lvl + 1;
    out += ">";
    if (!inline) {
      out += "\n";
      out += spacer(newLvl, tabStop);
    }
    out += childrens.reduce(mergeSiblingPlainStringChildrenReducer, []).map(formatOneChildren(inline, newLvl, options)).join(!inline ? "\n".concat(spacer(newLvl, tabStop)) : "");
    if (!inline) {
      out += "\n";
      out += spacer(newLvl - 1, tabStop);
    }
    out += "</".concat(displayName, ">");
  } else {
    if (!isInlineAttributeTooLong(attributes, outInlineAttr, lvl, tabStop, maxInlineAttributesLineLength)) {
      out += " ";
    }
    out += "/>";
  }
  return out;
}, "formatReactElementNode");
var REACT_FRAGMENT_TAG_NAME_SHORT_SYNTAX = "";
var REACT_FRAGMENT_TAG_NAME_EXPLICIT_SYNTAX = "React.Fragment";
var toReactElementTreeNode = /* @__PURE__ */ __name(function toReactElementTreeNode2(displayName, key, childrens) {
  var props = {};
  if (key) {
    props = {
      key
    };
  }
  return {
    type: "ReactElement",
    displayName,
    props,
    defaultProps: {},
    childrens
  };
}, "toReactElementTreeNode");
var isKeyedFragment = /* @__PURE__ */ __name(function isKeyedFragment2(_ref) {
  var key = _ref.key;
  return Boolean(key);
}, "isKeyedFragment");
var hasNoChildren = /* @__PURE__ */ __name(function hasNoChildren2(_ref2) {
  var childrens = _ref2.childrens;
  return childrens.length === 0;
}, "hasNoChildren");
var formatReactFragmentNode = /* @__PURE__ */ __name(function(node, inline, lvl, options) {
  var type = node.type, key = node.key, childrens = node.childrens;
  if (type !== "ReactFragment") {
    throw new Error('The "formatReactFragmentNode" function could only format node of type "ReactFragment". Given: '.concat(type));
  }
  var useFragmentShortSyntax = options.useFragmentShortSyntax;
  var displayName;
  if (useFragmentShortSyntax) {
    if (hasNoChildren(node) || isKeyedFragment(node)) {
      displayName = REACT_FRAGMENT_TAG_NAME_EXPLICIT_SYNTAX;
    } else {
      displayName = REACT_FRAGMENT_TAG_NAME_SHORT_SYNTAX;
    }
  } else {
    displayName = REACT_FRAGMENT_TAG_NAME_EXPLICIT_SYNTAX;
  }
  return formatReactElementNode(toReactElementTreeNode(displayName, key, childrens), inline, lvl, options);
}, "formatReactFragmentNode");
var jsxStopChars = ["<", ">", "{", "}"];
var shouldBeEscaped = /* @__PURE__ */ __name(function shouldBeEscaped2(s) {
  return jsxStopChars.some(function(jsxStopChar) {
    return s.includes(jsxStopChar);
  });
}, "shouldBeEscaped");
var escape2 = /* @__PURE__ */ __name(function escape3(s) {
  if (!shouldBeEscaped(s)) {
    return s;
  }
  return "{`".concat(s, "`}");
}, "escape");
var preserveTrailingSpace = /* @__PURE__ */ __name(function preserveTrailingSpace2(s) {
  var result = s;
  if (result.endsWith(" ")) {
    result = result.replace(/^(.*?)(\s+)$/, "$1{'$2'}");
  }
  if (result.startsWith(" ")) {
    result = result.replace(/^(\s+)(.*)$/, "{'$1'}$2");
  }
  return result;
}, "preserveTrailingSpace");
var formatTreeNode = /* @__PURE__ */ __name(function(node, inline, lvl, options) {
  if (node.type === "number") {
    return String(node.value);
  }
  if (node.type === "string") {
    return node.value ? "".concat(preserveTrailingSpace(escape2(String(node.value)))) : "";
  }
  if (node.type === "ReactElement") {
    return formatReactElementNode(node, inline, lvl, options);
  }
  if (node.type === "ReactFragment") {
    return formatReactFragmentNode(node, inline, lvl, options);
  }
  throw new TypeError('Unknow format type "'.concat(node.type, '"'));
}, "formatTreeNode");
var formatTree = /* @__PURE__ */ __name(function(node, options) {
  return formatTreeNode(node, false, 0, options);
}, "formatTree");
var reactElementToJsxString = /* @__PURE__ */ __name(function reactElementToJsxString2(element) {
  var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$filterProps = _ref.filterProps, filterProps3 = _ref$filterProps === void 0 ? [] : _ref$filterProps, _ref$showDefaultProps = _ref.showDefaultProps, showDefaultProps = _ref$showDefaultProps === void 0 ? true : _ref$showDefaultProps, _ref$showFunctions = _ref.showFunctions, showFunctions = _ref$showFunctions === void 0 ? false : _ref$showFunctions, functionValue = _ref.functionValue, _ref$tabStop = _ref.tabStop, tabStop = _ref$tabStop === void 0 ? 2 : _ref$tabStop, _ref$useBooleanShorth = _ref.useBooleanShorthandSyntax, useBooleanShorthandSyntax = _ref$useBooleanShorth === void 0 ? true : _ref$useBooleanShorth, _ref$useFragmentShort = _ref.useFragmentShortSyntax, useFragmentShortSyntax = _ref$useFragmentShort === void 0 ? true : _ref$useFragmentShort, _ref$sortProps = _ref.sortProps, sortProps = _ref$sortProps === void 0 ? true : _ref$sortProps, maxInlineAttributesLineLength = _ref.maxInlineAttributesLineLength, displayName = _ref.displayName;
  if (!element) {
    throw new Error("react-element-to-jsx-string: Expected a ReactElement");
  }
  var options = {
    filterProps: filterProps3,
    showDefaultProps,
    showFunctions,
    functionValue,
    tabStop,
    useBooleanShorthandSyntax,
    useFragmentShortSyntax,
    sortProps,
    maxInlineAttributesLineLength,
    displayName
  };
  return formatTree(_parseReactElement(element, options), options);
}, "reactElementToJsxString");

export {
  isMemo,
  isForwardRef,
  reactElementToJsxString
};
