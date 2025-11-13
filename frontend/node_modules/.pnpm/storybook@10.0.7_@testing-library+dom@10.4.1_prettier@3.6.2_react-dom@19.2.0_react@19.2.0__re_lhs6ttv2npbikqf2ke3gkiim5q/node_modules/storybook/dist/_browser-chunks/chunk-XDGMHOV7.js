import {
  dedent
} from "./chunk-OPCDBBL3.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// src/shared/universal-store/instances.ts
var instances = /* @__PURE__ */ new Map();

// src/shared/universal-store/index.ts
var CHANNEL_EVENT_PREFIX = "UNIVERSAL_STORE:";
var ProgressState = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED"
};
var _UniversalStore = class _UniversalStore {
  constructor(options, environmentOverrides) {
    /** Enable debug logs for this store */
    this.debugging = false;
    // TODO: narrow type of listeners based on event type
    this.listeners = /* @__PURE__ */ new Map([["*", /* @__PURE__ */ new Set()]]);
    /** Gets the current state */
    this.getState = /* @__PURE__ */ __name(() => {
      this.debug("getState", { state: this.state });
      return this.state;
    }, "getState");
    /**
     * Subscribes to store events
     *
     * @returns A function to unsubscribe
     */
    this.subscribe = /* @__PURE__ */ __name((eventTypeOrListener, maybeListener) => {
      const subscribesToAllEvents = typeof eventTypeOrListener === "function";
      const eventType = subscribesToAllEvents ? "*" : eventTypeOrListener;
      const listener = subscribesToAllEvents ? eventTypeOrListener : maybeListener;
      this.debug("subscribe", { eventType, listener });
      if (!listener) {
        throw new TypeError(
          `Missing first subscribe argument, or second if first is the event type, when subscribing to a UniversalStore with id '${this.id}'`
        );
      }
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, /* @__PURE__ */ new Set());
      }
      this.listeners.get(eventType).add(listener);
      return () => {
        this.debug("unsubscribe", { eventType, listener });
        if (!this.listeners.has(eventType)) {
          return;
        }
        this.listeners.get(eventType).delete(listener);
        if (this.listeners.get(eventType)?.size === 0) {
          this.listeners.delete(eventType);
        }
      };
    }, "subscribe");
    /** Sends a custom event to the other stores */
    this.send = /* @__PURE__ */ __name((event) => {
      this.debug("send", { event });
      if (this.status !== _UniversalStore.Status.READY) {
        throw new TypeError(
          dedent`Cannot send event before store is ready. You can get the current status with store.status,
        or await store.readyPromise to wait for the store to be ready before sending events.
        ${JSON.stringify(
            {
              event,
              id: this.id,
              actor: this.actor,
              environment: this.environment
            },
            null,
            2
          )}`
        );
      }
      this.emitToListeners(event, { actor: this.actor });
      this.emitToChannel(event, { actor: this.actor });
    }, "send");
    this.debugging = options.debug ?? false;
    if (!_UniversalStore.isInternalConstructing) {
      throw new TypeError(
        "UniversalStore is not constructable - use UniversalStore.create() instead"
      );
    }
    _UniversalStore.isInternalConstructing = false;
    this.id = options.id;
    this.actorId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.actorType = options.leader ? _UniversalStore.ActorType.LEADER : _UniversalStore.ActorType.FOLLOWER;
    this.state = options.initialState;
    this.channelEventName = `${CHANNEL_EVENT_PREFIX}${this.id}`;
    this.debug("constructor", {
      options,
      environmentOverrides,
      channelEventName: this.channelEventName
    });
    if (this.actor.type === _UniversalStore.ActorType.LEADER) {
      this.syncing = {
        state: ProgressState.RESOLVED,
        promise: Promise.resolve()
      };
    } else {
      let syncingResolve;
      let syncingReject;
      const syncingPromise = new Promise((resolve, reject) => {
        syncingResolve = /* @__PURE__ */ __name(() => {
          if (this.syncing.state !== ProgressState.PENDING) {
            return;
          }
          this.syncing.state = ProgressState.RESOLVED;
          resolve();
        }, "syncingResolve");
        syncingReject = /* @__PURE__ */ __name((reason) => {
          if (this.syncing.state !== ProgressState.PENDING) {
            return;
          }
          this.syncing.state = ProgressState.REJECTED;
          reject(reason);
        }, "syncingReject");
      });
      this.syncing = {
        state: ProgressState.PENDING,
        promise: syncingPromise,
        resolve: syncingResolve,
        reject: syncingReject
      };
    }
    this.getState = this.getState.bind(this);
    this.setState = this.setState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.send = this.send.bind(this);
    this.emitToChannel = this.emitToChannel.bind(this);
    this.prepareThis = this.prepareThis.bind(this);
    this.emitToListeners = this.emitToListeners.bind(this);
    this.handleChannelEvents = this.handleChannelEvents.bind(this);
    this.debug = this.debug.bind(this);
    this.channel = environmentOverrides?.channel ?? _UniversalStore.preparation.channel;
    this.environment = environmentOverrides?.environment ?? _UniversalStore.preparation.environment;
    if (this.channel && this.environment) {
      _UniversalStore.preparation.resolve({ channel: this.channel, environment: this.environment });
      this.prepareThis({ channel: this.channel, environment: this.environment });
    } else {
      _UniversalStore.preparation.promise.then(this.prepareThis);
    }
  }
  static setupPreparationPromise() {
    let resolveRef;
    let rejectRef;
    const promise = new Promise(
      (resolve, reject) => {
        resolveRef = /* @__PURE__ */ __name((args) => {
          resolve(args);
        }, "resolveRef");
        rejectRef = /* @__PURE__ */ __name((...args) => {
          reject(args);
        }, "rejectRef");
      }
    );
    _UniversalStore.preparation = {
      resolve: resolveRef,
      reject: rejectRef,
      promise
    };
  }
  /** The actor object representing the store instance with a unique ID and a type */
  get actor() {
    return Object.freeze({
      id: this.actorId,
      type: this.actorType,
      environment: this.environment ?? _UniversalStore.Environment.UNKNOWN
    });
  }
  /**
   * The current state of the store, that signals both if the store is prepared by Storybook and
   * also - in the case of a follower - if the state has been synced with the leader's state.
   */
  get status() {
    if (!this.channel || !this.environment) {
      return _UniversalStore.Status.UNPREPARED;
    }
    switch (this.syncing?.state) {
      case ProgressState.PENDING:
      case void 0:
        return _UniversalStore.Status.SYNCING;
      case ProgressState.REJECTED:
        return _UniversalStore.Status.ERROR;
      case ProgressState.RESOLVED:
      default:
        return _UniversalStore.Status.READY;
    }
  }
  /**
   * A promise that resolves when the store is fully ready. A leader will be ready when the store
   * has been prepared by Storybook, which is almost instantly.
   *
   * A follower will be ready when the state has been synced with the leader's state, within a few
   * hundred milliseconds.
   */
  untilReady() {
    return Promise.all([_UniversalStore.preparation.promise, this.syncing?.promise]);
  }
  /** Creates a new instance of UniversalStore */
  static create(options) {
    if (!options || typeof options?.id !== "string") {
      throw new TypeError("id is required and must be a string, when creating a UniversalStore");
    }
    if (options.debug) {
      console.debug(
        dedent`[UniversalStore]
        create`,
        { options }
      );
    }
    const existing = instances.get(options.id);
    if (existing) {
      console.warn(dedent`UniversalStore with id "${options.id}" already exists in this environment, re-using existing.
        You should reuse the existing instance instead of trying to create a new one.`);
      return existing;
    }
    _UniversalStore.isInternalConstructing = true;
    const store = new _UniversalStore(options);
    instances.set(options.id, store);
    return store;
  }
  /**
   * Used by Storybook to set the channel for all instances of UniversalStore in the given
   * environment.
   *
   * @internal
   */
  static __prepare(channel, environment) {
    _UniversalStore.preparation.channel = channel;
    _UniversalStore.preparation.environment = environment;
    _UniversalStore.preparation.resolve({ channel, environment });
  }
  /**
   * Updates the store's state
   *
   * Either a new state or a state updater function can be passed to the method.
   */
  setState(updater) {
    const previousState = this.state;
    const newState = typeof updater === "function" ? updater(previousState) : updater;
    this.debug("setState", { newState, previousState, updater });
    if (this.status !== _UniversalStore.Status.READY) {
      throw new TypeError(
        dedent`Cannot set state before store is ready. You can get the current status with store.status,
        or await store.readyPromise to wait for the store to be ready before sending events.
        ${JSON.stringify(
          {
            newState,
            id: this.id,
            actor: this.actor,
            environment: this.environment
          },
          null,
          2
        )}`
      );
    }
    this.state = newState;
    const event = {
      type: _UniversalStore.InternalEventType.SET_STATE,
      payload: {
        state: newState,
        previousState
      }
    };
    this.emitToChannel(event, { actor: this.actor });
    this.emitToListeners(event, { actor: this.actor });
  }
  /**
   * Subscribes to state changes
   *
   * @returns Unsubscribe function
   */
  onStateChange(listener) {
    this.debug("onStateChange", { listener });
    return this.subscribe(
      _UniversalStore.InternalEventType.SET_STATE,
      ({ payload }, eventInfo) => {
        listener(payload.state, payload.previousState, eventInfo);
      }
    );
  }
  emitToChannel(event, eventInfo) {
    this.debug("emitToChannel", { event, eventInfo, channel: !!this.channel });
    this.channel?.emit(this.channelEventName, {
      event,
      eventInfo
    });
  }
  prepareThis({
    channel,
    environment
  }) {
    this.channel = channel;
    this.environment = environment;
    this.debug("prepared", { channel: !!channel, environment });
    this.channel.on(this.channelEventName, this.handleChannelEvents);
    if (this.actor.type === _UniversalStore.ActorType.LEADER) {
      this.emitToChannel(
        { type: _UniversalStore.InternalEventType.LEADER_CREATED },
        { actor: this.actor }
      );
    } else {
      this.emitToChannel(
        { type: _UniversalStore.InternalEventType.FOLLOWER_CREATED },
        { actor: this.actor }
      );
      this.emitToChannel(
        { type: _UniversalStore.InternalEventType.EXISTING_STATE_REQUEST },
        { actor: this.actor }
      );
      setTimeout(() => {
        this.syncing.reject(
          new TypeError(
            `No existing state found for follower with id: '${this.id}'. Make sure a leader with the same id exists before creating a follower.`
          )
        );
      }, 1e3);
    }
  }
  emitToListeners(event, eventInfo) {
    const eventTypeListeners = this.listeners.get(event.type);
    const everythingListeners = this.listeners.get("*");
    this.debug("emitToListeners", {
      event,
      eventInfo,
      eventTypeListeners,
      everythingListeners
    });
    [...eventTypeListeners ?? [], ...everythingListeners ?? []].forEach(
      (listener) => listener(event, eventInfo)
    );
  }
  handleChannelEvents(channelEvent) {
    const { event, eventInfo } = channelEvent;
    if ([eventInfo.actor.id, eventInfo.forwardingActor?.id].includes(this.actor.id)) {
      this.debug("handleChannelEvents: Ignoring event from self", { channelEvent });
      return;
    } else if (this.syncing?.state === ProgressState.PENDING && event.type !== _UniversalStore.InternalEventType.EXISTING_STATE_RESPONSE) {
      this.debug("handleChannelEvents: Ignoring event while syncing", { channelEvent });
      return;
    }
    this.debug("handleChannelEvents", { channelEvent });
    if (this.actor.type === _UniversalStore.ActorType.LEADER) {
      let shouldForwardEvent = true;
      switch (event.type) {
        case _UniversalStore.InternalEventType.EXISTING_STATE_REQUEST:
          shouldForwardEvent = false;
          const responseEvent = {
            type: _UniversalStore.InternalEventType.EXISTING_STATE_RESPONSE,
            payload: this.state
          };
          this.debug("handleChannelEvents: responding to existing state request", {
            responseEvent
          });
          this.emitToChannel(responseEvent, { actor: this.actor });
          this.emitToListeners(responseEvent, { actor: this.actor });
          break;
        case _UniversalStore.InternalEventType.LEADER_CREATED:
          shouldForwardEvent = false;
          this.syncing.state = ProgressState.REJECTED;
          this.debug("handleChannelEvents: erroring due to second leader being created", {
            event
          });
          console.error(
            dedent`Detected multiple UniversalStore leaders created with the same id "${this.id}".
            Only one leader can exists at a time, your stores are now in an invalid state.
            Leaders detected:
            this: ${JSON.stringify(this.actor, null, 2)}
            other: ${JSON.stringify(eventInfo.actor, null, 2)}`
          );
          break;
      }
      if (shouldForwardEvent) {
        this.debug("handleChannelEvents: forwarding event", { channelEvent });
        this.emitToChannel(event, { actor: eventInfo.actor, forwardingActor: this.actor });
      }
    }
    if (this.actor.type === _UniversalStore.ActorType.FOLLOWER) {
      switch (event.type) {
        case _UniversalStore.InternalEventType.EXISTING_STATE_RESPONSE:
          this.debug("handleChannelEvents: Setting state from leader's existing state response", {
            event
          });
          if (this.syncing?.state !== ProgressState.PENDING) {
            break;
          }
          this.syncing.resolve?.();
          const setStateEvent = {
            type: _UniversalStore.InternalEventType.SET_STATE,
            payload: {
              state: event.payload,
              previousState: this.state
            }
          };
          this.state = event.payload;
          this.emitToListeners(setStateEvent, eventInfo);
          break;
      }
    }
    switch (event.type) {
      case _UniversalStore.InternalEventType.SET_STATE:
        this.debug("handleChannelEvents: Setting state", { event });
        this.state = event.payload.state;
        break;
    }
    this.emitToListeners(event, { actor: eventInfo.actor });
  }
  debug(message, data) {
    if (this.debugging) {
      console.debug(
        dedent`[UniversalStore::${this.id}::${this.environment ?? _UniversalStore.Environment.UNKNOWN}]
        ${message}`,
        JSON.stringify(
          {
            data,
            actor: this.actor,
            state: this.state,
            status: this.status
          },
          null,
          2
        )
      );
    }
  }
  /**
   * Used to reset the static fields of the UniversalStore class when cleaning up tests
   *
   * @internal
   */
  static __reset() {
    _UniversalStore.preparation.reject(new Error("reset"));
    _UniversalStore.setupPreparationPromise();
    _UniversalStore.isInternalConstructing = false;
  }
};
__name(_UniversalStore, "UniversalStore");
/**
 * Defines the possible actor types in the store system
 *
 * @readonly
 */
