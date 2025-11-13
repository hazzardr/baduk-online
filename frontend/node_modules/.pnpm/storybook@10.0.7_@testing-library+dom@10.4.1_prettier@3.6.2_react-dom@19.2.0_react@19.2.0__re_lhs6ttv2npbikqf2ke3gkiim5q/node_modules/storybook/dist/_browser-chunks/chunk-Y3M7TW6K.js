import {
  __commonJS,
  __name
} from "./chunk-MM7DTO55.js";

// ../node_modules/picoquery/lib/string-util.js
var require_string_util = __commonJS({
  "../node_modules/picoquery/lib/string-util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodeString = encodeString;
    var hexTable = Array.from({ length: 256 }, (_, i) => "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
    var noEscape = new Int8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      0
    ]);
    function encodeString(str) {
      const len = str.length;
      if (len === 0) {
        return "";
      }
      let out = "";
      let lastPos = 0;
      let i = 0;
      outer: for (; i < len; i++) {
        let c = str.charCodeAt(i);
        while (c < 128) {
          if (noEscape[c] !== 1) {
            if (lastPos < i)
              out += str.slice(lastPos, i);
            lastPos = i + 1;
            out += hexTable[c];
          }
          if (++i === len)
            break outer;
          c = str.charCodeAt(i);
        }
        if (lastPos < i)
          out += str.slice(lastPos, i);
        if (c < 2048) {
          lastPos = i + 1;
          out += hexTable[192 | c >> 6] + hexTable[128 | c & 63];
          continue;
        }
        if (c < 55296 || c >= 57344) {
          lastPos = i + 1;
          out += hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
          continue;
        }
        ++i;
        if (i >= len) {
          throw new Error("URI malformed");
        }
        const c2 = str.charCodeAt(i) & 1023;
        lastPos = i + 1;
        c = 65536 + ((c & 1023) << 10 | c2);
        out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
      }
      if (lastPos === 0)
        return str;
      if (lastPos < len)
        return out + str.slice(lastPos);
      return out;
    }
    __name(encodeString, "encodeString");
  }
});

// ../node_modules/picoquery/lib/shared.js
var require_shared = __commonJS({
  "../node_modules/picoquery/lib/shared.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultOptions = exports.defaultShouldSerializeObject = exports.defaultValueSerializer = void 0;
    var string_util_js_1 = require_string_util();
    var defaultValueSerializer = /* @__PURE__ */ __name((value) => {
      switch (typeof value) {
        case "string":
          return (0, string_util_js_1.encodeString)(value);
        case "bigint":
        case "boolean":
          return "" + value;
        case "number":
          if (Number.isFinite(value)) {
            return value < 1e21 ? "" + value : (0, string_util_js_1.encodeString)("" + value);
          }
          break;
      }
      if (value instanceof Date) {
        return (0, string_util_js_1.encodeString)(value.toISOString());
      }
      return "";
    }, "defaultValueSerializer");
    exports.defaultValueSerializer = defaultValueSerializer;
    var defaultShouldSerializeObject = /* @__PURE__ */ __name((val) => {
      return val instanceof Date;
    }, "defaultShouldSerializeObject");
    exports.defaultShouldSerializeObject = defaultShouldSerializeObject;
    var identityFunc = /* @__PURE__ */ __name((v) => v, "identityFunc");
    exports.defaultOptions = {
      nesting: true,
      nestingSyntax: "dot",
      arrayRepeat: false,
      arrayRepeatSyntax: "repeat",
      delimiter: 38,
      valueDeserializer: identityFunc,
      valueSerializer: exports.defaultValueSerializer,
      keyDeserializer: identityFunc,
      shouldSerializeObject: exports.defaultShouldSerializeObject
    };
  }
});

