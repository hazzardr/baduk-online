import {
  require_main
} from "../_browser-chunks/chunk-Y3M7TW6K.js";
import {
  isEqual
} from "../_browser-chunks/chunk-ZNRFDIVA.js";
import "../_browser-chunks/chunk-AB7OOPUX.js";
import {
  isPlainObject
} from "../_browser-chunks/chunk-FSBVR7H5.js";
import {
  require_memoizerific
} from "../_browser-chunks/chunk-NVV6MIOE.js";
import {
  dedent
} from "../_browser-chunks/chunk-OPCDBBL3.js";
import {
  __name,
  __toESM
} from "../_browser-chunks/chunk-MM7DTO55.js";

// src/router/utils.ts
import { once } from "storybook/internal/client-logger";
var import_memoizerific = __toESM(require_memoizerific(), 1);
var import_picoquery = __toESM(require_main(), 1);
var splitPathRegex = /\/([^/]+)\/(?:(.*)_)?([^/]+)?/;
var parsePath = (0, import_memoizerific.default)(1e3)((path) => {
  const result = {
    viewMode: void 0,
    storyId: void 0,
    refId: void 0
  };
  if (path) {
    const [, viewMode, refId, storyId] = path.toLowerCase().match(splitPathRegex) || [];
    if (viewMode) {
      Object.assign(result, {
        viewMode,
        storyId,
        refId
      });
    }
  }
  return result;
});
var DEEPLY_EQUAL = Symbol("Deeply equal");
var deepDiff = /* @__PURE__ */ __name((value, update) => {
  if (typeof value !== typeof update) {
    return update;
  }
  if (isEqual(value, update)) {
    return DEEPLY_EQUAL;
  }
  if (Array.isArray(value) && Array.isArray(update)) {
    const res = update.reduce((acc, upd, index) => {
      const diff = deepDiff(value[index], upd);
      if (diff !== DEEPLY_EQUAL) {
        acc[index] = diff;
      }
      return acc;
    }, new Array(update.length));
    if (update.length >= value.length) {
      return res;
    }
    return res.concat(new Array(value.length - update.length).fill(void 0));
  }
  if (isPlainObject(value) && isPlainObject(update)) {
    return Object.keys({ ...value, ...update }).reduce((acc, key) => {
      const diff = deepDiff(value?.[key], update?.[key]);
      return diff === DEEPLY_EQUAL ? acc : Object.assign(acc, { [key]: diff });
    }, {});
  }
  return update;
}, "deepDiff");
var VALIDATION_REGEXP = /^[a-zA-Z0-9 _-]*$/;
var NUMBER_REGEXP = /^-?[0-9]+(\.[0-9]+)?$/;
var HEX_REGEXP = /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;
var COLOR_REGEXP = /^(rgba?|hsla?)\(([0-9]{1,3}),\s?([0-9]{1,3})%?,\s?([0-9]{1,3})%?,?\s?([0-9](\.[0-9]{1,2})?)?\)$/i;
var validateArgs = /* @__PURE__ */ __name((key = "", value) => {
  if (key === null) {
    return false;
  }
  if (key === "" || !VALIDATION_REGEXP.test(key)) {
    return false;
  }
  if (value === null || value === void 0) {
    return true;
  }
  if (value instanceof Date) {
    return true;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "string") {
    return VALIDATION_REGEXP.test(value) || NUMBER_REGEXP.test(value) || HEX_REGEXP.test(value) || COLOR_REGEXP.test(value);
  }
  if (Array.isArray(value)) {
    return value.every((v) => validateArgs(key, v));
  }
  if (isPlainObject(value)) {
    return Object.entries(value).every(([k, v]) => validateArgs(k, v));
  }
  return false;
}, "validateArgs");
var encodeSpecialValues = /* @__PURE__ */ __name((value) => {
  if (value === void 0) {
    return "!undefined";
  }
  if (value === null) {
    return "!null";
  }
  if (typeof value === "string") {
    if (HEX_REGEXP.test(value)) {
      return `!hex(${value.slice(1)})`;
    }
    if (COLOR_REGEXP.test(value)) {
      return `!${value.replace(/[\s%]/g, "")}`;
    }
    return value;
  }
  if (typeof value === "boolean") {
    return `!${value}`;
  }
  if (value instanceof Date) {
    return `!date(${value.toISOString()})`;
  }
  if (Array.isArray(value)) {
    return value.map(encodeSpecialValues);
  }
  if (isPlainObject(value)) {
    return Object.entries(value).reduce(
      (acc, [key, val]) => Object.assign(acc, { [key]: encodeSpecialValues(val) }),
      {}
    );
  }
  return value;
}, "encodeSpecialValues");
var decodeKnownQueryChar = /* @__PURE__ */ __name((chr) => {
  switch (chr) {
    case "%20":
      return "+";
    case "%5B":
      return "[";
    case "%5D":
      return "]";
    case "%2C":
      return ",";
    case "%3A":
      return ":";
  }
  return chr;
}, "decodeKnownQueryChar");
var knownQueryChar = /%[0-9A-F]{2}/g;
var buildArgsParam = /* @__PURE__ */ __name((initialArgs, args) => {
  const update = deepDiff(initialArgs, args);
  if (!update || update === DEEPLY_EQUAL) {
    return "";
  }
  const object = Object.entries(update).reduce((acc, [key, value]) => {
    if (validateArgs(key, value)) {
      return Object.assign(acc, { [key]: value });
    }
    once.warn(dedent`
      Omitted potentially unsafe URL args.

      More info: https://storybook.js.org/docs/writing-stories/args?ref=error#setting-args-through-the-url
    `);
    return acc;
  }, {});
  return (0, import_picoquery.stringify)(encodeSpecialValues(object), {
    delimiter: ";",
    // we don't actually create multiple query params
    nesting: true,
    nestingSyntax: "js"
    // encode objects using dot notation: obj.key=val
  }).replace(knownQueryChar, decodeKnownQueryChar).split(";").map((part) => part.replace("=", ":")).join(";");
}, "buildArgsParam");
var queryFromString = (0, import_memoizerific.default)(1e3)((s) => s !== void 0 ? (0, import_picoquery.parse)(s) : {});
var queryFromLocation = /* @__PURE__ */ __name((location) => {
  return queryFromString(location.search ? location.search.slice(1) : "");
}, "queryFromLocation");
var stringifyQuery = /* @__PURE__ */ __name((query) => {
  const queryStr = (0, import_picoquery.stringify)(query);
  return queryStr ? "?" + queryStr : "";
}, "stringifyQuery");
var getMatch = (0, import_memoizerific.default)(1e3)((current, target, startsWith = true) => {
  if (startsWith) {
    if (typeof target !== "string") {
      throw new Error("startsWith only works with string targets");
    }
    const startsWithTarget = current && current.startsWith(target);
    if (startsWithTarget) {
      return { path: current };
    }
    return null;
  }
  const currentIsTarget = typeof target === "string" && current === target;
  const matchTarget = current && target && current.match(target);
  if (currentIsTarget || matchTarget) {
    return { path: current };
  }
  return null;
});

