import {
  UniversalStore,
  isJSON,
  parse,
  stringify
} from "../_browser-chunks/chunk-XDGMHOV7.js";
import {
  invariant
} from "../_browser-chunks/chunk-FUOHXXZT.js";
import "../_browser-chunks/chunk-OPCDBBL3.js";
import {
  __name
} from "../_browser-chunks/chunk-MM7DTO55.js";

// src/channels/index.ts
import { global as global3 } from "@storybook/global";

// src/channels/main.ts
var isMulti = /* @__PURE__ */ __name((args) => {
  return args.transports !== void 0;
}, "isMulti");
var generateRandomId = /* @__PURE__ */ __name(() => {
  return Math.random().toString(16).slice(2);
}, "generateRandomId");
var _Channel = class _Channel {
  constructor(input = {}) {
    this.sender = generateRandomId();
    this.events = {};
    this.data = {};
    this.transports = [];
    this.isAsync = input.async || false;
    if (isMulti(input)) {
      this.transports = input.transports || [];
      this.transports.forEach((t) => {
        t.setHandler((event) => this.handleEvent(event));
      });
    } else {
      this.transports = input.transport ? [input.transport] : [];
    }
    this.transports.forEach((t) => {
      t.setHandler((event) => this.handleEvent(event));
    });
  }
  get hasTransport() {
    return this.transports.length > 0;
  }
  addListener(eventName, listener) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(listener);
  }
  emit(eventName, ...args) {
    const event = { type: eventName, args, from: this.sender };
    let options = {};
    if (args.length >= 1 && args[0] && args[0].options) {
      options = args[0].options;
    }
    const handler = /* @__PURE__ */ __name(() => {
      this.transports.forEach((t) => {
        t.send(event, options);
      });
      this.handleEvent(event);
    }, "handler");
    if (this.isAsync) {
      setImmediate(handler);
    } else {
      handler();
    }
  }
  last(eventName) {
    return this.data[eventName];
  }
  eventNames() {
    return Object.keys(this.events);
  }
  listenerCount(eventName) {
    const listeners = this.listeners(eventName);
    return listeners ? listeners.length : 0;
  }
  listeners(eventName) {
    const listeners = this.events[eventName];
    return listeners || void 0;
  }
  once(eventName, listener) {
    const onceListener = this.onceListener(eventName, listener);
    this.addListener(eventName, onceListener);
  }
  removeAllListeners(eventName) {
    if (!eventName) {
      this.events = {};
    } else if (this.events[eventName]) {
      delete this.events[eventName];
    }
  }
  removeListener(eventName, listener) {
    const listeners = this.listeners(eventName);
    if (listeners) {
      this.events[eventName] = listeners.filter((l) => l !== listener);
    }
  }
  on(eventName, listener) {
    this.addListener(eventName, listener);
  }
  off(eventName, listener) {
    this.removeListener(eventName, listener);
  }
  handleEvent(event) {
    const listeners = this.listeners(event.type);
    if (listeners && listeners.length) {
      listeners.forEach((fn) => {
        fn.apply(event, event.args);
      });
    }
    this.data[event.type] = event.args;
  }
  onceListener(eventName, listener) {
    const onceListener = /* @__PURE__ */ __name((...args) => {
      this.removeListener(eventName, onceListener);
      return listener(...args);
    }, "onceListener");
    return onceListener;
  }
};
__name(_Channel, "Channel");
var Channel = _Channel;

// src/channels/postmessage/index.ts
import { logger as logger2, pretty } from "storybook/internal/client-logger";
import * as EVENTS from "storybook/internal/core-events";
import { global } from "@storybook/global";

// src/channels/postmessage/getEventSourceUrl.ts
import { logger } from "storybook/internal/client-logger";
var getEventSourceUrl = /* @__PURE__ */ __name((event) => {
  const frames = Array.from(
    document.querySelectorAll("iframe[data-is-storybook]")
  );
  const [frame, ...remainder] = frames.filter((element) => {
    try {
      return element.contentWindow?.location.origin === event.source.location.origin && element.contentWindow?.location.pathname === event.source.location.pathname;
    } catch (err) {
    }
    try {
      return element.contentWindow === event.source;
    } catch (err) {
    }
    const src2 = element.getAttribute("src");
    let origin;
    try {
      if (!src2) {
        return false;
      }
      ({ origin } = new URL(src2, document.location.toString()));
    } catch (err) {
      return false;
    }
    return origin === event.origin;
  });
  const src = frame?.getAttribute("src");
  if (src && remainder.length === 0) {
    const { protocol, host, pathname } = new URL(src, document.location.toString());
    return `${protocol}//${host}${pathname}`;
  }
  if (remainder.length > 0) {
    logger.error("found multiple candidates for event source");
  }
  return null;
}, "getEventSourceUrl");