_UniversalStore.ActorType = {
  LEADER: "LEADER",
  FOLLOWER: "FOLLOWER"
};
/**
 * Defines the possible environments the store can run in
 *
 * @readonly
 */
_UniversalStore.Environment = {
  SERVER: "SERVER",
  MANAGER: "MANAGER",
  PREVIEW: "PREVIEW",
  UNKNOWN: "UNKNOWN",
  MOCK: "MOCK"
};
/**
 * Internal event types used for store synchronization
 *
 * @readonly
 */
_UniversalStore.InternalEventType = {
  EXISTING_STATE_REQUEST: "__EXISTING_STATE_REQUEST",
  EXISTING_STATE_RESPONSE: "__EXISTING_STATE_RESPONSE",
  SET_STATE: "__SET_STATE",
  LEADER_CREATED: "__LEADER_CREATED",
  FOLLOWER_CREATED: "__FOLLOWER_CREATED"
};
_UniversalStore.Status = {
  UNPREPARED: "UNPREPARED",
  SYNCING: "SYNCING",
  READY: "READY",
  ERROR: "ERROR"
};
// This is used to check if constructor was called from the static factory create()
_UniversalStore.isInternalConstructing = false;
_UniversalStore.setupPreparationPromise();
var UniversalStore = _UniversalStore;

