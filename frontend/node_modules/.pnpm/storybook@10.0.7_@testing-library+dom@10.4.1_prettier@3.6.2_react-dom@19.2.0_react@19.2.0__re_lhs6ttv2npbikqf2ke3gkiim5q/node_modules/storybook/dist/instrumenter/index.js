import {
  CallStates,
  EVENTS
} from "../_browser-chunks/chunk-SN4J4IQ3.js";
import {
  processError
} from "../_browser-chunks/chunk-JVSKG4YS.js";
import {
  __name
} from "../_browser-chunks/chunk-MM7DTO55.js";

// src/instrumenter/instrumenter.ts
import { once } from "storybook/internal/client-logger";
import {
  FORCE_REMOUNT,
  SET_CURRENT_STORY,
  STORY_RENDER_PHASE_CHANGED
} from "storybook/internal/core-events";
import { global } from "@storybook/global";

// src/instrumenter/preview-api.ts
var addons = globalThis.__STORYBOOK_ADDONS_PREVIEW;

// src/instrumenter/instrumenter.ts
var alreadyCompletedException = new Error(
  `This function ran after the play function completed. Did you forget to \`await\` it?`
);
var isObject = /* @__PURE__ */ __name((o) => Object.prototype.toString.call(o) === "[object Object]", "isObject");
var isModule = /* @__PURE__ */ __name((o) => Object.prototype.toString.call(o) === "[object Module]", "isModule");
var isInstrumentable = /* @__PURE__ */ __name((o) => {
  if (!isObject(o) && !isModule(o)) {
    return false;
  }
  if (o.constructor === void 0) {
    return true;
  }
  const proto = o.constructor.prototype;
  if (!isObject(proto)) {
    return false;
  }
  return true;
}, "isInstrumentable");
var construct = /* @__PURE__ */ __name((obj) => {
  try {
    return new obj.constructor();
  } catch {
    return {};
  }
}, "construct");
var getInitialState = /* @__PURE__ */ __name(() => ({
  renderPhase: "preparing",
  isDebugging: false,
  isPlaying: false,
  isLocked: false,
  cursor: 0,
  calls: [],
  shadowCalls: [],
  callRefsByResult: /* @__PURE__ */ new Map(),
  chainedCallIds: /* @__PURE__ */ new Set(),
  ancestors: [],
  playUntil: void 0,
  resolvers: {},
  syncTimeout: void 0
}), "getInitialState");
var getRetainedState = /* @__PURE__ */ __name((state, isDebugging = false) => {
  const calls = (isDebugging ? state.shadowCalls : state.calls).filter((call) => call.retain);
  if (!calls.length) {
    return void 0;
  }
  const callRefsByResult = new Map(
    Array.from(state.callRefsByResult.entries()).filter(([, ref]) => ref.retain)
  );
  return { cursor: calls.length, calls, callRefsByResult };
}, "getRetainedState");
var _Instrumenter = class _Instrumenter {
  constructor() {
    this.detached = false;
    this.initialized = false;
    // State is tracked per story to deal with multiple stories on the same canvas (i.e. docs mode)
    this.state = {};
    this.loadParentWindowState = /* @__PURE__ */ __name(() => {
      try {
        this.state = global.window?.parent?.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER_STATE__ || {};
      } catch {
        this.detached = true;
      }
    }, "loadParentWindowState");
    this.updateParentWindowState = /* @__PURE__ */ __name(() => {
      try {
        global.window.parent.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER_STATE__ = this.state;
      } catch {
        this.detached = true;
      }
    }, "updateParentWindowState");
    this.loadParentWindowState();
    const resetState = /* @__PURE__ */ __name(({
      storyId,
      renderPhase,
      isPlaying = true,
      isDebugging = false
    }) => {
      const state = this.getState(storyId);
      this.setState(storyId, {
        ...getInitialState(),
        ...getRetainedState(state, isDebugging),
        renderPhase: renderPhase || state.renderPhase,
        shadowCalls: isDebugging ? state.shadowCalls : [],
        chainedCallIds: isDebugging ? state.chainedCallIds : /* @__PURE__ */ new Set(),
        playUntil: isDebugging ? state.playUntil : void 0,
        isPlaying,
        isDebugging
      });
      this.sync(storyId);
    }, "resetState");
    const start = /* @__PURE__ */ __name((channel) => ({ storyId, playUntil }) => {
      if (!this.getState(storyId).isDebugging) {
        this.setState(storyId, ({ calls }) => ({
          calls: [],
          shadowCalls: calls.map((call) => ({ ...call, status: "waiting" /* WAITING */ })),
          isDebugging: true
        }));
      }
      const log = this.getLog(storyId);
      this.setState(storyId, ({ shadowCalls }) => {
        if (playUntil || !log.length) {
          return { playUntil };
        }
        const firstRowIndex = shadowCalls.findIndex((call) => call.id === log[0].callId);
        return {
          playUntil: shadowCalls.slice(0, firstRowIndex).filter((call) => call.interceptable && !call.ancestors?.length).slice(-1)[0]?.id
        };
      });
      channel.emit(FORCE_REMOUNT, { storyId, isDebugging: true });
    }, "start");
    const back = /* @__PURE__ */ __name((channel) => ({ storyId }) => {
      const log = this.getLog(storyId).filter((call) => !call.ancestors?.length);
      const last = log.reduceRight((res, item, index) => {
        if (res >= 0 || item.status === "waiting" /* WAITING */) {
          return res;
        }
        return index;
      }, -1);
      start(channel)({ storyId, playUntil: log[last - 1]?.callId });
    }, "back");
    const goto = /* @__PURE__ */ __name((channel) => ({ storyId, callId }) => {
      const { calls, shadowCalls, resolvers } = this.getState(storyId);
      const call = calls.find(({ id }) => id === callId);
      const shadowCall = shadowCalls.find(({ id }) => id === callId);
      if (!call && shadowCall && Object.values(resolvers).length > 0) {
        const nextId = this.getLog(storyId).find((c) => c.status === "waiting" /* WAITING */)?.callId;
        if (shadowCall.id !== nextId) {
          this.setState(storyId, { playUntil: shadowCall.id });
        }
        Object.values(resolvers).forEach((resolve) => resolve());
      } else {
        start(channel)({ storyId, playUntil: callId });
      }
    }, "goto");
    const next = /* @__PURE__ */ __name((channel) => ({ storyId }) => {
      const { resolvers } = this.getState(storyId);
      if (Object.values(resolvers).length > 0) {
        Object.values(resolvers).forEach((resolve) => resolve());
      } else {
        const nextId = this.getLog(storyId).find((c) => c.status === "waiting" /* WAITING */)?.callId;
        if (nextId) {
          start(channel)({ storyId, playUntil: nextId });
        } else {
          end({ storyId });
        }
      }
    }, "next");
    const end = /* @__PURE__ */ __name(({ storyId }) => {
      this.setState(storyId, { playUntil: void 0, isDebugging: false });
      Object.values(this.getState(storyId).resolvers).forEach((resolve) => resolve());
    }, "end");
    const renderPhaseChanged = /* @__PURE__ */ __name(({
      storyId,
      newPhase
    }) => {
      const { isDebugging } = this.getState(storyId);
      if (newPhase === "preparing" && isDebugging) {
        return resetState({ storyId, renderPhase: newPhase, isDebugging });
      } else if (newPhase === "playing") {
        return resetState({ storyId, renderPhase: newPhase, isDebugging });
      }
      if (newPhase === "played") {
        this.setState(storyId, {
          renderPhase: newPhase,
          isLocked: false,
          isPlaying: false,
          isDebugging: false
        });
      } else if (newPhase === "errored") {
        this.setState(storyId, {
          renderPhase: newPhase,
          isLocked: false,
          isPlaying: false
        });
      } else if (newPhase === "aborted") {
        this.setState(storyId, {
          renderPhase: newPhase,
          isLocked: true,
          isPlaying: false
        });
      } else {
        this.setState(storyId, {
          renderPhase: newPhase
        });
      }
      this.sync(storyId);
    }, "renderPhaseChanged");
    if (addons) {
      addons.ready().then(() => {
        this.channel = addons.getChannel();
        this.channel.on(FORCE_REMOUNT, resetState);
        this.channel.on(STORY_RENDER_PHASE_CHANGED, renderPhaseChanged);
        this.channel.on(SET_CURRENT_STORY, () => {
          if (this.initialized) {
            this.cleanup();
          } else {
            this.initialized = true;
          }
        });
        this.channel.on(EVENTS.START, start(this.channel));
        this.channel.on(EVENTS.BACK, back(this.channel));
        this.channel.on(EVENTS.GOTO, goto(this.channel));
        this.channel.on(EVENTS.NEXT, next(this.channel));
        this.channel.on(EVENTS.END, end);
      });
    }
  }
  getState(storyId) {
    return this.state[storyId] || getInitialState();
  }
  setState(storyId, update) {
    if (storyId) {
      const state = this.getState(storyId);
      const patch = typeof update === "function" ? update(state) : update;
      this.state = { ...this.state, [storyId]: { ...state, ...patch } };
      this.updateParentWindowState();
    }
  }
  cleanup() {
    this.state = Object.entries(this.state).reduce(
      (acc, [storyId, state]) => {
        const retainedState = getRetainedState(state);
        if (!retainedState) {
          return acc;
        }
        acc[storyId] = Object.assign(getInitialState(), retainedState);
        return acc;
      },
      {}
    );
    const controlStates = {
      detached: this.detached,
      start: false,
      back: false,
      goto: false,
      next: false,
      end: false
    };
    const payload = { controlStates, logItems: [] };
    this.channel?.emit(EVENTS.SYNC, payload);
    this.updateParentWindowState();
  }
  getLog(storyId) {
    const { calls, shadowCalls } = this.getState(storyId);
    const merged = [...shadowCalls];
    calls.forEach((call, index) => {
      merged[index] = call;
    });
    const seen = /* @__PURE__ */ new Set();
    return merged.reduceRight((acc, call) => {
      call.args.forEach((arg) => {
        if (arg?.__callId__) {
          seen.add(arg.__callId__);
        }
      });
      call.path.forEach((node) => {
        if (node.__callId__) {
          seen.add(node.__callId__);
        }
      });
      if ((call.interceptable || call.exception) && !seen.has(call.id)) {
        acc.unshift({ callId: call.id, status: call.status, ancestors: call.ancestors });
        seen.add(call.id);
      }
      return acc;
    }, []);
  }
  // Traverses the object structure to recursively patch all function properties.
  // Returns the original object, or a new object with the same constructor,
  // depending on whether it should mutate.
  instrument(obj, options, depth = 0) {
    if (!isInstrumentable(obj)) {
      return obj;
    }
    const { mutate = false, path = [] } = options;
    const keys = options.getKeys ? options.getKeys(obj, depth) : Object.keys(obj);
    depth += 1;
    return keys.reduce(
      (acc, key) => {
        const descriptor = getPropertyDescriptor(obj, key);
        if (typeof descriptor?.get === "function") {
          if (descriptor.configurable) {
            const getter = /* @__PURE__ */ __name(() => descriptor?.get?.bind(obj)?.(), "getter");
            Object.defineProperty(acc, key, {
              get: /* @__PURE__ */ __name(() => {
                return this.instrument(getter(), { ...options, path: path.concat(key) }, depth);
              }, "get")
            });
          }
          return acc;
        }
        const value = obj[key];
        if (typeof value !== "function") {
          acc[key] = this.instrument(value, { ...options, path: path.concat(key) }, depth);
          return acc;
        }
        if ("__originalFn__" in value && typeof value.__originalFn__ === "function") {
          acc[key] = value;
          return acc;
        }
        acc[key] = (...args) => this.track(key, value, obj, args, options);
        acc[key].__originalFn__ = value;
        Object.defineProperty(acc[key], "name", { value: key, writable: false });
        if (Object.keys(value).length > 0) {
          Object.assign(
            acc[key],
            this.instrument({ ...value }, { ...options, path: path.concat(key) }, depth)
          );
        }
        return acc;
      },
      mutate ? obj : construct(obj)
    );
  }
  // Monkey patch an object method to record calls.
  // Returns a function that invokes the original function, records the invocation ("call") and
  // returns the original result.
  track(method, fn, object, args, options) {
    const storyId = args?.[0]?.__storyId__ || global.__STORYBOOK_PREVIEW__?.selectionStore?.selection?.storyId;
    const { cursor, ancestors } = this.getState(storyId);
    this.setState(storyId, { cursor: cursor + 1 });
    const id = `${ancestors.slice(-1)[0] || storyId} [${cursor}] ${method}`;
    const { path = [], intercept = false, retain = false } = options;
    const interceptable = typeof intercept === "function" ? intercept(method, path) : intercept;
    const call = { id, cursor, storyId, ancestors, path, method, args, interceptable, retain };
    const interceptOrInvoke = interceptable && !ancestors.length ? this.intercept : this.invoke;
    const result = interceptOrInvoke.call(this, fn, object, call, options);
    return this.instrument(result, { ...options, mutate: true, path: [{ __callId__: call.id }] });
  }
  intercept(fn, object, call, options) {
    const { chainedCallIds, isDebugging, playUntil } = this.getState(call.storyId);
    const isChainedUpon = chainedCallIds.has(call.id);
    if (!isDebugging || isChainedUpon || playUntil) {
      if (playUntil === call.id) {
        this.setState(call.storyId, { playUntil: void 0 });
      }
      return this.invoke(fn, object, call, options);
    }
    return new Promise((resolve) => {
      this.setState(call.storyId, ({ resolvers }) => ({
        isLocked: false,
        resolvers: { ...resolvers, [call.id]: resolve }
      }));
    }).then(() => {
      this.setState(call.storyId, (state) => {
        const { [call.id]: _, ...resolvers } = state.resolvers;
        return { isLocked: true, resolvers };
      });
      return this.invoke(fn, object, call, options);
    });
  }
  invoke(fn, object, call, options) {
    const { callRefsByResult, renderPhase } = this.getState(call.storyId);
    const maximumDepth = 25;
    const serializeValues = /* @__PURE__ */ __name((value, depth, seen) => {
      if (seen.includes(value)) {
        return "[Circular]";
      }
      seen = [...seen, value];
      if (depth > maximumDepth) {
        return "...";
      }
      if (callRefsByResult.has(value)) {
        return callRefsByResult.get(value);
      }
      if (value instanceof Array) {
        return value.map((it) => serializeValues(it, ++depth, seen));
      }
      if (value instanceof Date) {
        return { __date__: { value: value.toISOString() } };
      }
      if (value instanceof Error) {
        const { name, message, stack } = value;
        return { __error__: { name, message, stack } };
      }
      if (value instanceof RegExp) {
        const { flags, source } = value;
        return { __regexp__: { flags, source } };
      }
      if (value instanceof global.window?.HTMLElement) {
        const { prefix, localName, id, classList, innerText } = value;
        const classNames = Array.from(classList);
        return { __element__: { prefix, localName, id, classNames, innerText } };
      }
      if (typeof value === "function") {
        return {
          __function__: { name: "getMockName" in value ? value.getMockName() : value.name }
        };
      }
      if (typeof value === "symbol") {
        return { __symbol__: { description: value.description } };
      }
      if (typeof value === "object" && value?.constructor?.name && value?.constructor?.name !== "Object") {
        return { __class__: { name: value.constructor.name } };
      }
      if (Object.prototype.toString.call(value) === "[object Object]") {
        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [key, serializeValues(val, ++depth, seen)])
        );
      }
      return value;
    }, "serializeValues");
    const info = {
      ...call,
      args: call.args.map((arg) => serializeValues(arg, 0, []))
    };
    call.path.forEach((ref) => {
      if (ref?.__callId__) {
        this.setState(call.storyId, ({ chainedCallIds }) => ({
          chainedCallIds: new Set(Array.from(chainedCallIds).concat(ref.__callId__))
        }));
      }
    });
    const handleException = /* @__PURE__ */ __name((e) => {
      if (e instanceof Error) {
        const { name, message, stack, callId = call.id } = e;
        const {
          showDiff = void 0,
          diff = void 0,
          actual = void 0,
          expected = void 0
        } = e.name === "AssertionError" ? processError(e) : e;
        const exception = { name, message, stack, callId, showDiff, diff, actual, expected };
        this.update({ ...info, status: "error" /* ERROR */, exception });
        this.setState(call.storyId, (state) => ({
          callRefsByResult: new Map([
            ...Array.from(state.callRefsByResult.entries()),
            [e, { __callId__: call.id, retain: call.retain }]
          ])
        }));
        if (call.ancestors?.length) {
          if (!Object.prototype.hasOwnProperty.call(e, "callId")) {
            Object.defineProperty(e, "callId", { value: call.id });
          }
          throw e;
        }
      }
      throw e;
    }, "handleException");
    try {
      if (renderPhase === "played" && !call.retain) {
        throw alreadyCompletedException;
      }
      const actualArgs = options.getArgs ? options.getArgs(call, this.getState(call.storyId)) : call.args;
      const finalArgs = actualArgs.map((arg) => {
        if (typeof arg !== "function" || isClass(arg) || Object.keys(arg).length) {
          return arg;
        }
        return (...args) => {
          const { cursor, ancestors } = this.getState(call.storyId);
          this.setState(call.storyId, { cursor: 0, ancestors: [...ancestors, call.id] });
          const restore = /* @__PURE__ */ __name(() => this.setState(call.storyId, { cursor, ancestors }), "restore");
          let willRestore = false;
          try {
            const res = arg(...args);
            if (res instanceof Promise) {
              willRestore = true;
              return res.finally(restore);
            }
            return res;
          } finally {
            if (!willRestore) {
              restore();
            }
          }
        };
      });
      const result = fn.apply(object, finalArgs);
      if (result && ["object", "function", "symbol"].includes(typeof result)) {
        this.setState(call.storyId, (state) => ({
          callRefsByResult: new Map([
            ...Array.from(state.callRefsByResult.entries()),
            [result, { __callId__: call.id, retain: call.retain }]
          ])
        }));
      }
      this.update({
        ...info,
        status: result instanceof Promise ? "active" /* ACTIVE */ : "done" /* DONE */
      });
      if (result instanceof Promise) {
        return result.then((value) => {
          this.update({ ...info, status: "done" /* DONE */ });
          return value;
        }, handleException);
      }
      return result;
    } catch (e) {
      return handleException(e);
    }
  }
  // Sends the call info to the manager and synchronizes the log.
  update(call) {
    this.channel?.emit(EVENTS.CALL, call);
    this.setState(call.storyId, ({ calls }) => {
      const callsById = calls.concat(call).reduce((a, c) => Object.assign(a, { [c.id]: c }), {});
      return {
        // Calls are sorted to ensure parent calls always come before calls in their callback.
        calls: Object.values(callsById).sort(
          (a, b) => a.id.localeCompare(b.id, void 0, { numeric: true })
        )
      };
    });
    this.sync(call.storyId);
  }
  // Builds a log of interceptable calls and control states and sends it to the manager.
  // Uses a 0ms debounce because this might get called many times in one tick.
  sync(storyId) {
    const synchronize = /* @__PURE__ */ __name(() => {
      const { isLocked, isPlaying } = this.getState(storyId);
      const logItems = this.getLog(storyId);
      const pausedAt = logItems.filter(({ ancestors }) => !ancestors.length).find((item) => item.status === "waiting" /* WAITING */)?.callId;
      const hasActive = logItems.some((item) => item.status === "active" /* ACTIVE */);
      if (this.detached || isLocked || hasActive || logItems.length === 0) {
        const controlStates2 = {
          detached: this.detached,
          start: false,
          back: false,
          goto: false,
          next: false,
          end: false
        };
        const payload2 = { controlStates: controlStates2, logItems };
        this.channel?.emit(EVENTS.SYNC, payload2);
        return;
      }
      const hasPrevious = logItems.some(
        (item) => item.status === "done" /* DONE */ || item.status === "error" /* ERROR */
      );
      const controlStates = {
        detached: this.detached,
        start: hasPrevious,
        back: hasPrevious,
        goto: true,
        next: isPlaying,
        end: isPlaying
      };
      const payload = { controlStates, logItems, pausedAt };
      this.channel?.emit(EVENTS.SYNC, payload);
    }, "synchronize");
    this.setState(storyId, ({ syncTimeout }) => {
      clearTimeout(syncTimeout);
      return { syncTimeout: setTimeout(synchronize, 0) };
    });
  }
};
__name(_Instrumenter, "Instrumenter");
var Instrumenter = _Instrumenter;
function instrument(obj, options = {}) {
  try {
    let forceInstrument = false;
    let skipInstrument = false;
    if (global.window?.location?.search?.includes("instrument=true")) {
      forceInstrument = true;
    } else if (global.window?.location?.search?.includes("instrument=false")) {
      skipInstrument = true;
    }
    if (global.window?.parent === global.window && !forceInstrument || skipInstrument) {
      return obj;
    }
    if (global.window && !global.window.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__) {
      global.window.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__ = new Instrumenter();
    }
    const instrumenter = global.window?.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__;
    return instrumenter.instrument(obj, options);
  } catch (e) {
    once.warn(e);
    return obj;
  }
}
__name(instrument, "instrument");
function getPropertyDescriptor(obj, propName) {
  let target = obj;
  while (target != null) {
    const descriptor = Object.getOwnPropertyDescriptor(target, propName);
    if (descriptor) {
      return descriptor;
    }
    target = Object.getPrototypeOf(target);
  }
  return void 0;
}
__name(getPropertyDescriptor, "getPropertyDescriptor");
function isClass(obj) {
  if (typeof obj !== "function") {
    return false;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, "prototype");
  if (!descriptor) {
    return false;
  }
  return !descriptor.writable;
}
__name(isClass, "isClass");
export {
  CallStates,
  EVENTS,
  instrument
};