// src/channels/postmessage/index.ts
var { document: document2, location } = global;
var KEY = "storybook-channel";
var defaultEventOptions = { maxDepth: 25 };
var _PostMessageTransport = class _PostMessageTransport {
  constructor(config) {
    this.config = config;
    this.connected = false;
    this.buffer = [];
    if (typeof global?.addEventListener === "function") {
      global.addEventListener("message", this.handleEvent.bind(this), false);
    }
    if (config.page !== "manager" && config.page !== "preview") {
      throw new Error(`postmsg-channel: "config.page" cannot be "${config.page}"`);
    }
  }
  setHandler(handler) {
    this.handler = (...args) => {
      handler.apply(this, args);
      if (!this.connected && this.getLocalFrame().length) {
        this.flush();
        this.connected = true;
      }
    };
  }
  /**
   * Sends `event` to the associated window. If the window does not yet exist the event will be
   * stored in a buffer and sent when the window exists.
   *
   * @param event
   */
  send(event, options) {
    const {
      target,
      // telejson options
      allowRegExp,
      allowSymbol,
      allowDate,
      allowError,
      allowUndefined,
      maxDepth,
      space
    } = options || {};
    const eventOptions = Object.fromEntries(
      Object.entries({
        allowRegExp,
        allowSymbol,
        allowDate,
        allowError,
        allowUndefined,
        maxDepth,
        space
      }).filter(([k, v]) => typeof v !== "undefined")
    );
    const stringifyOptions = {
      ...defaultEventOptions,
      ...global.CHANNEL_OPTIONS || {},
      ...eventOptions
    };
    const frames = this.getFrames(target);
    const query = new URLSearchParams(location?.search || "");
    const data = stringify(
      {
        key: KEY,
        event,
        refId: query.get("refId")
      },
      stringifyOptions
    );
    if (!frames.length) {
      return new Promise((resolve, reject) => {
        this.buffer.push({ event, resolve, reject });
      });
    }
    if (this.buffer.length) {
      this.flush();
    }
    frames.forEach((f) => {
      try {
        f.postMessage(data, "*");
      } catch (e) {
        logger2.error("sending over postmessage fail");
      }
    });
    return Promise.resolve(null);
  }
  flush() {
    const { buffer } = this;
    this.buffer = [];
    buffer.forEach((item) => {
      this.send(item.event).then(item.resolve).catch(item.reject);
    });
  }
  getFrames(target) {
    if (this.config.page === "manager") {
      const nodes = Array.from(
        document2.querySelectorAll("iframe[data-is-storybook][data-is-loaded]")
      );
      const list = nodes.flatMap((e) => {
        try {
          if (!!e.contentWindow && e.dataset.isStorybook !== void 0 && e.id === target) {
            return [e.contentWindow];
          }
          return [];
        } catch (er) {
          return [];
        }
      });
      return list?.length ? list : this.getCurrentFrames();
    }
    if (global && global.parent && global.parent !== global.self) {
      return [global.parent];
    }
    return [];
  }
  getCurrentFrames() {
    if (this.config.page === "manager") {
      const list = Array.from(
        document2.querySelectorAll('[data-is-storybook="true"]')
      );
      return list.flatMap((e) => e.contentWindow ? [e.contentWindow] : []);
    }
    if (global && global.parent) {
      return [global.parent];
    }
    return [];
  }
  getLocalFrame() {
    if (this.config.page === "manager") {
      const list = Array.from(
        document2.querySelectorAll("#storybook-preview-iframe")
      );
      return list.flatMap((e) => e.contentWindow ? [e.contentWindow] : []);
    }
    if (global && global.parent) {
      return [global.parent];
    }
    return [];
  }
  handleEvent(rawEvent) {
    try {
      const { data } = rawEvent;
      const { key, event, refId } = typeof data === "string" && isJSON(data) ? parse(data, global.CHANNEL_OPTIONS || {}) : data;
      if (key === KEY) {
        const pageString = this.config.page === "manager" ? `<span style="color: #37D5D3; background: black"> manager </span>` : `<span style="color: #1EA7FD; background: black"> preview </span>`;
        const eventString = Object.values(EVENTS).includes(event.type) ? `<span style="color: #FF4785">${event.type}</span>` : `<span style="color: #FFAE00">${event.type}</span>`;
        if (refId) {
          event.refId = refId;
        }
        event.source = this.config.page === "preview" ? rawEvent.origin : getEventSourceUrl(rawEvent);
        if (!event.source) {
          pretty.error(
            `${pageString} received ${eventString} but was unable to determine the source of the event`
          );
          return;
        }
        const message = `${pageString} received ${eventString} (${data.length})`;
        pretty.debug(
          location.origin !== event.source ? message : `${message} <span style="color: gray">(on ${location.origin} from ${event.source})</span>`,
          ...event.args
        );
        invariant(this.handler, "ChannelHandler should be set");
        this.handler(event);
      }
    } catch (error) {
      logger2.error(error);
    }
  }
};
__name(_PostMessageTransport, "PostMessageTransport");
var PostMessageTransport = _PostMessageTransport;