// ../node_modules/telejson/dist/chunk-EAFQLD22.mjs
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
var eventProperties = [
  "bubbles",
  "cancelBubble",
  "cancelable",
  "composed",
  "currentTarget",
  "defaultPrevented",
  "eventPhase",
  "isTrusted",
  "returnValue",
  "srcElement",
  "target",
  "timeStamp",
  "type"
];
var customEventSpecificProperties = ["detail"];
function extractEventHiddenProperties(event) {
  const rebuildEvent = eventProperties.filter((value) => event[value] !== void 0).reduce((acc, value) => {
    acc[value] = event[value];
    return acc;
  }, {});
  if (event instanceof CustomEvent) {
    for (const value of customEventSpecificProperties.filter(
      (value2) => event[value2] !== void 0
    )) {
      rebuildEvent[value] = event[value];
    }
  }
  return rebuildEvent;
}
__name(extractEventHiddenProperties, "extractEventHiddenProperties");

// ../node_modules/telejson/dist/index.mjs
var require_es_object_atoms = __commonJS({
  "node_modules/.pnpm/es-object-atoms@1.1.1/node_modules/es-object-atoms/index.js"(exports, module) {
    "use strict";
    module.exports = Object;
  }
});
var require_es_errors = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/index.js"(exports, module) {
    "use strict";
    module.exports = Error;
  }
});
var require_eval = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/eval.js"(exports, module) {
    "use strict";
    module.exports = EvalError;
  }
});
var require_range = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/range.js"(exports, module) {
    "use strict";
    module.exports = RangeError;
  }
});
var require_ref = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/ref.js"(exports, module) {
    "use strict";
    module.exports = ReferenceError;
  }
});
var require_syntax = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/syntax.js"(exports, module) {
    "use strict";
    module.exports = SyntaxError;
  }
});
var require_type = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/type.js"(exports, module) {
    "use strict";
    module.exports = TypeError;
  }
});
var require_uri = __commonJS({
  "node_modules/.pnpm/es-errors@1.3.0/node_modules/es-errors/uri.js"(exports, module) {
    "use strict";
    module.exports = URIError;
  }
});
var require_abs = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/abs.js"(exports, module) {
    "use strict";
    module.exports = Math.abs;
  }
});
var require_floor = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/floor.js"(exports, module) {
    "use strict";
    module.exports = Math.floor;
  }
});
var require_max = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/max.js"(exports, module) {
    "use strict";
    module.exports = Math.max;
  }
});
var require_min = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/min.js"(exports, module) {
    "use strict";
    module.exports = Math.min;
  }
});
var require_pow = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/pow.js"(exports, module) {
    "use strict";
    module.exports = Math.pow;
  }
});
var require_round = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/round.js"(exports, module) {
    "use strict";
    module.exports = Math.round;
  }
});
var require_isNaN = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/isNaN.js"(exports, module) {
    "use strict";
    module.exports = Number.isNaN || /* @__PURE__ */ __name(function isNaN2(a) {
      return a !== a;
    }, "isNaN2");
  }
});
var require_sign = __commonJS({
  "node_modules/.pnpm/math-intrinsics@1.1.0/node_modules/math-intrinsics/sign.js"(exports, module) {
    "use strict";
    var $isNaN = require_isNaN();
    module.exports = /* @__PURE__ */ __name(function sign(number) {
      if ($isNaN(number) || number === 0) {
        return number;
      }
      return number < 0 ? -1 : 1;
    }, "sign");
  }
});
var require_gOPD = __commonJS({
  "node_modules/.pnpm/gopd@1.2.0/node_modules/gopd/gOPD.js"(exports, module) {
    "use strict";
    module.exports = Object.getOwnPropertyDescriptor;
  }
});
var require_gopd = __commonJS({
  "node_modules/.pnpm/gopd@1.2.0/node_modules/gopd/index.js"(exports, module) {
    "use strict";
    var $gOPD = require_gOPD();
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  }
});
var require_es_define_property = __commonJS({
  "node_modules/.pnpm/es-define-property@1.0.1/node_modules/es-define-property/index.js"(exports, module) {
    "use strict";
    var $defineProperty = Object.defineProperty || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    module.exports = $defineProperty;
  }
});
var require_shams = __commonJS({
  "node_modules/.pnpm/has-symbols@1.1.0/node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    module.exports = /* @__PURE__ */ __name(function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (var _ in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = (
          /** @type {PropertyDescriptor} */
          Object.getOwnPropertyDescriptor(obj, sym)
        );
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    }, "hasSymbols");
  }
});
var require_has_symbols = __commonJS({
  "node_modules/.pnpm/has-symbols@1.1.0/node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = /* @__PURE__ */ __name(function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    }, "hasNativeSymbols");
  }
});
var require_Reflect_getPrototypeOf = __commonJS({
  "node_modules/.pnpm/get-proto@1.0.1/node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  }
});
var require_Object_getPrototypeOf = __commonJS({
  "node_modules/.pnpm/get-proto@1.0.1/node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
    "use strict";
    var $Object = require_es_object_atoms();
    module.exports = $Object.getPrototypeOf || null;
  }
});
var require_implementation = __commonJS({
  "node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = /* @__PURE__ */ __name(function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    }, "concatty2");
    var slicy = /* @__PURE__ */ __name(function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    }, "slicy2");
    var joiny = /* @__PURE__ */ __name(function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    }, "joiny");
    module.exports = /* @__PURE__ */ __name(function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = /* @__PURE__ */ __name(function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      }, "binder");
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = /* @__PURE__ */ __name(function Empty2() {
        }, "Empty2");
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    }, "bind");
  }
});
var require_function_bind = __commonJS({
  "node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    var implementation = require_implementation();
    module.exports = Function.prototype.bind || implementation;
  }
});
var require_functionCall = __commonJS({
  "node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.call;
  }
});
var require_functionApply = __commonJS({
  "node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.apply;
  }
});
var require_reflectApply = __commonJS({
  "node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  }
});
var require_actualApply = __commonJS({
  "node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var $reflectApply = require_reflectApply();
    module.exports = $reflectApply || bind.call($call, $apply);
  }
});
var require_call_bind_apply_helpers = __commonJS({
  "node_modules/.pnpm/call-bind-apply-helpers@1.0.2/node_modules/call-bind-apply-helpers/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $TypeError = require_type();
    var $call = require_functionCall();
    var $actualApply = require_actualApply();
    module.exports = /* @__PURE__ */ __name(function callBindBasic(args) {
      if (args.length < 1 || typeof args[0] !== "function") {
        throw new $TypeError("a function is required");
      }
      return $actualApply(bind, $call, args);
    }, "callBindBasic");
  }
});
var require_get = __commonJS({
  "node_modules/.pnpm/dunder-proto@1.0.1/node_modules/dunder-proto/get.js"(exports, module) {
    "use strict";
    var callBind = require_call_bind_apply_helpers();
    var gOPD = require_gopd();
    var hasProtoAccessor;
    try {
      hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
      [].__proto__ === Array.prototype;
    } catch (e) {
      if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
        throw e;
      }
    }
    var desc = !!hasProtoAccessor && gOPD && gOPD(
      Object.prototype,
      /** @type {keyof typeof Object.prototype} */
      "__proto__"
    );
    var $Object = Object;
    var $getPrototypeOf = $Object.getPrototypeOf;
    module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
      /** @type {import('./get')} */
      /* @__PURE__ */ __name(function getDunder(value) {
        return $getPrototypeOf(value == null ? value : $Object(value));
      }, "getDunder")
    ) : false;
  }
});
var require_get_proto = __commonJS({
  "node_modules/.pnpm/get-proto@1.0.1/node_modules/get-proto/index.js"(exports, module) {
    "use strict";
    var reflectGetProto = require_Reflect_getPrototypeOf();
    var originalGetProto = require_Object_getPrototypeOf();
    var getDunderProto = require_get();
    module.exports = reflectGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      return reflectGetProto(O);
    }, "getProto") : originalGetProto ? /* @__PURE__ */ __name(function getProto(O) {
      if (!O || typeof O !== "object" && typeof O !== "function") {
        throw new TypeError("getProto: not an object");
      }
      return originalGetProto(O);
    }, "getProto") : getDunderProto ? /* @__PURE__ */ __name(function getProto(O) {
      return getDunderProto(O);
    }, "getProto") : null;
  }
});
var require_hasown = __commonJS({
  "node_modules/.pnpm/hasown@2.0.2/node_modules/hasown/index.js"(exports, module) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module.exports = bind.call(call, $hasOwn);
  }
});
var require_get_intrinsic = __commonJS({
  "node_modules/.pnpm/get-intrinsic@1.3.0/node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    var undefined2;
    var $Object = require_es_object_atoms();
    var $Error = require_es_errors();
    var $EvalError = require_eval();
    var $RangeError = require_range();
    var $ReferenceError = require_ref();
    var $SyntaxError = require_syntax();
    var $TypeError = require_type();
    var $URIError = require_uri();
    var abs = require_abs();
    var floor = require_floor();
    var max = require_max();
    var min = require_min();
    var pow = require_pow();
    var round = require_round();
    var sign = require_sign();
    var $Function = Function;
    var getEvalledConstructor = /* @__PURE__ */ __name(function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    }, "getEvalledConstructor");
    var $gOPD = require_gopd();
    var $defineProperty = require_es_define_property();
    var throwTypeError = /* @__PURE__ */ __name(function() {
      throw new $TypeError();
    }, "throwTypeError");
    var ThrowTypeError = $gOPD ? function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    }() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = require_get_proto();
    var $ObjectGPO = require_Object_getPrototypeOf();
    var $ReflectGPO = require_Reflect_getPrototypeOf();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": $Object,
      "%Object.getOwnPropertyDescriptor%": $gOPD,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "%Function.prototype.call%": $call,
      "%Function.prototype.apply%": $apply,
      "%Object.defineProperty%": $defineProperty,
      "%Object.getPrototypeOf%": $ObjectGPO,
      "%Math.abs%": abs,
      "%Math.floor%": floor,
      "%Math.max%": max,
      "%Math.min%": min,
      "%Math.pow%": pow,
      "%Math.round%": round,
      "%Math.sign%": sign,
      "%Reflect.getPrototypeOf%": $ReflectGPO
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = /* @__PURE__ */ __name(function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    }, "doEval2");
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call($call, Array.prototype.concat);
    var $spliceApply = bind.call($apply, Array.prototype.splice);
    var $replace = bind.call($call, String.prototype.replace);
    var $strSlice = bind.call($call, String.prototype.slice);
    var $exec = bind.call($call, RegExp.prototype.exec);
    var rePropName2 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar2 = /\\(\\)?/g;
    var stringToPath2 = /* @__PURE__ */ __name(function stringToPath3(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName2, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar2, "$1") : number || match;
      });
      return result;
    }, "stringToPath3");
    var getBaseIntrinsic = /* @__PURE__ */ __name(function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    }, "getBaseIntrinsic2");
    module.exports = /* @__PURE__ */ __name(function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath2(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void 0;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    }, "GetIntrinsic");
  }
});
var require_call_bound = __commonJS({
  "node_modules/.pnpm/call-bound@1.0.4/node_modules/call-bound/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBindBasic = require_call_bind_apply_helpers();
    var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
    module.exports = /* @__PURE__ */ __name(function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = (
        /** @type {(this: unknown, ...args: unknown[]) => unknown} */
        GetIntrinsic(name, !!allowMissing)
      );
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBindBasic(
          /** @type {const} */
          [intrinsic]
        );
      }
      return intrinsic;
    }, "callBoundIntrinsic");
  }
});
var require_shams2 = __commonJS({
  "node_modules/.pnpm/has-tostringtag@1.0.2/node_modules/has-tostringtag/shams.js"(exports, module) {
    "use strict";
    var hasSymbols = require_shams();
    module.exports = /* @__PURE__ */ __name(function hasToStringTagShams() {
      return hasSymbols() && !!Symbol.toStringTag;
    }, "hasToStringTagShams");
  }
});
var require_is_regex = __commonJS({
  "node_modules/.pnpm/is-regex@1.2.1/node_modules/is-regex/index.js"(exports, module) {
    "use strict";
    var callBound = require_call_bound();
    var hasToStringTag = require_shams2()();
    var hasOwn = require_hasown();
    var gOPD = require_gopd();
    var fn;
    if (hasToStringTag) {
      $exec = callBound("RegExp.prototype.exec");
      isRegexMarker = {};
      throwRegexMarker = /* @__PURE__ */ __name(function() {
        throw isRegexMarker;
      }, "throwRegexMarker");
      badStringifier = {
        toString: throwRegexMarker,
        valueOf: throwRegexMarker
      };
      if (typeof Symbol.toPrimitive === "symbol") {
        badStringifier[Symbol.toPrimitive] = throwRegexMarker;
      }
      fn = /* @__PURE__ */ __name(function isRegex(value) {
        if (!value || typeof value !== "object") {
          return false;
        }
        var descriptor = (
          /** @type {NonNullable<typeof gOPD>} */
          gOPD(
            /** @type {{ lastIndex?: unknown }} */
            value,
            "lastIndex"
          )
        );
        var hasLastIndexDataProperty = descriptor && hasOwn(descriptor, "value");
        if (!hasLastIndexDataProperty) {
          return false;
        }
        try {
          $exec(
            value,
            /** @type {string} */
            /** @type {unknown} */
            badStringifier
          );
        } catch (e) {
          return e === isRegexMarker;
        }
      }, "isRegex");
    } else {
      $toString = callBound("Object.prototype.toString");
      regexClass = "[object RegExp]";
      fn = /* @__PURE__ */ __name(function isRegex(value) {
        if (!value || typeof value !== "object" && typeof value !== "function") {
          return false;
        }
        return $toString(value) === regexClass;
      }, "isRegex");
    }
    var $exec;
    var isRegexMarker;
    var throwRegexMarker;
    var badStringifier;
    var $toString;
    var regexClass;
    module.exports = fn;
  }
});
var require_is_function = __commonJS({
  "node_modules/.pnpm/is-function@1.0.2/node_modules/is-function/index.js"(exports, module) {
    module.exports = isFunction3;
    var toString2 = Object.prototype.toString;
    function isFunction3(fn) {
      if (!fn) {
        return false;
      }
      var string = toString2.call(fn);
      return string === "[object Function]" || typeof fn === "function" && string !== "[object RegExp]" || typeof window !== "undefined" && // IE8 and below
      (fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt);
    }
    __name(isFunction3, "isFunction3");
  }
});
var require_safe_regex_test = __commonJS({
  "node_modules/.pnpm/safe-regex-test@1.1.0/node_modules/safe-regex-test/index.js"(exports, module) {
    "use strict";
    var callBound = require_call_bound();
    var isRegex = require_is_regex();
    var $exec = callBound("RegExp.prototype.exec");
    var $TypeError = require_type();
    module.exports = /* @__PURE__ */ __name(function regexTester(regex) {
      if (!isRegex(regex)) {
        throw new $TypeError("`regex` must be a RegExp");
      }
      return /* @__PURE__ */ __name(function test(s) {
        return $exec(regex, s) !== null;
      }, "test");
    }, "regexTester");
  }
});
var require_is_symbol = __commonJS({
  "node_modules/.pnpm/is-symbol@1.1.1/node_modules/is-symbol/index.js"(exports, module) {
    "use strict";
    var callBound = require_call_bound();
    var $toString = callBound("Object.prototype.toString");
    var hasSymbols = require_has_symbols()();
    var safeRegexTest = require_safe_regex_test();
    if (hasSymbols) {
      $symToStr = callBound("Symbol.prototype.toString");
      isSymString = safeRegexTest(/^Symbol\(.*\)$/);
      isSymbolObject = /* @__PURE__ */ __name(function isRealSymbolObject(value) {
        if (typeof value.valueOf() !== "symbol") {
          return false;
        }
        return isSymString($symToStr(value));
      }, "isRealSymbolObject");
      module.exports = /* @__PURE__ */ __name(function isSymbol3(value) {
        if (typeof value === "symbol") {
          return true;
        }
        if (!value || typeof value !== "object" || $toString(value) !== "[object Symbol]") {
          return false;
        }
        try {
          return isSymbolObject(value);
        } catch (e) {
          return false;
        }
      }, "isSymbol3");
    } else {
      module.exports = /* @__PURE__ */ __name(function isSymbol3(value) {
        return false;
      }, "isSymbol3");
    }
    var $symToStr;
    var isSymString;
    var isSymbolObject;
  }
});
var import_is_regex = __toESM(require_is_regex());
var import_is_function = __toESM(require_is_function());
var import_is_symbol = __toESM(require_is_symbol());
function isObject(val) {
  return val != null && typeof val === "object" && Array.isArray(val) === false;
}
__name(isObject, "isObject");
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeGlobal_default = freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal_default || freeSelf || Function("return this")();
var root_default = root;
var Symbol2 = root_default.Symbol;
var Symbol_default = Symbol2;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
__name(getRawTag, "getRawTag");
var getRawTag_default = getRawTag;
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
__name(objectToString, "objectToString");
var objectToString_default = objectToString;
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
}
__name(baseGetTag, "baseGetTag");
var baseGetTag_default = baseGetTag;
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
__name(isObjectLike, "isObjectLike");
var isObjectLike_default = isObjectLike;
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
}
__name(isSymbol, "isSymbol");
var isSymbol_default = isSymbol;
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
__name(arrayMap, "arrayMap");
var arrayMap_default = arrayMap;
var isArray = Array.isArray;
var isArray_default = isArray;
var INFINITY = 1 / 0;
var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
var symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
__name(baseToString, "baseToString");
var baseToString_default = baseToString;
function isObject2(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
__name(isObject2, "isObject2");
var isObject_default = isObject2;
var asyncTag = "[object AsyncFunction]";
var funcTag = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
__name(isFunction, "isFunction");
var isFunction_default = isFunction;
var coreJsData = root_default["__core-js_shared__"];
var coreJsData_default = coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
__name(isMasked, "isMasked");
var isMasked_default = isMasked;
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
__name(toSource, "toSource");
var toSource_default = toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto2 = Function.prototype;
var objectProto3 = Object.prototype;
var funcToString2 = funcProto2.toString;
var hasOwnProperty2 = objectProto3.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject_default(value) || isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource_default(value));
}
__name(baseIsNative, "baseIsNative");
var baseIsNative_default = baseIsNative;
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
__name(getValue, "getValue");
var getValue_default = getValue;
function getNative(object, key) {
  var value = getValue_default(object, key);
  return baseIsNative_default(value) ? value : void 0;
}
__name(getNative, "getNative");
var getNative_default = getNative;
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
__name(eq, "eq");
var eq_default = eq;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
__name(isKey, "isKey");
var isKey_default = isKey;
var nativeCreate = getNative_default(Object, "create");
var nativeCreate_default = nativeCreate;
function hashClear() {
  this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
  this.size = 0;
}
__name(hashClear, "hashClear");
var hashClear_default = hashClear;
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
__name(hashDelete, "hashDelete");
var hashDelete_default = hashDelete;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var objectProto4 = Object.prototype;
var hasOwnProperty3 = objectProto4.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate_default) {
    var result = data[key];
    return result === HASH_UNDEFINED ? void 0 : result;
  }
  return hasOwnProperty3.call(data, key) ? data[key] : void 0;
}
__name(hashGet, "hashGet");
var hashGet_default = hashGet;
var objectProto5 = Object.prototype;
var hasOwnProperty4 = objectProto5.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty4.call(data, key);
}
__name(hashHas, "hashHas");
var hashHas_default = hashHas;
var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
  return this;
}
__name(hashSet, "hashSet");
var hashSet_default = hashSet;
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
__name(Hash, "Hash");
Hash.prototype.clear = hashClear_default;
Hash.prototype["delete"] = hashDelete_default;
Hash.prototype.get = hashGet_default;
Hash.prototype.has = hashHas_default;
Hash.prototype.set = hashSet_default;
var Hash_default = Hash;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
__name(listCacheClear, "listCacheClear");
var listCacheClear_default = listCacheClear;
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
__name(assocIndexOf, "assocIndexOf");
var assocIndexOf_default = assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
__name(listCacheDelete, "listCacheDelete");
var listCacheDelete_default = listCacheDelete;
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  return index < 0 ? void 0 : data[index][1];
}
__name(listCacheGet, "listCacheGet");
var listCacheGet_default = listCacheGet;
function listCacheHas(key) {
  return assocIndexOf_default(this.__data__, key) > -1;
}
__name(listCacheHas, "listCacheHas");
var listCacheHas_default = listCacheHas;
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
__name(listCacheSet, "listCacheSet");
var listCacheSet_default = listCacheSet;
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
__name(ListCache, "ListCache");
ListCache.prototype.clear = listCacheClear_default;
ListCache.prototype["delete"] = listCacheDelete_default;
ListCache.prototype.get = listCacheGet_default;
ListCache.prototype.has = listCacheHas_default;
ListCache.prototype.set = listCacheSet_default;
var ListCache_default = ListCache;
var Map2 = getNative_default(root_default, "Map");
var Map_default = Map2;
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash_default(),
    "map": new (Map_default || ListCache_default)(),
    "string": new Hash_default()
  };
}
__name(mapCacheClear, "mapCacheClear");
var mapCacheClear_default = mapCacheClear;
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
__name(isKeyable, "isKeyable");
var isKeyable_default = isKeyable;
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
__name(getMapData, "getMapData");
var getMapData_default = getMapData;
function mapCacheDelete(key) {
  var result = getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
__name(mapCacheDelete, "mapCacheDelete");
var mapCacheDelete_default = mapCacheDelete;
function mapCacheGet(key) {
  return getMapData_default(this, key).get(key);
}
__name(mapCacheGet, "mapCacheGet");
var mapCacheGet_default = mapCacheGet;
function mapCacheHas(key) {
  return getMapData_default(this, key).has(key);
}
__name(mapCacheHas, "mapCacheHas");
var mapCacheHas_default = mapCacheHas;
function mapCacheSet(key, value) {
  var data = getMapData_default(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
__name(mapCacheSet, "mapCacheSet");
var mapCacheSet_default = mapCacheSet;
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
__name(MapCache, "MapCache");
MapCache.prototype.clear = mapCacheClear_default;
MapCache.prototype["delete"] = mapCacheDelete_default;
MapCache.prototype.get = mapCacheGet_default;
MapCache.prototype.has = mapCacheHas_default;
MapCache.prototype.set = mapCacheSet_default;
var MapCache_default = MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = /* @__PURE__ */ __name(function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  }, "memoized");
  memoized.cache = new (memoize.Cache || MapCache_default)();
  return memoized;
}
__name(memoize, "memoize");
memoize.Cache = MapCache_default;
var memoize_default = memoize;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
__name(memoizeCapped, "memoizeCapped");
var memoizeCapped_default = memoizeCapped;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped_default(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var stringToPath_default = stringToPath;
function toString(value) {
  return value == null ? "" : baseToString_default(value);
}
__name(toString, "toString");
var toString_default = toString;
function castPath(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
}
__name(castPath, "castPath");
var castPath_default = castPath;
var INFINITY2 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
}
__name(toKey, "toKey");
var toKey_default = toKey;
function baseGet(object, path) {
  path = castPath_default(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[toKey_default(path[index++])];
  }
  return index && index == length ? object : void 0;
}
__name(baseGet, "baseGet");
var baseGet_default = baseGet;
function get(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet_default(object, path);
  return result === void 0 ? defaultValue : result;
}
__name(get, "get");
var get_default = get;
var isObject3 = isObject;
var dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
var isJSON = /* @__PURE__ */ __name((input) => input.match(/^[\[\{\"\}].*[\]\}\"]$/), "isJSON");
function convertUnconventionalData(data) {
  if (!isObject3(data)) {
    return data;
  }
  let result = data;
  let wasMutated = false;
  if (typeof Event !== "undefined" && data instanceof Event) {
    result = extractEventHiddenProperties(result);
    wasMutated = true;
  }
  result = Object.keys(result).reduce((acc, key) => {
    try {
      if (result[key]) {
        result[key].toJSON;
      }
      acc[key] = result[key];
    } catch (_err) {
      wasMutated = true;
    }
    return acc;
  }, {});
  return wasMutated ? result : data;
}
__name(convertUnconventionalData, "convertUnconventionalData");
var replacer = /* @__PURE__ */ __name(function replacer2(options) {
  let objects;
  let map;
  let stack;
  let keys;
  return /* @__PURE__ */ __name(function replace(key, value) {
    try {
      if (key === "") {
        keys = [];
        objects = /* @__PURE__ */ new Map([[value, "[]"]]);
        map = /* @__PURE__ */ new Map();
        stack = [];
        return value;
      }
      const origin = map.get(this) || this;
      while (stack.length && origin !== stack[0]) {
        stack.shift();
        keys.pop();
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (value === void 0) {
        if (!options.allowUndefined) {
          return void 0;
        }
        return "_undefined_";
      }
      if (value === null) {
        return null;
      }
      if (typeof value === "number") {
        if (value === Number.NEGATIVE_INFINITY) {
          return "_-Infinity_";
        }
        if (value === Number.POSITIVE_INFINITY) {
          return "_Infinity_";
        }
        if (Number.isNaN(value)) {
          return "_NaN_";
        }
        return value;
      }
      if (typeof value === "bigint") {
        return `_bigint_${value.toString()}`;
      }
      if (typeof value === "string") {
        if (dateFormat.test(value)) {
          if (!options.allowDate) {
            return void 0;
          }
          return `_date_${value}`;
        }
        return value;
      }
      if ((0, import_is_regex.default)(value)) {
        if (!options.allowRegExp) {
          return void 0;
        }
        return `_regexp_${value.flags}|${value.source}`;
      }
      if ((0, import_is_function.default)(value)) {
        return void 0;
      }
      if ((0, import_is_symbol.default)(value)) {
        if (!options.allowSymbol) {
          return void 0;
        }
        const globalRegistryKey = Symbol.keyFor(value);
        if (globalRegistryKey !== void 0) {
          return `_gsymbol_${globalRegistryKey}`;
        }
        return `_symbol_${value.toString().slice(7, -1)}`;
      }
      if (stack.length >= options.maxDepth) {
        if (Array.isArray(value)) {
          return `[Array(${value.length})]`;
        }
        return "[Object]";
      }
      if (value === this) {
        return `_duplicate_${JSON.stringify(keys)}`;
      }
      if (value instanceof Error && options.allowError) {
        return {
          __isConvertedError__: true,
          errorProperties: {
            // @ts-expect-error cause is not defined in the current tsconfig target(es2020)
            ...value.cause ? { cause: value.cause } : {},
            ...value,
            name: value.name,
            message: value.message,
            stack: value.stack,
            "_constructor-name_": value.constructor.name
          }
        };
      }
      if (value?.constructor?.name && value.constructor.name !== "Object" && !Array.isArray(value)) {
        const found2 = objects.get(value);
        if (!found2) {
          const plainObject = {
            __isClassInstance__: true,
            __className__: value.constructor.name,
            ...Object.getOwnPropertyNames(value).reduce(
              (acc, prop) => {
                try {
                  acc[prop] = value[prop];
                } catch (_err) {
                }
                return acc;
              },
              {}
            )
          };
          keys.push(key);
          stack.unshift(plainObject);
          objects.set(value, JSON.stringify(keys));
          if (value !== plainObject) {
            map.set(value, plainObject);
          }
          return plainObject;
        }
        return `_duplicate_${found2}`;
      }
      const found = objects.get(value);
      if (!found) {
        const converted = Array.isArray(value) ? value : convertUnconventionalData(value);
        keys.push(key);
        stack.unshift(converted);
        objects.set(value, JSON.stringify(keys));
        if (value !== converted) {
          map.set(value, converted);
        }
        return converted;
      }
      return `_duplicate_${found}`;
    } catch (_e) {
      return void 0;
    }
  }, "replace");
}, "replacer2");
var reviver = /* @__PURE__ */ __name(function reviver2(options) {
  const refs = [];
  let root2;
  return /* @__PURE__ */ __name(function revive(key, value) {
    if (key === "") {
      root2 = value;
      refs.forEach(({ target, container, replacement }) => {
        const replacementArr = isJSON(replacement) ? JSON.parse(replacement) : replacement.split(".");
        if (replacementArr.length === 0) {
          container[target] = root2;
        } else {
          container[target] = get_default(root2, replacementArr);
        }
      });
    }
    if (key === "_constructor-name_") {
      return value;
    }
    if (isObject3(value) && value.__isConvertedError__) {
      const { message, ...properties } = value.errorProperties;
      const error = new Error(message);
      Object.assign(error, properties);
      return error;
    }
    if (typeof value === "string" && value.startsWith("_regexp_") && options.allowRegExp) {
      const [, flags, source] = value.match(/_regexp_([^|]*)\|(.*)/) || [];
      return new RegExp(source, flags);
    }
    if (typeof value === "string" && value.startsWith("_date_") && options.allowDate) {
      return new Date(value.replace("_date_", ""));
    }
    if (typeof value === "string" && value.startsWith("_duplicate_")) {
      refs.push({ target: key, container: this, replacement: value.replace(/^_duplicate_/, "") });
      return null;
    }
    if (typeof value === "string" && value.startsWith("_symbol_") && options.allowSymbol) {
      return Symbol(value.replace("_symbol_", ""));
    }
    if (typeof value === "string" && value.startsWith("_gsymbol_") && options.allowSymbol) {
      return Symbol.for(value.replace("_gsymbol_", ""));
    }
    if (typeof value === "string" && value === "_-Infinity_") {
      return Number.NEGATIVE_INFINITY;
    }
    if (typeof value === "string" && value === "_Infinity_") {
      return Number.POSITIVE_INFINITY;
    }
    if (typeof value === "string" && value === "_NaN_") {
      return Number.NaN;
    }
    if (typeof value === "string" && value.startsWith("_bigint_") && typeof BigInt === "function") {
      return BigInt(value.replace("_bigint_", ""));
    }
    return value;
  }, "revive");
}, "reviver2");
var defaultOptions = {
  maxDepth: 10,
  space: void 0,
  allowRegExp: true,
  allowDate: true,
  allowError: true,
  allowUndefined: true,
  allowSymbol: true
};
var stringify = /* @__PURE__ */ __name((data, options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  return JSON.stringify(convertUnconventionalData(data), replacer(mergedOptions), options.space);
}, "stringify");
var mutator = /* @__PURE__ */ __name(() => {
  const mutated = /* @__PURE__ */ new Map();
  return /* @__PURE__ */ __name(function mutateUndefined(value) {
    if (isObject3(value)) {
      Object.entries(value).forEach(([k, v]) => {
        if (v === "_undefined_") {
          value[k] = void 0;
        } else if (!mutated.get(v)) {
          mutated.set(v, true);
          mutateUndefined(v);
        }
      });
    }
    if (Array.isArray(value)) {
      value.forEach((v, index) => {
        if (v === "_undefined_") {
          mutated.set(v, true);
          value[index] = void 0;
        } else if (!mutated.get(v)) {
          mutated.set(v, true);
          mutateUndefined(v);
        }
      });
    }
  }, "mutateUndefined");
}, "mutator");
var parse = /* @__PURE__ */ __name((data, options = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const result = JSON.parse(data, reviver(mergedOptions));
  mutator()(result);
  return result;
}, "parse");

export {
  UniversalStore,
  isJSON,
  stringify,
  parse
};
