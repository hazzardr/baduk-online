import {
  require_memoizerific
} from "./chunk-NVV6MIOE.js";
import {
  dedent
} from "./chunk-OPCDBBL3.js";
import {
  __toESM
} from "./chunk-MM7DTO55.js";

// src/components/components/syntaxhighlighter/formatter.ts
var import_memoizerific = __toESM(require_memoizerific(), 1);
var formatter = (0, import_memoizerific.default)(2)(async (type, source) => {
  if (type === false) {
    return source;
  }
  return dedent(source);
});
export {
  formatter
};
