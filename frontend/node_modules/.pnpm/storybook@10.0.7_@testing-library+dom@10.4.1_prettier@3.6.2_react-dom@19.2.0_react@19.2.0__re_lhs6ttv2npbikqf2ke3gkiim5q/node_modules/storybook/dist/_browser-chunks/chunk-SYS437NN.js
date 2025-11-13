import {
  __name
} from "./chunk-MM7DTO55.js";

// ../node_modules/dequal/dist/index.mjs
var has = Object.prototype.hasOwnProperty;
function find(iter, tar, key) {
  for (key of iter.keys()) {
    if (dequal(key, tar)) return key;
  }
}
__name(find, "find");
function dequal(foo, bar) {
  var ctor, len, tmp;
  if (foo === bar) return true;
  if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
    if (ctor === Date) return foo.getTime() === bar.getTime();
    if (ctor === RegExp) return foo.toString() === bar.toString();
    if (ctor === Array) {
      if ((len = foo.length) === bar.length) {
        while (len-- && dequal(foo[len], bar[len])) ;
      }
      return len === -1;
    }
    if (ctor === Set) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len;
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!bar.has(tmp)) return false;
      }
      return true;
    }
    if (ctor === Map) {
      if (foo.size !== bar.size) {
        return false;
      }
      for (len of foo) {
        tmp = len[0];
        if (tmp && typeof tmp === "object") {
          tmp = find(bar, tmp);
          if (!tmp) return false;
        }
        if (!dequal(len[1], bar.get(tmp))) {
          return false;
        }
      }
      return true;
    }
    if (ctor === ArrayBuffer) {
      foo = new Uint8Array(foo);
      bar = new Uint8Array(bar);
    } else if (ctor === DataView) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo.getInt8(len) === bar.getInt8(len)) ;
      }
      return len === -1;
    }
    if (ArrayBuffer.isView(foo)) {
      if ((len = foo.byteLength) === bar.byteLength) {
        while (len-- && foo[len] === bar[len]) ;
      }
      return len === -1;
    }
    if (!ctor || typeof foo === "object") {
      len = 0;
      for (ctor in foo) {
        if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
        if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
      }
      return Object.keys(bar).length === len;
    }
  }
  return foo !== foo && bar !== bar;
}
__name(dequal, "dequal");

// ../node_modules/es-toolkit/dist/array/partition.mjs
function partition(arr, isInTruthy) {
  const truthy = [];
  const falsy = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (isInTruthy(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}
__name(partition, "partition");

// ../node_modules/es-toolkit/dist/array/countBy.mjs
function countBy(arr, mapper) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const key = mapper(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}
__name(countBy, "countBy");

// ../node_modules/es-toolkit/dist/array/uniq.mjs
function uniq(arr) {
  return Array.from(new Set(arr));
}
__name(uniq, "uniq");

export {
  dequal,
  countBy,
  partition,
  uniq
};