// src/channels/websocket/index.ts
import * as EVENTS2 from "storybook/internal/core-events";
import { global as global2 } from "@storybook/global";
var { WebSocket } = global2;
var HEARTBEAT_INTERVAL = 15e3;
var HEARTBEAT_MAX_LATENCY = 5e3;
var _WebsocketTransport = class _WebsocketTransport {
  constructor({ url, onError, page }) {
    this.buffer = [];
    this.isReady = false;
    this.isClosed = false;
    this.pingTimeout = 0;
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      this.isReady = true;
      this.heartbeat();
      this.flush();
    };
    this.socket.onmessage = ({ data }) => {
      const event = typeof data === "string" && isJSON(data) ? parse(data) : data;
      invariant(this.handler, "WebsocketTransport handler should be set");
      this.handler(event);
      if (event.type === "ping") {
        this.heartbeat();
        this.send({ type: "pong" });
      }
    };
    this.socket.onerror = (e) => {
      if (onError) {
        onError(e);
      }
    };
    this.socket.onclose = (ev) => {
      invariant(this.handler, "WebsocketTransport handler should be set");
      this.handler({
        type: EVENTS2.CHANNEL_WS_DISCONNECT,
        args: [{ reason: ev.reason, code: ev.code }],
        from: page || "preview"
      });
      this.isClosed = true;
      clearTimeout(this.pingTimeout);
    };
  }
  heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.socket.close(3008, "timeout");
    }, HEARTBEAT_INTERVAL + HEARTBEAT_MAX_LATENCY);
  }
  setHandler(handler) {
    this.handler = handler;
  }
  send(event) {
    if (!this.isClosed) {
      if (!this.isReady) {
        this.sendLater(event);
      } else {
        this.sendNow(event);
      }
    }
  }
  sendLater(event) {
    this.buffer.push(event);
  }
  sendNow(event) {
    const data = stringify(event, {
      maxDepth: 15,
      ...global2.CHANNEL_OPTIONS
    });
    this.socket.send(data);
  }
  flush() {
    const { buffer } = this;
    this.buffer = [];
    buffer.forEach((event) => this.send(event));
  }
};
__name(_WebsocketTransport, "WebsocketTransport");
var WebsocketTransport = _WebsocketTransport;

// src/channels/index.ts
var { CONFIG_TYPE } = global3;
var channels_default = Channel;
function createBrowserChannel({ page, extraTransports = [] }) {
  const transports = [new PostMessageTransport({ page }), ...extraTransports];
  if (CONFIG_TYPE === "DEVELOPMENT") {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const { hostname, port } = window.location;
    const channelUrl = `${protocol}://${hostname}:${port}/storybook-server-channel`;
    transports.push(new WebsocketTransport({ url: channelUrl, onError: /* @__PURE__ */ __name(() => {
    }, "onError"), page }));
  }
  const channel = new Channel({ transports });
  UniversalStore.__prepare(
    channel,
    page === "manager" ? UniversalStore.Environment.MANAGER : UniversalStore.Environment.PREVIEW
  );
  return channel;
}
__name(createBrowserChannel, "createBrowserChannel");
export {
  Channel,
  HEARTBEAT_INTERVAL,
  HEARTBEAT_MAX_LATENCY,
  PostMessageTransport,
  WebsocketTransport,
  createBrowserChannel,
  channels_default as default
};