// src/router/router.tsx
import React3, { useCallback as useCallback3 } from "react";
import { global } from "@storybook/global";

// ../node_modules/react-router-dom/dist/index.js
import * as React2 from "react";

// ../node_modules/react-router/dist/index.js
import * as React from "react";

// ../node_modules/@remix-run/router/dist/router.js
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
__name(_extends, "_extends");
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
var PopStateEventType = "popstate";
function createBrowserHistory(options) {
  if (options === void 0) {
    options = {};
  }
  function createBrowserLocation(window2, globalHistory) {
    let {
      pathname,
      search,
      hash
    } = window2.location;
    return createLocation(
      "",
      {
        pathname,
        search,
        hash
      },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  __name(createBrowserLocation, "createBrowserLocation");
  function createBrowserHref(window2, to) {
    return typeof to === "string" ? to : createPath(to);
  }
  __name(createBrowserHref, "createBrowserHref");
  return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}
__name(createBrowserHistory, "createBrowserHistory");
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
__name(invariant, "invariant");
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
__name(warning, "warning");
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
__name(createKey, "createKey");
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
__name(getHistoryState, "getHistoryState");
function createLocation(current, to, state, key) {
  if (state === void 0) {
    state = null;
  }
  let location = _extends({
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: ""
  }, typeof to === "string" ? parsePath2(to) : to, {
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  });
  return location;
}
__name(createLocation, "createLocation");
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
__name(createPath, "createPath");
function parsePath2(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
__name(parsePath2, "parsePath");
function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
  if (options === void 0) {
    options = {};
  }
  let {
    window: window2 = document.defaultView,
    v5Compat = false
  } = options;
  let globalHistory = window2.history;
  let action = Action.Pop;
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function getIndex() {
    let state = globalHistory.state || {
      idx: null
    };
    return state.idx;
  }
  __name(getIndex, "getIndex");
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({
        action,
        location: history.location,
        delta
      });
    }
  }
  __name(handlePop, "handlePop");
  function push(to, state) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 1
      });
    }
  }
  __name(push, "push");
  function replace(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 0
      });
    }
  }
  __name(replace, "replace");
  function createURL(to) {
    let base = window2.location.origin !== "null" ? window2.location.origin : window2.location.href;
    let href = typeof to === "string" ? to : createPath(to);
    invariant(base, "No window.location.(origin|href) available to create URL for href: " + href);
    return new URL(href, base);
  }
  __name(createURL, "createURL");
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
__name(getUrlBasedHistory, "getUrlBasedHistory");
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
__name(stripBasename, "stripBasename");
function resolvePath(to, fromPathname) {
  if (fromPathname === void 0) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath2(to) : to;
  let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
__name(resolvePath, "resolvePath");
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
__name(resolvePathname, "resolvePathname");
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
__name(getInvalidPathError, "getInvalidPathError");
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
__name(getPathContributingMatches, "getPathContributingMatches");
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === void 0) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath2(toArg);
  } else {
    to = _extends({}, toArg);
    invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (isPathRelative || toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
__name(resolveTo, "resolveTo");
var joinPaths = /* @__PURE__ */ __name((paths) => paths.join("/").replace(/\/\/+/g, "/"), "joinPaths");
var normalizeSearch = /* @__PURE__ */ __name((search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search, "normalizeSearch");
var normalizeHash = /* @__PURE__ */ __name((hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash, "normalizeHash");
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
__name(isRouteErrorResponse, "isRouteErrorResponse");
var validMutationMethodsArr = ["post", "put", "patch", "delete"];
var validMutationMethods = new Set(validMutationMethodsArr);
var validRequestMethodsArr = ["get", ...validMutationMethodsArr];
var validRequestMethods = new Set(validRequestMethodsArr);
var UNSAFE_DEFERRED_SYMBOL = Symbol("deferred");

// ../node_modules/react-router/dist/index.js
function _extends2() {
  _extends2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends2.apply(this, arguments);
}
__name(_extends2, "_extends");
var DataRouterContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  DataRouterContext.displayName = "DataRouter";
}
var DataRouterStateContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  DataRouterStateContext.displayName = "DataRouterState";
}
var AwaitContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  AwaitContext.displayName = "Await";
}
var NavigationContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  NavigationContext.displayName = "Navigation";
}
var LocationContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  LocationContext.displayName = "Location";
}
var RouteContext = React.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
if (process.env.NODE_ENV !== "production") {
  RouteContext.displayName = "Route";
}
var RouteErrorContext = React.createContext(null);
if (process.env.NODE_ENV !== "production") {
  RouteErrorContext.displayName = "RouteError";
}
function useHref(to, _temp) {
  let {
    relative
  } = _temp === void 0 ? {} : _temp;
  !useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useHref() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  let {
    basename,
    navigator
  } = React.useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to, {
    relative
  });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}
