import {
  noop
} from "./chunk-AB7OOPUX.js";
import {
  argumentsTag,
  arrayBufferTag,
  arrayTag,
  bigInt64ArrayTag,
  bigUint64ArrayTag,
  booleanTag,
  dataViewTag,
  dateTag,
  errorTag,
  float32ArrayTag,
  float64ArrayTag,
  functionTag,
  getSymbols,
  getTag,
  int16ArrayTag,
  int32ArrayTag,
  int8ArrayTag,
  isPlainObject,
  mapTag,
  numberTag,
  objectTag,
  regexpTag,
  setTag,
  stringTag,
  symbolTag,
  uint16ArrayTag,
  uint32ArrayTag,
  uint8ArrayTag,
  uint8ClampedArrayTag
} from "./chunk-FSBVR7H5.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// ../node_modules/es-toolkit/dist/compat/util/eq.mjs
function eq(value, other) {
  return value === other || Number.isNaN(value) && Number.isNaN(other);
}
__name(eq, "eq");

// ../node_modules/es-toolkit/dist/predicate/isEqualWith.mjs
function isEqualWith(a, b, areValuesEqual) {
  return isEqualWithImpl(a, b, void 0, void 0, void 0, void 0, areValuesEqual);
}
__name(isEqualWith, "isEqualWith");
function isEqualWithImpl(a, b, property, aParent, bParent, stack, areValuesEqual) {
  const result = areValuesEqual(a, b, property, aParent, bParent, stack);
  if (result !== void 0) {
    return result;
  }
  if (typeof a === typeof b) {
    switch (typeof a) {
      case "bigint":
      case "string":
      case "boolean":
      case "symbol":
      case "undefined": {
        return a === b;
      }
      case "number": {
        return a === b || Object.is(a, b);
      }
      case "function": {
        return a === b;
      }
      case "object": {
        return areObjectsEqual(a, b, stack, areValuesEqual);
      }
    }
  }
  return areObjectsEqual(a, b, stack, areValuesEqual);
}
__name(isEqualWithImpl, "isEqualWithImpl");
function areObjectsEqual(a, b, stack, areValuesEqual) {
  if (Object.is(a, b)) {
    return true;
  }
  let aTag = getTag(a);
  let bTag = getTag(b);
  if (aTag === argumentsTag) {
    aTag = objectTag;
  }
  if (bTag === argumentsTag) {
    bTag = objectTag;
  }
  if (aTag !== bTag) {
    return false;
  }
  switch (aTag) {
    case stringTag:
      return a.toString() === b.toString();
    case numberTag: {
      const x = a.valueOf();
      const y = b.valueOf();
      return eq(x, y);
    }
    case booleanTag:
    case dateTag:
    case symbolTag:
      return Object.is(a.valueOf(), b.valueOf());
    case regexpTag: {
      return a.source === b.source && a.flags === b.flags;
    }
    case functionTag: {
      return a === b;
    }
  }
  stack = stack ?? /* @__PURE__ */ new Map();
  const aStack = stack.get(a);
  const bStack = stack.get(b);
  if (aStack != null && bStack != null) {
    return aStack === b;
  }
  stack.set(a, b);
  stack.set(b, a);
  try {
    switch (aTag) {
      case mapTag: {
        if (a.size !== b.size) {
          return false;
        }
        for (const [key, value] of a.entries()) {
          if (!b.has(key) || !isEqualWithImpl(value, b.get(key), key, a, b, stack, areValuesEqual)) {
            return false;
          }
        }
        return true;
      }
      case setTag: {
        if (a.size !== b.size) {
          return false;
        }
        const aValues = Array.from(a.values());
        const bValues = Array.from(b.values());
        for (let i = 0; i < aValues.length; i++) {
          const aValue = aValues[i];
          const index = bValues.findIndex((bValue) => {
            return isEqualWithImpl(aValue, bValue, void 0, a, b, stack, areValuesEqual);
          });
          if (index === -1) {
            return false;
          }
          bValues.splice(index, 1);
        }
        return true;
      }
      case arrayTag:
      case uint8ArrayTag:
      case uint8ClampedArrayTag:
      case uint16ArrayTag:
      case uint32ArrayTag:
      case bigUint64ArrayTag:
      case int8ArrayTag:
      case int16ArrayTag:
      case int32ArrayTag:
      case bigInt64ArrayTag:
      case float32ArrayTag:
      case float64ArrayTag: {
        if (typeof Buffer !== "undefined" && Buffer.isBuffer(a) !== Buffer.isBuffer(b)) {
          return false;
        }
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; i++) {
          if (!isEqualWithImpl(a[i], b[i], i, a, b, stack, areValuesEqual)) {
            return false;
          }
        }
        return true;
      }
      case arrayBufferTag: {
        if (a.byteLength !== b.byteLength) {
          return false;
        }
        return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
      }
      case dataViewTag: {
        if (a.byteLength !== b.byteLength || a.byteOffset !== b.byteOffset) {
          return false;
        }
        return areObjectsEqual(new Uint8Array(a), new Uint8Array(b), stack, areValuesEqual);
      }
      case errorTag: {
        return a.name === b.name && a.message === b.message;
      }
      case objectTag: {
        const areEqualInstances = areObjectsEqual(a.constructor, b.constructor, stack, areValuesEqual) || isPlainObject(a) && isPlainObject(b);
        if (!areEqualInstances) {
          return false;
        }
        const aKeys = [...Object.keys(a), ...getSymbols(a)];
        const bKeys = [...Object.keys(b), ...getSymbols(b)];
        if (aKeys.length !== bKeys.length) {
          return false;
        }
        for (let i = 0; i < aKeys.length; i++) {
          const propKey = aKeys[i];
          const aProp = a[propKey];
          if (!Object.hasOwn(b, propKey)) {
            return false;
          }
          const bProp = b[propKey];
          if (!isEqualWithImpl(aProp, bProp, propKey, a, b, stack, areValuesEqual)) {
            return false;
          }
        }
        return true;
      }
      default: {
        return false;
      }
    }
  } finally {
    stack.delete(a);
    stack.delete(b);
  }
}
__name(areObjectsEqual, "areObjectsEqual");

// ../node_modules/es-toolkit/dist/predicate/isEqual.mjs
function isEqual(a, b) {
  return isEqualWith(a, b, noop);
}
__name(isEqual, "isEqual");

export {
  isEqual
};
