import {
  EVENT_ID
} from "./chunk-XW6KSYKF.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// src/actions/runtime/configureActions.ts
var config = {
  depth: 10,
  clearOnStoryChange: true,
  limit: 50
};
var configureActions = /* @__PURE__ */ __name((options = {}) => {
  Object.assign(config, options);
}, "configureActions");

// src/actions/runtime/action.ts
import { ImplicitActionsDuringRendering } from "storybook/internal/preview-errors";
import { global } from "@storybook/global";
import { addons } from "storybook/preview-api";
var findProto = /* @__PURE__ */ __name((obj, callback) => {
  const proto = Object.getPrototypeOf(obj);
  if (!proto || callback(proto)) {
    return proto;
  }
  return findProto(proto, callback);
}, "findProto");
var isReactSyntheticEvent = /* @__PURE__ */ __name((e) => Boolean(
  typeof e === "object" && e && findProto(e, (proto) => /^Synthetic(?:Base)?Event$/.test(proto.constructor.name)) && typeof e.persist === "function"
), "isReactSyntheticEvent");
var serializeArg = /* @__PURE__ */ __name((a) => {
  if (isReactSyntheticEvent(a)) {
    const e = Object.create(
      a.constructor.prototype,
      Object.getOwnPropertyDescriptors(a)
    );
    e.persist();
    const viewDescriptor = Object.getOwnPropertyDescriptor(e, "view");
    const view = viewDescriptor?.value;
    if (typeof view === "object" && view?.constructor.name === "Window") {
      Object.defineProperty(e, "view", {
        ...viewDescriptor,
        value: Object.create(view.constructor.prototype)
      });
    }
    return e;
  }
  return a;
}, "serializeArg");
function action(name, options = {}) {
  const actionOptions = {
    ...config,
    ...options
  };
  const handler = /* @__PURE__ */ __name(function actionHandler(...args) {
    if (options.implicit) {
      const preview = "__STORYBOOK_PREVIEW__" in global ? global.__STORYBOOK_PREVIEW__ : void 0;
      const storyRenderer = preview?.storyRenders.find(
        (render) => render.phase === "playing" || render.phase === "rendering"
      );
      if (storyRenderer) {
        const deprecated = !globalThis?.FEATURES?.disallowImplicitActionsInRenderV8;
        const error = new ImplicitActionsDuringRendering({
          phase: storyRenderer.phase,
          name,
          deprecated
        });
        if (deprecated) {
          console.warn(error);
        } else {
          throw error;
        }
      }
    }
    const channel = addons.getChannel();
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const minDepth = 5;
    const serializedArgs = args.map(serializeArg);
    const normalizedArgs = args.length > 1 ? serializedArgs : serializedArgs[0];
    const actionDisplayToEmit = {
      id,
      count: 0,
      data: { name, args: normalizedArgs },
      options: {
        ...actionOptions,
        maxDepth: minDepth + (actionOptions.depth || 3)
      }
    };
    channel.emit(EVENT_ID, actionDisplayToEmit);
  }, "actionHandler");
  handler.isAction = true;
  handler.implicit = options.implicit;
  return handler;
}
__name(action, "action");

// src/actions/runtime/actions.ts
var actions = /* @__PURE__ */ __name((...args) => {
  let options = config;
  let names = args;
  if (names.length === 1 && Array.isArray(names[0])) {
    [names] = names;
  }
  if (names.length !== 1 && typeof names[names.length - 1] !== "string") {
    options = {
      ...config,
      ...names.pop()
    };
  }
  let namesObject = names[0];
  if (names.length !== 1 || typeof namesObject === "string") {
    namesObject = {};
    names.forEach((name) => {
      namesObject[name] = name;
    });
  }
  const actionsObject = {};
  Object.keys(namesObject).forEach((name) => {
    actionsObject[name] = action(namesObject[name], options);
  });
  return actionsObject;
}, "actions");

export {
  config,
  configureActions,
  action,
  actions
};