// ../node_modules/picoquery/lib/object-util.js
var require_object_util = __commonJS({
  "../node_modules/picoquery/lib/object-util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDeepObject = getDeepObject;
    exports.stringifyObject = stringifyObject;
    var shared_js_1 = require_shared();
    var string_util_js_1 = require_string_util();
    function isPrototypeKey(value) {
      return value === "__proto__" || value === "constructor" || value === "prototype";
    }
    __name(isPrototypeKey, "isPrototypeKey");
    function getDeepObject(obj, key, nextKey, forceObject, forceArray) {
      if (isPrototypeKey(key))
        return obj;
      const currObj = obj[key];
      if (typeof currObj === "object" && currObj !== null) {
        return currObj;
      }
      if (!forceObject && (forceArray || typeof nextKey === "number" || typeof nextKey === "string" && nextKey * 0 === 0 && nextKey.indexOf(".") === -1)) {
        return obj[key] = [];
      }
      return obj[key] = {};
    }
    __name(getDeepObject, "getDeepObject");
    var MAX_DEPTH = 20;
    var strBracketPair = "[]";
    var strBracketLeft = "[";
    var strBracketRight = "]";
    var strDot = ".";
    function stringifyObject(obj, options, depth = 0, parentKey, isProbableArray) {
      const { nestingSyntax = shared_js_1.defaultOptions.nestingSyntax, arrayRepeat = shared_js_1.defaultOptions.arrayRepeat, arrayRepeatSyntax = shared_js_1.defaultOptions.arrayRepeatSyntax, nesting = shared_js_1.defaultOptions.nesting, delimiter = shared_js_1.defaultOptions.delimiter, valueSerializer = shared_js_1.defaultOptions.valueSerializer, shouldSerializeObject = shared_js_1.defaultOptions.shouldSerializeObject } = options;
      const strDelimiter = typeof delimiter === "number" ? String.fromCharCode(delimiter) : delimiter;
      const useArrayRepeatKey = isProbableArray === true && arrayRepeat;
      const shouldUseDot = nestingSyntax === "dot" || nestingSyntax === "js" && !isProbableArray;
      if (depth > MAX_DEPTH) {
        return "";
      }
      let result = "";
      let firstKey = true;
      let valueIsProbableArray = false;
      for (const key in obj) {
        const value = obj[key];
        if (value === void 0) {
          continue;
        }
        let path;
        if (parentKey) {
          path = parentKey;
          if (useArrayRepeatKey) {
            if (arrayRepeatSyntax === "bracket") {
              path += strBracketPair;
            }
          } else if (shouldUseDot) {
            path += strDot;
            path += key;
          } else {
            path += strBracketLeft;
            path += key;
            path += strBracketRight;
          }
        } else {
          path = key;
        }
        if (!firstKey) {
          result += strDelimiter;
        }
        if (typeof value === "object" && value !== null && !shouldSerializeObject(value)) {
          valueIsProbableArray = value.pop !== void 0;
          if (nesting || arrayRepeat && valueIsProbableArray) {
            result += stringifyObject(value, options, depth + 1, path, valueIsProbableArray);
          }
        } else {
          result += (0, string_util_js_1.encodeString)(path);
          result += "=";
          result += valueSerializer(value, key);
        }
        if (firstKey) {
          firstKey = false;
        }
      }
      return result;
    }
    __name(stringifyObject, "stringifyObject");
  }
});

// ../node_modules/picoquery/lib/decode-uri-component.js
var require_decode_uri_component = __commonJS({
  "../node_modules/picoquery/lib/decode-uri-component.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeURIComponent = decodeURIComponent;
    var UTF8_ACCEPT = 12;
    var UTF8_REJECT = 0;
    var UTF8_DATA = [
      // The first part of the table maps bytes to character to a transition.
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      4,
      4,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      6,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      7,
      8,
      7,
      7,
      10,
      9,
      9,
      9,
      11,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      // The second part of the table maps a state to a new state when adding a
      // transition.
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      12,
      0,
      0,
      0,
      0,
      24,
      36,
      48,
      60,
      72,
      84,
      96,
      0,
      12,
      12,
      12,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      24,
      24,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      48,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // The third part maps the current transition to a mask that needs to apply
      // to the byte.
      127,
      63,
      63,
      63,
      0,
      31,
      15,
      15,
      15,
      7,
      7,
      7
    ];
    function decodeURIComponent(uri) {
      let percentPosition = uri.indexOf("%");
      if (percentPosition === -1) {
        return uri;
      }
      const length = uri.length;
      let decoded = "";
      let last = 0;
      let codepoint = 0;
      let startOfOctets = percentPosition;
      let state = UTF8_ACCEPT;
      while (percentPosition > -1 && percentPosition < length) {
        const high = hexCodeToInt(uri[percentPosition + 1], 4);
        const low = hexCodeToInt(uri[percentPosition + 2], 0);
        const byte = high | low;
        const type = UTF8_DATA[byte];
        state = UTF8_DATA[256 + state + type];
        codepoint = codepoint << 6 | byte & UTF8_DATA[364 + type];
        if (state === UTF8_ACCEPT) {
          decoded += uri.slice(last, startOfOctets);
          decoded += codepoint <= 65535 ? String.fromCharCode(codepoint) : String.fromCharCode(55232 + (codepoint >> 10), 56320 + (codepoint & 1023));
          codepoint = 0;
          last = percentPosition + 3;
          percentPosition = startOfOctets = uri.indexOf("%", last);
        } else if (state === UTF8_REJECT) {
          return null;
        } else {
          percentPosition += 3;
          if (percentPosition < length && uri.charCodeAt(percentPosition) === 37)
            continue;
          return null;
        }
      }
      return decoded + uri.slice(last);
    }
    __name(decodeURIComponent, "decodeURIComponent");
    var HEX = {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      a: 10,
      A: 10,
      b: 11,
      B: 11,
      c: 12,
      C: 12,
      d: 13,
      D: 13,
      e: 14,
      E: 14,
      f: 15,
      F: 15
    };
    function hexCodeToInt(c, shift) {
      const i = HEX[c];
      return i === void 0 ? 255 : i << shift;
    }
    __name(hexCodeToInt, "hexCodeToInt");
  }
});

