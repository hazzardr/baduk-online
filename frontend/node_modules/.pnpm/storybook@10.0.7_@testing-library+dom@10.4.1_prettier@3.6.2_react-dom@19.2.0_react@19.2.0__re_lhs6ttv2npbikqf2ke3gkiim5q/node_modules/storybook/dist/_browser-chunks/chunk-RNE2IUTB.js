import {
  __name
} from "./chunk-MM7DTO55.js";

// src/components/components/ActionBar/ActionBar.tsx
import React from "react";
import { styled } from "storybook/theming";
var Container = styled.div(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  maxWidth: "100%",
  display: "flex",
  background: theme.background.content,
  zIndex: 1
}));
var ActionButton = styled.button(
  ({ theme }) => ({
    margin: 0,
    border: "0 none",
    padding: "4px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: theme.color.defaultText,
    background: theme.background.content,
    fontSize: 12,
    lineHeight: "16px",
    fontFamily: theme.typography.fonts.base,
    fontWeight: theme.typography.weight.bold,
    borderTop: `1px solid ${theme.appBorderColor}`,
    borderLeft: `1px solid ${theme.appBorderColor}`,
    marginLeft: -1,
    borderRadius: `4px 0 0 0`,
    "&:not(:last-child)": { borderRight: `1px solid ${theme.appBorderColor}` },
    "& + *": {
      borderLeft: `1px solid ${theme.appBorderColor}`,
      borderRadius: 0
    },
    "&:focus": {
      boxShadow: `${theme.color.secondary} 0 -3px 0 0 inset`,
      outline: "0 none",
      "@media (forced-colors: active)": {
        outline: "1px solid highlight"
      }
    }
  }),
  ({ disabled }) => disabled && {
    cursor: "not-allowed",
    opacity: 0.5
  }
);
ActionButton.displayName = "ActionButton";
var ActionBar = /* @__PURE__ */ __name(({ actionItems, ...props }) => React.createElement(Container, { ...props }, actionItems.map(({ title, className, onClick, disabled }, index) => React.createElement(ActionButton, { key: index, className, onClick, disabled: !!disabled }, title))), "ActionBar");

// src/components/components/ScrollArea/ScrollArea.tsx
import React11, { forwardRef as forwardRef4 } from "react";

// ../node_modules/@radix-ui/react-scroll-area/dist/index.mjs
import * as React23 from "react";

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-primitive/dist/index.mjs
import * as React4 from "react";
import * as ReactDOM from "react-dom";

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-slot/dist/index.mjs
import * as React3 from "react";

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-compose-refs/dist/index.mjs
import * as React2 from "react";
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
__name(setRef, "setRef");
function composeRefs(...refs) {
  return (node) => refs.forEach((ref) => setRef(ref, node));
}
__name(composeRefs, "composeRefs");
function useComposedRefs(...refs) {
  return React2.useCallback(composeRefs(...refs), refs);
}
__name(useComposedRefs, "useComposedRefs");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-slot/dist/index.mjs
import { Fragment, jsx } from "react/jsx-runtime";
var Slot = React3.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React3.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);
  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (React3.Children.count(newElement) > 1) return React3.Children.only(null);
        return React3.isValidElement(newElement) ? newElement.props.children : null;
      } else {
        return child;
      }
    });
    return jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React3.isValidElement(newElement) ? React3.cloneElement(newElement, void 0, newChildren) : null });
  }
  return jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});
