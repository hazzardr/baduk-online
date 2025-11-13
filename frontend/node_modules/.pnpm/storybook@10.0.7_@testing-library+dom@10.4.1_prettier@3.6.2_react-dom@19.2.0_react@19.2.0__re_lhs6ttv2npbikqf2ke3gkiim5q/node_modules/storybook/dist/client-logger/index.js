import {
  __name
} from "../_browser-chunks/chunk-MM7DTO55.js";

// src/client-logger/index.ts
import { global } from "@storybook/global";
var { LOGLEVEL } = global;
var levels = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  silent: 10
};
var currentLogLevelString = LOGLEVEL;
var currentLogLevelNumber = levels[currentLogLevelString] || levels.info;
var logger = {
  trace: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber <= levels.trace) {
      console.trace(message, ...rest);
    }
  }, "trace"),
  debug: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber <= levels.debug) {
      console.debug(message, ...rest);
    }
  }, "debug"),
  info: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber <= levels.info) {
      console.info(message, ...rest);
    }
  }, "info"),
  warn: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber <= levels.warn) {
      console.warn(message, ...rest);
    }
  }, "warn"),
  error: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber <= levels.error) {
      console.error(message, ...rest);
    }
  }, "error"),
  log: /* @__PURE__ */ __name((message, ...rest) => {
    if (currentLogLevelNumber < levels.silent) {
      console.log(message, ...rest);
    }
  }, "log")
};
var logged = /* @__PURE__ */ new Set();
var once = /* @__PURE__ */ __name((type) => (message, ...rest) => {
  if (logged.has(message)) {
    return void 0;
  }
  logged.add(message);
  return logger[type](message, ...rest);
}, "once");
once.clear = () => logged.clear();
once.trace = once("trace");
once.debug = once("debug");
once.info = once("info");
once.warn = once("warn");
once.error = once("error");
once.log = once("log");
var deprecate = once("warn");
var pretty = /* @__PURE__ */ __name((type) => (...args) => {
  const argArray = [];
  if (args.length) {
    const startTagRe = /<span\s+style=(['"])([^'"]*)\1\s*>/gi;
    const endTagRe = /<\/span>/gi;
    let reResultArray;
    argArray.push(args[0].replace(startTagRe, "%c").replace(endTagRe, "%c"));
    while (reResultArray = startTagRe.exec(args[0])) {
      argArray.push(reResultArray[2]);
      argArray.push("");
    }
    for (let j = 1; j < args.length; j++) {
      argArray.push(args[j]);
    }
  }
  logger[type].apply(logger, argArray);
}, "pretty");
pretty.trace = pretty("trace");
pretty.debug = pretty("debug");
pretty.info = pretty("info");
pretty.warn = pretty("warn");
pretty.error = pretty("error");
export {
  deprecate,
  logger,
  once,
  pretty
};