// ../node_modules/picoquery/lib/parse.js
var require_parse = __commonJS({
  "../node_modules/picoquery/lib/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.numberValueDeserializer = exports.numberKeyDeserializer = void 0;
    exports.parse = parse;
    var object_util_js_1 = require_object_util();
    var shared_js_1 = require_shared();
    var decode_uri_component_js_1 = require_decode_uri_component();
    var numberKeyDeserializer = /* @__PURE__ */ __name((key) => {
      const asNumber = Number(key);
      if (!Number.isNaN(asNumber)) {
        return asNumber;
      }
      return key;
    }, "numberKeyDeserializer");
    exports.numberKeyDeserializer = numberKeyDeserializer;
    var numberValueDeserializer = /* @__PURE__ */ __name((value) => {
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber)) {
        return asNumber;
      }
      return value;
    }, "numberValueDeserializer");
    exports.numberValueDeserializer = numberValueDeserializer;
    var regexPlus = /\+/g;
    var Empty = /* @__PURE__ */ __name(function() {
    }, "Empty");
    Empty.prototype = /* @__PURE__ */ Object.create(null);
    function computeKeySlice(input, startIndex, endIndex, keyHasPlus, shouldDecodeKey) {
      let chunk = input.substring(startIndex, endIndex);
      if (keyHasPlus) {
        chunk = chunk.replace(regexPlus, " ");
      }
      if (shouldDecodeKey) {
        chunk = (0, decode_uri_component_js_1.decodeURIComponent)(chunk) || chunk;
      }
      return chunk;
    }
    __name(computeKeySlice, "computeKeySlice");
    function parse(input, options) {
      const { valueDeserializer = shared_js_1.defaultOptions.valueDeserializer, keyDeserializer = shared_js_1.defaultOptions.keyDeserializer, arrayRepeatSyntax = shared_js_1.defaultOptions.arrayRepeatSyntax, nesting = shared_js_1.defaultOptions.nesting, arrayRepeat = shared_js_1.defaultOptions.arrayRepeat, nestingSyntax = shared_js_1.defaultOptions.nestingSyntax, delimiter = shared_js_1.defaultOptions.delimiter } = options ?? {};
      const charDelimiter = typeof delimiter === "string" ? delimiter.charCodeAt(0) : delimiter;
      const isJsNestingSyntax = nestingSyntax === "js";
      const result = new Empty();
      if (typeof input !== "string") {
        return result;
      }
      const inputLength = input.length;
      let value = "";
      let startingIndex = -1;
      let equalityIndex = -1;
      let keySeparatorIndex = -1;
      let currentObj = result;
      let lastKey = void 0;
      let currentKey = "";
      let keyChunk = "";
      let shouldDecodeKey = false;
      let shouldDecodeValue = false;
      let keyHasPlus = false;
      let valueHasPlus = false;
      let keyIsDot = false;
      let hasBothKeyValuePair = false;
      let c = 0;
      let arrayRepeatBracketIndex = -1;
      let prevIndex = -1;
      let prevChar = -1;
      for (let i = 0; i < inputLength + 1; i++) {
        c = i !== inputLength ? input.charCodeAt(i) : charDelimiter;
        if (c === charDelimiter) {
          hasBothKeyValuePair = equalityIndex > startingIndex;
          if (!hasBothKeyValuePair) {
            equalityIndex = i;
          }
          if (keySeparatorIndex !== equalityIndex - 1) {
            keyChunk = computeKeySlice(input, keySeparatorIndex + 1, arrayRepeatBracketIndex > -1 ? arrayRepeatBracketIndex : equalityIndex, keyHasPlus, shouldDecodeKey);
            currentKey = keyDeserializer(keyChunk);
            if (lastKey !== void 0) {
              currentObj = (0, object_util_js_1.getDeepObject)(currentObj, lastKey, currentKey, isJsNestingSyntax && keyIsDot, void 0);
            }
          }
          if (hasBothKeyValuePair || currentKey !== "") {
            if (hasBothKeyValuePair) {
              value = input.slice(equalityIndex + 1, i);
              if (valueHasPlus) {
                value = value.replace(regexPlus, " ");
              }
              if (shouldDecodeValue) {
                value = (0, decode_uri_component_js_1.decodeURIComponent)(value) || value;
              }
            }
            const newValue = valueDeserializer(value, currentKey);
            if (arrayRepeat) {
              const currentValue = currentObj[currentKey];
              if (currentValue === void 0) {
                if (arrayRepeatBracketIndex > -1) {
                  currentObj[currentKey] = [newValue];
                } else {
                  currentObj[currentKey] = newValue;
                }
              } else if (currentValue.pop) {
                currentValue.push(newValue);
              } else {
                currentObj[currentKey] = [currentValue, newValue];
              }
            } else
              currentObj[currentKey] = newValue;
          }
          value = "";
          startingIndex = i;
          equalityIndex = i;
          shouldDecodeKey = false;
          shouldDecodeValue = false;
          keyHasPlus = false;
          valueHasPlus = false;
          keyIsDot = false;
          arrayRepeatBracketIndex = -1;
          keySeparatorIndex = i;
          currentObj = result;
          lastKey = void 0;
          currentKey = "";
        } else if (c === 93) {
          if (arrayRepeat && arrayRepeatSyntax === "bracket") {
            if (prevChar === 91) {
              arrayRepeatBracketIndex = prevIndex;
            }
          }
          if (nesting && (nestingSyntax === "index" || isJsNestingSyntax) && equalityIndex <= startingIndex) {
            if (keySeparatorIndex !== prevIndex) {
              keyChunk = computeKeySlice(input, keySeparatorIndex + 1, i, keyHasPlus, shouldDecodeKey);
              currentKey = keyDeserializer(keyChunk);
              if (lastKey !== void 0) {
                currentObj = (0, object_util_js_1.getDeepObject)(currentObj, lastKey, currentKey, void 0, void 0);
              }
              lastKey = currentKey;
              keyHasPlus = false;
              shouldDecodeKey = false;
            }
            keySeparatorIndex = i;
            keyIsDot = false;
          }
        } else if (c === 46) {
          if (nesting && (nestingSyntax === "dot" || isJsNestingSyntax) && equalityIndex <= startingIndex) {
            if (keySeparatorIndex !== prevIndex) {
              keyChunk = computeKeySlice(input, keySeparatorIndex + 1, i, keyHasPlus, shouldDecodeKey);
              currentKey = keyDeserializer(keyChunk);
              if (lastKey !== void 0) {
                currentObj = (0, object_util_js_1.getDeepObject)(currentObj, lastKey, currentKey, isJsNestingSyntax);
              }
              lastKey = currentKey;
              keyHasPlus = false;
              shouldDecodeKey = false;
            }
            keyIsDot = true;
            keySeparatorIndex = i;
          }
        } else if (c === 91) {
          if (nesting && (nestingSyntax === "index" || isJsNestingSyntax) && equalityIndex <= startingIndex) {
            if (keySeparatorIndex !== prevIndex) {
              keyChunk = computeKeySlice(input, keySeparatorIndex + 1, i, keyHasPlus, shouldDecodeKey);
              currentKey = keyDeserializer(keyChunk);
              if (isJsNestingSyntax && lastKey !== void 0) {
                currentObj = (0, object_util_js_1.getDeepObject)(currentObj, lastKey, currentKey, isJsNestingSyntax);
              }
              lastKey = currentKey;
              keyHasPlus = false;
              shouldDecodeKey = false;
              keyIsDot = false;
            }
            keySeparatorIndex = i;
          }
        } else if (c === 61) {
          if (equalityIndex <= startingIndex) {
            equalityIndex = i;
          } else {
            shouldDecodeValue = true;
          }
        } else if (c === 43) {
          if (equalityIndex > startingIndex) {
            valueHasPlus = true;
          } else {
            keyHasPlus = true;
          }
        } else if (c === 37) {
          if (equalityIndex > startingIndex) {
            shouldDecodeValue = true;
          } else {
            shouldDecodeKey = true;
          }
        }
        prevIndex = i;
        prevChar = c;
      }
      return result;
    }
    __name(parse, "parse");
  }
});

// ../node_modules/picoquery/lib/stringify.js
var require_stringify = __commonJS({
  "../node_modules/picoquery/lib/stringify.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringify = stringify;
    var object_util_js_1 = require_object_util();
    function stringify(input, options) {
      if (input === null || typeof input !== "object") {
        return "";
      }
      const optionsObj = options ?? {};
      return (0, object_util_js_1.stringifyObject)(input, optionsObj);
    }
    __name(stringify, "stringify");
  }
});

// ../node_modules/picoquery/lib/main.js
var require_main = __commonJS({
  "../node_modules/picoquery/lib/main.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringify = exports.parse = void 0;
    var parse_js_1 = require_parse();
    Object.defineProperty(exports, "parse", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parse_js_1.parse;
    }, "get") });
    var stringify_js_1 = require_stringify();
    Object.defineProperty(exports, "stringify", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return stringify_js_1.stringify;
    }, "get") });
    __exportStar(require_shared(), exports);
  }
});

export {
  require_main
};