__name(useHref, "useHref");
function useInRouterContext() {
  return React.useContext(LocationContext) != null;
}
__name(useInRouterContext, "useInRouterContext");
function useLocation() {
  !useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useLocation() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  return React.useContext(LocationContext).location;
}
__name(useLocation, "useLocation");
var navigateEffectWarning = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function useIsomorphicLayoutEffect(cb) {
  let isStatic = React.useContext(NavigationContext).static;
  if (!isStatic) {
    React.useLayoutEffect(cb);
  }
}
__name(useIsomorphicLayoutEffect, "useIsomorphicLayoutEffect");
function useNavigate() {
  let {
    isDataRoute
  } = React.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
__name(useNavigate, "useNavigate");
function useNavigateUnstable() {
  !useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(
    false,
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    "useNavigate() may be used only in the context of a <Router> component."
  ) : invariant(false) : void 0;
  let dataRouterContext = React.useContext(DataRouterContext);
  let {
    basename,
    navigator
  } = React.useContext(NavigationContext);
  let {
    matches
  } = React.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getPathContributingMatches(matches).map((match) => match.pathnameBase));
  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    process.env.NODE_ENV !== "production" ? warning(activeRef.current, navigateEffectWarning) : void 0;
    if (!activeRef.current) return;
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }
    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }
    (!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
  }, [basename, navigator, routePathnamesJson, locationPathname, dataRouterContext]);
  return navigate;
}
__name(useNavigateUnstable, "useNavigateUnstable");
var OutletContext = React.createContext(null);
function useResolvedPath(to, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    matches
  } = React.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getPathContributingMatches(matches).map((match) => match.pathnameBase));
  return React.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [to, routePathnamesJson, locationPathname, relative]);
}
__name(useResolvedPath, "useResolvedPath");
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? error.status + " " + error.statusText : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let codeStyles = {
    padding: "2px 4px",
    backgroundColor: lightgrey
  };
  let devInfo = null;
  if (process.env.NODE_ENV !== "production") {
    console.error("Error handled by React Router default ErrorBoundary:", error);
    devInfo = React.createElement(React.Fragment, null, React.createElement("p", null, "\u{1F4BF} Hey developer \u{1F44B}"), React.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", React.createElement("code", {
      style: codeStyles
    }, "ErrorBoundary"), " or", " ", React.createElement("code", {
      style: codeStyles
    }, "errorElement"), " prop on your route."));
  }
  return React.createElement(React.Fragment, null, React.createElement("h2", null, "Unexpected Application Error!"), React.createElement("h3", {
    style: {
      fontStyle: "italic"
    }
  }, message), stack ? React.createElement("pre", {
    style: preStyles
  }, stack) : null, devInfo);
}
__name(DefaultErrorComponent, "DefaultErrorComponent");
var defaultErrorElement = React.createElement(DefaultErrorComponent, null);
var DataRouterHook = function(DataRouterHook3) {
  DataRouterHook3["UseBlocker"] = "useBlocker";
  DataRouterHook3["UseRevalidator"] = "useRevalidator";
  DataRouterHook3["UseNavigateStable"] = "useNavigate";
  return DataRouterHook3;
}(DataRouterHook || {});
var DataRouterStateHook = function(DataRouterStateHook3) {
  DataRouterStateHook3["UseBlocker"] = "useBlocker";
  DataRouterStateHook3["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook3["UseActionData"] = "useActionData";
  DataRouterStateHook3["UseRouteError"] = "useRouteError";
  DataRouterStateHook3["UseNavigation"] = "useNavigation";
  DataRouterStateHook3["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook3["UseMatches"] = "useMatches";
  DataRouterStateHook3["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook3["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook3["UseRouteId"] = "useRouteId";
  return DataRouterStateHook3;
}(DataRouterStateHook || {});
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
__name(getDataRouterConsoleError, "getDataRouterConsoleError");
function useDataRouterContext(hookName) {
  let ctx = React.useContext(DataRouterContext);
  !ctx ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return ctx;
}
__name(useDataRouterContext, "useDataRouterContext");
function useDataRouterState(hookName) {
  let state = React.useContext(DataRouterStateContext);
  !state ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return state;
}
__name(useDataRouterState, "useDataRouterState");
function useRouteContext(hookName) {
  let route = React.useContext(RouteContext);
  !route ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError(hookName)) : invariant(false) : void 0;
  return route;
}
__name(useRouteContext, "useRouteContext");
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ? process.env.NODE_ENV !== "production" ? invariant(false, hookName + ' can only be used on routes that contain a unique "id"') : invariant(false) : void 0;
  return thisRoute.route.id;
}
__name(useCurrentRouteId, "useCurrentRouteId");
function useRouteId() {
  return useCurrentRouteId(DataRouterStateHook.UseRouteId);
}
__name(useRouteId, "useRouteId");
function useNavigation() {
  let state = useDataRouterState(DataRouterStateHook.UseNavigation);
  return state.navigation;
}
__name(useNavigation, "useNavigation");
function useMatches() {
  let {
    matches,
    loaderData
  } = useDataRouterState(DataRouterStateHook.UseMatches);
  return React.useMemo(() => matches.map((match) => {
    let {
      pathname,
      params
    } = match;
    return {
      id: match.route.id,
      pathname,
      params,
      data: loaderData[match.route.id],
      handle: match.route.handle
    };
  }), [matches, loaderData]);
}
__name(useMatches, "useMatches");
function useRouteError() {
  var _state$errors;
  let error = React.useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterStateHook.UseRouteError);
  let routeId = useCurrentRouteId(DataRouterStateHook.UseRouteError);
  if (error) {
    return error;
  }
  return (_state$errors = state.errors) == null ? void 0 : _state$errors[routeId];
}
__name(useRouteError, "useRouteError");
function useNavigateStable() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseNavigateStable);
  let id = useCurrentRouteId(DataRouterStateHook.UseNavigateStable);
  let activeRef = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    process.env.NODE_ENV !== "production" ? warning(activeRef.current, navigateEffectWarning) : void 0;
    if (!activeRef.current) return;
    if (typeof to === "number") {
      router.navigate(to);
    } else {
      router.navigate(to, _extends2({
        fromRouteId: id
      }, options));
    }
  }, [router, id]);
  return navigate;
}
__name(useNavigateStable, "useNavigateStable");
var START_TRANSITION = "startTransition";
var startTransitionImpl = React[START_TRANSITION];
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = Action.Pop,
    navigator,
    static: staticProp = false
  } = _ref5;
  !!useInRouterContext() ? process.env.NODE_ENV !== "production" ? invariant(false, "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.") : invariant(false) : void 0;
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React.useMemo(() => ({
    basename,
    navigator,
    static: staticProp
  }), [basename, navigator, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = parsePath2(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  process.env.NODE_ENV !== "production" ? warning(locationContext != null, '<Router basename="' + basename + '"> is not able to match the URL ' + ('"' + pathname + search + hash + '" because it does not start with the ') + "basename, so the <Router> won't render anything.") : void 0;
  if (locationContext == null) {
    return null;
  }
  return React.createElement(NavigationContext.Provider, {
    value: navigationContext
  }, React.createElement(LocationContext.Provider, {
    children,
    value: locationContext
  }));
}
__name(Router, "Router");
var AwaitRenderStatus = function(AwaitRenderStatus2) {
  AwaitRenderStatus2[AwaitRenderStatus2["pending"] = 0] = "pending";
  AwaitRenderStatus2[AwaitRenderStatus2["success"] = 1] = "success";
  AwaitRenderStatus2[AwaitRenderStatus2["error"] = 2] = "error";
  return AwaitRenderStatus2;
}(AwaitRenderStatus || {});
var neverSettledPromise = new Promise(() => {
});

// ../node_modules/react-router-dom/dist/index.js
function _extends3() {
  _extends3 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends3.apply(this, arguments);
}
__name(_extends3, "_extends");
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
__name(_objectWithoutPropertiesLoose, "_objectWithoutPropertiesLoose");
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
__name(isHtmlElement, "isHtmlElement");
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
__name(isButtonElement, "isButtonElement");
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
__name(isFormElement, "isFormElement");
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
__name(isInputElement, "isInputElement");
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
__name(isModifiedEvent, "isModifiedEvent");
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
__name(shouldProcessLinkClick, "shouldProcessLinkClick");
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
__name(isFormDataSubmitterSupported, "isFormDataSubmitterSupported");
var supportedFormEncTypes = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    process.env.NODE_ENV !== "production" ? warning(false, '"' + encType + '" is not a valid `encType` for `<Form>`/`<fetcher.Form>` ' + ('and will default to "' + defaultEncType + '"')) : void 0;
    return null;
  }
  return encType;
}
__name(getFormEncType, "getFormEncType");
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}
__name(getFormSubmissionInfo, "getFormSubmissionInfo");
var _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset"];
var _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "children"];
var _excluded3 = ["reloadDocument", "replace", "state", "method", "action", "onSubmit", "submit", "relative", "preventScrollReset"];
var START_TRANSITION2 = "startTransition";
var startTransitionImpl2 = React2[START_TRANSITION2];
function BrowserRouter(_ref) {
  let {
    basename,
    children,
    future,
    window: window2
  } = _ref;
  let historyRef = React2.useRef();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({
      window: window2,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = React2.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React2.useCallback((newState) => {
    v7_startTransition && startTransitionImpl2 ? startTransitionImpl2(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React2.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return React2.createElement(Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
__name(BrowserRouter, "BrowserRouter");
function HistoryRouter(_ref3) {
  let {
    basename,
    children,
    future,
    history
  } = _ref3;
  let [state, setStateImpl] = React2.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = React2.useCallback((newState) => {
    v7_startTransition && startTransitionImpl2 ? startTransitionImpl2(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  React2.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return React2.createElement(Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
__name(HistoryRouter, "HistoryRouter");
if (process.env.NODE_ENV !== "production") {
  HistoryRouter.displayName = "unstable_HistoryRouter";
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = React2.forwardRef(/* @__PURE__ */ __name(function LinkWithRef(_ref4, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace,
    state,
    target,
    to,
    preventScrollReset
  } = _ref4, rest = _objectWithoutPropertiesLoose(_ref4, _excluded);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        process.env.NODE_ENV !== "production" ? warning(false, '<Link to="' + to + '"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.') : void 0;
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
    preventScrollReset,
    relative
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  __name(handleClick, "handleClick");
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    React2.createElement("a", _extends3({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
}, "LinkWithRef"));
if (process.env.NODE_ENV !== "production") {
  Link.displayName = "Link";
}
var NavLink = React2.forwardRef(/* @__PURE__ */ __name(function NavLinkWithRef(_ref5, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    children
  } = _ref5, rest = _objectWithoutPropertiesLoose(_ref5, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = React2.useContext(DataRouterStateContext);
  let {
    navigator
  } = React2.useContext(NavigationContext);
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp({
      isActive,
      isPending
    });
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp({
    isActive,
    isPending
  }) : styleProp;
  return React2.createElement(Link, _extends3({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to
  }), typeof children === "function" ? children({
    isActive,
    isPending
  }) : children);
}, "NavLinkWithRef"));
if (process.env.NODE_ENV !== "production") {
  NavLink.displayName = "NavLink";
}
var Form = React2.forwardRef((props, ref) => {
  let submit = useSubmit();
  return React2.createElement(FormImpl, _extends3({}, props, {
    submit,
    ref
  }));
});
if (process.env.NODE_ENV !== "production") {
  Form.displayName = "Form";
}
var FormImpl = React2.forwardRef((_ref6, forwardedRef) => {
  let {
    reloadDocument,
    replace,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    submit,
    relative,
    preventScrollReset
  } = _ref6, props = _objectWithoutPropertiesLoose(_ref6, _excluded3);
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let formAction = useFormAction(action, {
    relative
  });
  let submitHandler = /* @__PURE__ */ __name((event) => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      method: submitMethod,
      replace,
      state,
      relative,
      preventScrollReset
    });
  }, "submitHandler");
  return React2.createElement("form", _extends3({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (process.env.NODE_ENV !== "production") {
  FormImpl.displayName = "FormImpl";
}
function ScrollRestoration(_ref7) {
  let {
    getKey,
    storageKey
  } = _ref7;
  useScrollRestoration({
    getKey,
    storageKey
  });
  return null;
}
__name(ScrollRestoration, "ScrollRestoration");
if (process.env.NODE_ENV !== "production") {
  ScrollRestoration.displayName = "ScrollRestoration";
}
var DataRouterHook2;
(function(DataRouterHook3) {
  DataRouterHook3["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook3["UseSubmit"] = "useSubmit";
  DataRouterHook3["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook3["UseFetcher"] = "useFetcher";
})(DataRouterHook2 || (DataRouterHook2 = {}));
var DataRouterStateHook2;
(function(DataRouterStateHook3) {
  DataRouterStateHook3["UseFetchers"] = "useFetchers";
  DataRouterStateHook3["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook2 || (DataRouterStateHook2 = {}));
function getDataRouterConsoleError2(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
__name(getDataRouterConsoleError2, "getDataRouterConsoleError");
function useDataRouterContext2(hookName) {
  let ctx = React2.useContext(DataRouterContext);
  !ctx ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError2(hookName)) : invariant(false) : void 0;
  return ctx;
}
__name(useDataRouterContext2, "useDataRouterContext");
function useDataRouterState2(hookName) {
  let state = React2.useContext(DataRouterStateContext);
  !state ? process.env.NODE_ENV !== "production" ? invariant(false, getDataRouterConsoleError2(hookName)) : invariant(false) : void 0;
  return state;
}
__name(useDataRouterState2, "useDataRouterState");
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative
  } = _temp === void 0 ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return React2.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace,
        state,
        preventScrollReset,
        relative
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative]);
}
__name(useLinkClickHandler, "useLinkClickHandler");
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. Try calling submit within a `useEffect` or callback instead.");
  }
}
__name(validateClientSideSubmission, "validateClientSideSubmission");
function useSubmit() {
  let {
    router
  } = useDataRouterContext2(DataRouterHook2.UseSubmit);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  return React2.useCallback(function(target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    router.navigate(options.action || action, {
      preventScrollReset: options.preventScrollReset,
      formData,
      body,
      formMethod: options.method || method,
      formEncType: options.encType || encType,
      replace: options.replace,
      state: options.state,
      fromRouteId: currentRouteId
    });
  }, [router, basename, currentRouteId]);
}
__name(useSubmit, "useSubmit");
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = React2.useContext(NavigationContext);
  let routeContext = React2.useContext(RouteContext);
  !routeContext ? process.env.NODE_ENV !== "production" ? invariant(false, "useFormAction must be used inside a RouteContext") : invariant(false) : void 0;
  let [match] = routeContext.matches.slice(-1);
  let path = _extends3({}, useResolvedPath(action ? action : ".", {
    relative
  }));
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    if (match.route.index) {
      let params = new URLSearchParams(path.search);
      params.delete("index");
      path.search = params.toString() ? "?" + params.toString() : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
__name(useFormAction, "useFormAction");
var SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
var savedScrollPositions = {};
function useScrollRestoration(_temp3) {
  let {
    getKey,
    storageKey
  } = _temp3 === void 0 ? {} : _temp3;
  let {
    router
  } = useDataRouterContext2(DataRouterHook2.UseScrollRestoration);
  let {
    restoreScrollPosition,
    preventScrollReset
  } = useDataRouterState2(DataRouterStateHook2.UseScrollRestoration);
  let {
    basename
  } = React2.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();
  React2.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  usePageHide(React2.useCallback(() => {
    if (navigation.state === "idle") {
      let key = (getKey ? getKey(location, matches) : null) || location.key;
      savedScrollPositions[key] = window.scrollY;
    }
    sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
    window.history.scrollRestoration = "auto";
  }, [storageKey, getKey, navigation.state, location, matches]));
  if (typeof document !== "undefined") {
    React2.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
      }
    }, [storageKey]);
    React2.useLayoutEffect(() => {
      let getKeyWithoutBasename = getKey && basename !== "/" ? (location2, matches2) => getKey(
        // Strip the basename to match useLocation()
        _extends3({}, location2, {
          pathname: stripBasename(location2.pathname, basename) || location2.pathname
        }),
        matches2
      ) : getKey;
      let disableScrollRestoration = router == null ? void 0 : router.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKeyWithoutBasename);
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    React2.useLayoutEffect(() => {
      if (restoreScrollPosition === false) {
        return;
      }
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      if (location.hash) {
        let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) {
          el.scrollIntoView();
          return;
        }
      }
      if (preventScrollReset === true) {
        return;
      }
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
__name(useScrollRestoration, "useScrollRestoration");
function usePageHide(callback, options) {
  let {
    capture
  } = options || {};
  React2.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : void 0;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
__name(usePageHide, "usePageHide");

// src/router/router.tsx
var { document: document2 } = global;
var getBase = /* @__PURE__ */ __name(() => `${document2.location.pathname}?`, "getBase");
var useNavigate2 = /* @__PURE__ */ __name(() => {
  const navigate = useNavigate();
  return useCallback3((to, { plain, ...options } = {}) => {
    if (typeof to === "string" && to.startsWith("#")) {
      if (to === "#") {
        navigate(document2.location.search);
      } else {
        document2.location.hash = to;
      }
      return void 0;
    }
    if (typeof to === "string") {
      const target = plain ? to : `?path=${to}`;
      return navigate(target, options);
    }
    if (typeof to === "number") {
      return navigate(to);
    }
    return void 0;
  }, []);
}, "useNavigate");
var Link2 = /* @__PURE__ */ __name(({ to, children, ...rest }) => React3.createElement(Link, { to: `${getBase()}path=${to}`, ...rest }, children), "Link");
Link2.displayName = "QueryLink";
var Location = /* @__PURE__ */ __name(({ children }) => {
  const location = useLocation();
  const { path, singleStory } = queryFromLocation(location);
  const { viewMode, storyId, refId } = parsePath(path);
  return React3.createElement(React3.Fragment, null, children({
    path: path || "/",
    location,
    viewMode,
    storyId,
    refId,
    singleStory: singleStory === "true"
  }));
}, "Location");
Location.displayName = "QueryLocation";
function Match({
  children,
  path: targetPath,
  startsWith = false
}) {
  return React3.createElement(Location, null, ({ path: urlPath, ...rest }) => children({
    match: getMatch(urlPath, targetPath, startsWith),
    ...rest
  }));
}
__name(Match, "Match");
Match.displayName = "QueryMatch";
function Route2(input) {
  const { children, ...rest } = input;
  if (rest.startsWith === void 0) {
    rest.startsWith = false;
  }
  const matchProps = rest;
  return React3.createElement(Match, { ...matchProps }, ({ match }) => match ? children : null);
}
__name(Route2, "Route");
Route2.displayName = "Route";
var LocationProvider = /* @__PURE__ */ __name((...args) => BrowserRouter(...args), "LocationProvider");
var BaseLocationProvider = /* @__PURE__ */ __name((...args) => Router(...args), "BaseLocationProvider");
export {
  BaseLocationProvider,
  DEEPLY_EQUAL,
  Link2 as Link,
  Location,
  LocationProvider,
  Match,
  Route2 as Route,
  buildArgsParam,
  deepDiff,
  getMatch,
  parsePath,
  queryFromLocation,
  stringifyQuery,
  useNavigate2 as useNavigate
};