Slot.displayName = "Slot";
var SlotClone = React3.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (React3.isValidElement(children)) {
    const childrenRef = getElementRef(children);
    return React3.cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      // @ts-ignore
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef
    });
  }
  return React3.Children.count(children) > 1 ? React3.Children.only(null) : null;
});
SlotClone.displayName = "SlotClone";
var Slottable = /* @__PURE__ */ __name(({ children }) => {
  return jsx(Fragment, { children });
}, "Slottable");
function isSlottable(child) {
  return React3.isValidElement(child) && child.type === Slottable;
}
__name(isSlottable, "isSlottable");
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
__name(mergeProps, "mergeProps");
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
__name(getElementRef, "getElementRef");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-primitive/dist/index.mjs
import { jsx as jsx2 } from "react/jsx-runtime";
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Node = React4.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return jsx2(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-presence/dist/index.mjs
import * as React22 from "react";
import * as ReactDOM2 from "react-dom";

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
import * as React5 from "react";
var useLayoutEffect2 = Boolean(globalThis?.document) ? React5.useLayoutEffect : () => {
};

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-presence/dist/index.mjs
import * as React6 from "react";
function useStateMachine(initialState, machine) {
  return React6.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
__name(useStateMachine, "useStateMachine");
var Presence = /* @__PURE__ */ __name((props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : React22.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef2(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? React22.cloneElement(child, { ref }) : null;
}, "Presence");
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = React22.useState();
  const stylesRef = React22.useRef({});
  const prevPresentRef = React22.useRef(present);
  const prevAnimationNameRef = React22.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  React22.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      const handleAnimationEnd = /* @__PURE__ */ __name((event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node && isCurrentAnimation) {
          ReactDOM2.flushSync(() => send("ANIMATION_END"));
        }
      }, "handleAnimationEnd");
      const handleAnimationStart = /* @__PURE__ */ __name((event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      }, "handleAnimationStart");
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React22.useCallback((node2) => {
      if (node2) stylesRef.current = getComputedStyle(node2);
      setNode(node2);
    }, [])
  };
}
__name(usePresence, "usePresence");
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
__name(getAnimationName, "getAnimationName");
function getElementRef2(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
__name(getElementRef2, "getElementRef");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-context/dist/index.mjs
import * as React7 from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React7.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    function Provider(props) {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName][index] || BaseContext;
      const value = React7.useMemo(() => context, Object.values(context));
      return jsx3(Context.Provider, { value, children });
    }
    __name(Provider, "Provider");
    function useContext22(consumerName, scope) {
      const Context = scope?.[scopeName][index] || BaseContext;
      const context = React7.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    __name(useContext22, "useContext2");
    Provider.displayName = rootComponentName + "Provider";
    return [Provider, useContext22];
  }
  __name(createContext3, "createContext3");
  const createScope = /* @__PURE__ */ __name(() => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React7.createContext(defaultContext);
    });
    return /* @__PURE__ */ __name(function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React7.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    }, "useScope");
  }, "createScope");
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
__name(createContextScope, "createContextScope");
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = /* @__PURE__ */ __name(() => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return /* @__PURE__ */ __name(function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React7.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    }, "useComposedScopes");
  }, "createScope");
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
__name(composeContextScopes, "composeContextScopes");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
import * as React8 from "react";
function useCallbackRef(callback) {
  const callbackRef = React8.useRef(callback);
  React8.useEffect(() => {
    callbackRef.current = callback;
  });
  return React8.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
__name(useCallbackRef, "useCallbackRef");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/react-direction/dist/index.mjs
import * as React9 from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
var DirectionContext = React9.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React9.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
__name(useDirection, "useDirection");

// ../node_modules/@radix-ui/number/dist/index.mjs
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}
__name(clamp, "clamp");

// ../node_modules/@radix-ui/react-scroll-area/node_modules/@radix-ui/primitive/dist/index.mjs
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return /* @__PURE__ */ __name(function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  }, "handleEvent");
}
__name(composeEventHandlers, "composeEventHandlers");

// ../node_modules/@radix-ui/react-scroll-area/dist/index.mjs
import * as React10 from "react";
import { Fragment as Fragment2, jsx as jsx5, jsxs } from "react/jsx-runtime";
function useStateMachine2(initialState, machine) {
  return React10.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
__name(useStateMachine2, "useStateMachine");
var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext, createScrollAreaScope] = createContextScope(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea = React23.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = React23.useState(null);
    const [viewport, setViewport] = React23.useState(null);
    const [content, setContent] = React23.useState(null);
    const [scrollbarX, setScrollbarX] = React23.useState(null);
    const [scrollbarY, setScrollbarY] = React23.useState(null);
    const [cornerWidth, setCornerWidth] = React23.useState(0);
    const [cornerHeight, setCornerHeight] = React23.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = React23.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = React23.useState(false);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
    const direction = useDirection(dir);
    return jsx5(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: jsx5(
          Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = React23.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, asChild, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = React23.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    return jsxs(Fragment2, { children: [
      jsx5(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `
[data-radix-scroll-area-viewport] {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
[data-radix-scroll-area-viewport]::-webkit-scrollbar {
  display: none;
}
:where([data-radix-scroll-area-viewport]) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
:where([data-radix-scroll-area-content]) {
  flex-grow: 1;
}
`
          },
          nonce
        }
      ),
      jsx5(
        Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          asChild,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: getSubtree({ asChild, children }, (children2) => jsx5(
            "div",
            {
              "data-radix-scroll-area-content": "",
              ref: context.onContentChange,
              style: { minWidth: context.scrollbarXEnabled ? "fit-content" : void 0 },
              children: children2
            }
          ))
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = React23.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    React23.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? jsx5(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? jsx5(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? jsx5(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? jsx5(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = React23.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = React23.useState(false);
  React23.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = /* @__PURE__ */ __name(() => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      }, "handlePointerEnter");
      const handlePointerLeave = /* @__PURE__ */ __name(() => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      }, "handlePointerLeave");
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return jsx5(Presence, { present: forceMount || visible, children: jsx5(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = React23.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine2("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  React23.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  React23.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = /* @__PURE__ */ __name(() => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      }, "handleScroll");
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return jsx5(Presence, { present: forceMount || state !== "hidden", children: jsx5(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = React23.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = React23.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return jsx5(Presence, { present: forceMount || visible, children: jsx5(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = React23.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = React23.useRef(null);
  const pointerOffsetRef = React23.useRef(0);
  const [sizes, setSizes] = React23.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: /* @__PURE__ */ __name((thumb) => thumbRef.current = thumb, "onThumbChange"),
    onThumbPointerUp: /* @__PURE__ */ __name(() => pointerOffsetRef.current = 0, "onThumbPointerUp"),
    onThumbPointerDown: /* @__PURE__ */ __name((pointerPos) => pointerOffsetRef.current = pointerPos, "onThumbPointerDown")
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  __name(getScrollPosition, "getScrollPosition");
  if (orientation === "horizontal") {
    return jsx5(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: /* @__PURE__ */ __name(() => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        }, "onThumbPositionChange"),
        onWheelScroll: /* @__PURE__ */ __name((scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        }, "onWheelScroll"),
        onDragScroll: /* @__PURE__ */ __name((pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }, "onDragScroll")
      }
    );
  }
  if (orientation === "vertical") {
    return jsx5(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: /* @__PURE__ */ __name(() => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        }, "onThumbPositionChange"),
        onWheelScroll: /* @__PURE__ */ __name((scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        }, "onWheelScroll"),
        onDragScroll: /* @__PURE__ */ __name((pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }, "onDragScroll")
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = React23.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React23.useState();
  const ref = React23.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
  React23.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return jsx5(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: /* @__PURE__ */ __name((pointerPos) => props.onThumbPointerDown(pointerPos.x), "onThumbPointerDown"),
      onDragScroll: /* @__PURE__ */ __name((pointerPos) => props.onDragScroll(pointerPos.x), "onDragScroll"),
      onWheelScroll: /* @__PURE__ */ __name((event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      }, "onWheelScroll"),
      onResize: /* @__PURE__ */ __name(() => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }, "onResize")
    }
  );
});
var ScrollAreaScrollbarY = React23.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React23.useState();
  const ref = React23.useRef(null);
  const composeRefs2 = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
  React23.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return jsx5(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs2,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: /* @__PURE__ */ __name((pointerPos) => props.onThumbPointerDown(pointerPos.y), "onThumbPointerDown"),
      onDragScroll: /* @__PURE__ */ __name((pointerPos) => props.onDragScroll(pointerPos.y), "onDragScroll"),
      onWheelScroll: /* @__PURE__ */ __name((event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      }, "onWheelScroll"),
      onResize: /* @__PURE__ */ __name(() => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }, "onResize")
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = React23.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = React23.useState(null);
  const composeRefs2 = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
  const rectRef = React23.useRef(null);
  const prevWebkitUserSelectRef = React23.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = useCallbackRef(onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  __name(handleDragScroll, "handleDragScroll");
  React23.useEffect(() => {
    const handleWheel = /* @__PURE__ */ __name((event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar?.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    }, "handleWheel");
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  React23.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return jsx5(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
      children: jsx5(
        Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs2,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
          onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = React23.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return jsx5(Presence, { present: forceMount || scrollbarContext.hasThumb, children: jsx5(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = React23.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = useComposedRefs(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = React23.useRef();
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    React23.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll = /* @__PURE__ */ __name(() => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        }, "handleScroll");
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return jsx5(
      Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = React23.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? jsx5(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = React23.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = React23.useState(0);
  const [height, setHeight] = React23.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    const height2 = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    const width2 = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? jsx5(
    Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
__name(toInt, "toInt");
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
__name(getThumbRatio, "getThumbRatio");
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
__name(getThumbSize, "getThumbSize");
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
__name(getScrollPositionFromPointer, "getScrollPositionFromPointer");
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
__name(getThumbOffsetFromScroll, "getThumbOffsetFromScroll");
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
__name(linearScale, "linearScale");
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
__name(isScrollingWithinScrollbarBounds, "isScrollingWithinScrollbarBounds");
var addUnlinkedScrollListener = /* @__PURE__ */ __name((node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (/* @__PURE__ */ __name(function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  }, "loop"))();
  return () => window.cancelAnimationFrame(rAF);
}, "addUnlinkedScrollListener");
function useDebounceCallback(callback, delay) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = React23.useRef(0);
  React23.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return React23.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
__name(useDebounceCallback, "useDebounceCallback");
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef(onResize);
  useLayoutEffect2(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
__name(useResizeObserver, "useResizeObserver");
function getSubtree(options, content) {
  const { asChild, children } = options;
  if (!asChild) return typeof content === "function" ? content(children) : content;
  const firstChild = React23.Children.only(children);
  return React23.cloneElement(firstChild, {
    children: typeof content === "function" ? content(firstChild.props.children) : content
  });
}
__name(getSubtree, "getSubtree");
var Root = ScrollArea;
var Viewport = ScrollAreaViewport;
var Scrollbar = ScrollAreaScrollbar;
var Thumb = ScrollAreaThumb;
var Corner = ScrollAreaCorner;

// src/components/components/ScrollArea/ScrollArea.tsx
import { styled as styled2 } from "storybook/theming";
var ScrollAreaRoot = styled2(Root)(
  ({ scrollbarsize, offset }) => ({
    width: "100%",
    height: "100%",
    overflow: "hidden",
    "--scrollbar-size": `${scrollbarsize + offset}px`,
    "--radix-scroll-area-thumb-width": `${scrollbarsize}px`
  })
);
var ScrollAreaViewport2 = styled2(Viewport)({
  width: "100%",
  height: "100%"
});
var ScrollAreaScrollbar2 = styled2(Scrollbar)(({ offset, horizontal, vertical }) => ({
  display: "flex",
  userSelect: "none",
  // ensures no selection
  touchAction: "none",
  // disable browser handling of all panning and zooming gestures on touch devices
  background: "transparent",
  transition: "all 0.2s ease-out",
  borderRadius: "var(--scrollbar-size)",
  zIndex: 1,
  '&[data-orientation="vertical"]': {
    width: "var(--scrollbar-size)",
    paddingRight: offset,
    marginTop: offset,
    marginBottom: horizontal === "true" && vertical === "true" ? 0 : offset
  },
  '&[data-orientation="horizontal"]': {
    flexDirection: "column",
    height: "var(--scrollbar-size)",
    paddingBottom: offset,
    marginLeft: offset,
    marginRight: horizontal === "true" && vertical === "true" ? 0 : offset
  }
}));
var ScrollAreaThumb2 = styled2(Thumb)(({ theme }) => ({
  flex: 1,
  background: theme.textMutedColor,
  opacity: 0.5,
  borderRadius: `var(--scrollbar-size)`,
  position: "relative",
  transition: "opacity 0.2s ease-out",
  "&:hover": { opacity: 0.8 },
  /* increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html */
  "::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: "100%",
    height: "100%"
  }
}));
var ScrollArea2 = forwardRef4(
  ({ children, horizontal = false, vertical = false, offset = 2, scrollbarSize = 6, className }, ref) => React11.createElement(ScrollAreaRoot, { scrollbarsize: scrollbarSize, offset, className }, React11.createElement(ScrollAreaViewport2, { ref }, children), horizontal && React11.createElement(
    ScrollAreaScrollbar2,
    {
      orientation: "horizontal",
      offset,
      horizontal: horizontal.toString(),
      vertical: vertical.toString()
    },
    React11.createElement(ScrollAreaThumb2, null)
  ), vertical && React11.createElement(
    ScrollAreaScrollbar2,
    {
      orientation: "vertical",
      offset,
      horizontal: horizontal.toString(),
      vertical: vertical.toString()
    },
    React11.createElement(ScrollAreaThumb2, null)
  ), horizontal && vertical && React11.createElement(Corner, null))
);
ScrollArea2.displayName = "ScrollArea";

// src/components/components/syntaxhighlighter/clipboard.ts
import { global } from "@storybook/global";
var { document: document2, window: globalWindow } = global;
async function copyUsingClipboardAPI(text) {
  try {
    await globalWindow.top?.navigator.clipboard.writeText(text);
  } catch {
    await globalWindow.navigator.clipboard.writeText(text);
  }
}
__name(copyUsingClipboardAPI, "copyUsingClipboardAPI");
async function copyUsingWorkAround(text) {
  const tmp = document2.createElement("TEXTAREA");
  const focus = document2.activeElement;
  tmp.value = text;
  document2.body.appendChild(tmp);
  tmp.select();
  document2.execCommand("copy");
  document2.body.removeChild(tmp);
  focus.focus();
}
__name(copyUsingWorkAround, "copyUsingWorkAround");
function createCopyToClipboardFunction() {
  return globalWindow.navigator?.clipboard ? copyUsingClipboardAPI : copyUsingWorkAround;
}
__name(createCopyToClipboardFunction, "createCopyToClipboardFunction");

export {
  ActionBar,
  ScrollArea2 as ScrollArea,
  createCopyToClipboardFunction
};
