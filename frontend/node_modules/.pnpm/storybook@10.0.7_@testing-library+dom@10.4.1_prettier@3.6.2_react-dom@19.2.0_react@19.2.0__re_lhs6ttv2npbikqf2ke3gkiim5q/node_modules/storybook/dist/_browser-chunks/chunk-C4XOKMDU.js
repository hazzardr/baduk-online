import {
  curriedDarken$1,
  curriedLighten$1,
  curriedTransparentize$1,
  rgba
} from "./chunk-OBXWFEPB.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// src/theming/base.ts
var color = {
  // Official color palette
  primary: "#FF4785",
  // coral
  secondary: "#029CFD",
  // ocean
  tertiary: "#FAFBFC",
  ancillary: "#22a699",
  // Complimentary
  orange: "#FC521F",
  gold: "#FFAE00",
  green: "#66BF3C",
  seafoam: "#37D5D3",
  purple: "#6F2CAC",
  ultraviolet: "#2A0481",
  // Monochrome
  lightest: "#FFFFFF",
  lighter: "#F7FAFC",
  light: "#EEF3F6",
  mediumlight: "#ECF4F9",
  medium: "#D9E8F2",
  mediumdark: "#73828C",
  dark: "#5C6870",
  darker: "#454E54",
  darkest: "#2E3438",
  // For borders
  border: "hsla(203, 50%, 30%, 0.15)",
  // Status
  positive: "#66BF3C",
  negative: "#FF4400",
  warning: "#E69D00",
  critical: "#FFFFFF",
  // Text
  defaultText: "#2E3438",
  inverseText: "#FFFFFF",
  positiveText: "#448028",
  negativeText: "#D43900",
  warningText: "#A15C20"
};
var background = {
  app: "#F6F9FC",
  bar: color.lightest,
  content: color.lightest,
  preview: color.lightest,
  gridCellSize: 10,
  hoverable: curriedTransparentize$1(0.9, color.secondary),
  // hover state for items in a list
  // Notification, error, and warning backgrounds
  positive: "#E1FFD4",
  negative: "#FEDED2",
  warning: "#FFF5CF",
  critical: "#FF4400"
};
var typography = {
  fonts: {
    base: [
      '"Nunito Sans"',
      "-apple-system",
      '".SFNSText-Regular"',
      '"San Francisco"',
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Helvetica",
      "Arial",
      "sans-serif"
    ].join(", "),
    mono: [
      "ui-monospace",
      "Menlo",
      "Monaco",
      '"Roboto Mono"',
      '"Oxygen Mono"',
      '"Ubuntu Monospace"',
      '"Source Code Pro"',
      '"Droid Sans Mono"',
      '"Courier New"',
      "monospace"
    ].join(", ")
  },
  weight: {
    regular: 400,
    bold: 700
  },
  size: {
    s1: 12,
    s2: 14,
    s3: 16,
    m1: 20,
    m2: 24,
    m3: 28,
    l1: 32,
    l2: 40,
    l3: 48,
    code: 90
  }
};

// src/theming/themes/dark.ts
var theme = {
  base: "dark",
  // Storybook-specific color palette
  colorPrimary: "#FF4785",
  // coral
  colorSecondary: "#029CFD",
  // ocean
  // UI
  appBg: "#222425",
  appContentBg: "#1B1C1D",
  appPreviewBg: color.lightest,
  appBorderColor: "rgba(255,255,255,.1)",
  appBorderRadius: 4,
  // Fonts
  fontBase: typography.fonts.base,
  fontCode: typography.fonts.mono,
  // Text colors
  textColor: "#C9CDCF",
  textInverseColor: "#222425",
  textMutedColor: "#798186",
  // Toolbar default and active colors
  barTextColor: color.mediumdark,
  barHoverColor: color.secondary,
  barSelectedColor: color.secondary,
  barBg: "#292C2E",
  // Form colors
  buttonBg: "#222425",
  buttonBorder: "rgba(255,255,255,.1)",
  booleanBg: "#222425",
  booleanSelectedBg: "#2E3438",
  inputBg: "#1B1C1D",
  inputBorder: "rgba(255,255,255,.1)",
  inputTextColor: color.lightest,
  inputBorderRadius: 4
};
var dark_default = theme;

// src/theming/themes/light.ts
var theme2 = {
  base: "light",
  // Storybook-specific color palette
  colorPrimary: "#FF4785",
  // coral
  colorSecondary: "#029CFD",
  // ocean
  // UI
  appBg: background.app,
  appContentBg: color.lightest,
  appPreviewBg: color.lightest,
  appBorderColor: color.border,
  appBorderRadius: 4,
  // Fonts
  fontBase: typography.fonts.base,
  fontCode: typography.fonts.mono,
  // Text colors
  textColor: color.darkest,
  textInverseColor: color.lightest,
  textMutedColor: color.dark,
  // Toolbar default and active colors
  barTextColor: color.mediumdark,
  barHoverColor: color.secondary,
  barSelectedColor: color.secondary,
  barBg: color.lightest,
  // Form colors
  buttonBg: background.app,
  buttonBorder: color.medium,
  booleanBg: color.mediumlight,
  booleanSelectedBg: color.lightest,
  inputBg: color.lightest,
  inputBorder: color.border,
  inputTextColor: color.darkest,
  inputBorderRadius: 4
};
var light_default = theme2;

// src/theming/utils.ts
import { logger } from "storybook/internal/client-logger";
import { global } from "@storybook/global";
var { window: globalWindow } = global;
var mkColor = /* @__PURE__ */ __name((color2) => ({ color: color2 }), "mkColor");
var isColorString = /* @__PURE__ */ __name((color2) => {
  if (typeof color2 !== "string") {
    logger.warn(
      `Color passed to theme object should be a string. Instead ${color2}(${typeof color2}) was passed.`
    );
    return false;
  }
  return true;
}, "isColorString");
var isValidColorForPolished = /* @__PURE__ */ __name((color2) => {
  return !/(gradient|var|calc)/.test(color2);
}, "isValidColorForPolished");
var applyPolished = /* @__PURE__ */ __name((type, color2) => {
  if (type === "darken") {
    return rgba(`${curriedDarken$1(1, color2)}`, 0.95);
  }
  if (type === "lighten") {
    return rgba(`${curriedLighten$1(1, color2)}`, 0.95);
  }
  return color2;
}, "applyPolished");
var colorFactory = /* @__PURE__ */ __name((type) => (color2) => {
  if (!isColorString(color2)) {
    return color2;
  }
  if (!isValidColorForPolished(color2)) {
    return color2;
  }
  try {
    return applyPolished(type, color2);
  } catch (error) {
    return color2;
  }
}, "colorFactory");
var lightenColor = colorFactory("lighten");
var darkenColor = colorFactory("darken");
var getPreferredColorScheme = /* @__PURE__ */ __name(() => {
  if (!globalWindow || !globalWindow.matchMedia) {
    return "light";
  }
  const isDarkThemePreferred = globalWindow.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDarkThemePreferred) {
    return "dark";
  }
  return "light";
}, "getPreferredColorScheme");

// src/theming/create.ts
var themes = {
  light: light_default,
  dark: dark_default,
  normal: light_default
};
var preferredColorScheme = getPreferredColorScheme();
var create = /* @__PURE__ */ __name((vars = { base: preferredColorScheme }, rest) => {
  const inherit = {
    ...themes[preferredColorScheme],
    ...themes[vars.base] || {},
    ...vars,
    ...{ base: themes[vars.base] ? vars.base : preferredColorScheme }
  };
  return {
    ...rest,
    ...inherit,
    ...{ barSelectedColor: vars.barSelectedColor || inherit.colorSecondary }
  };
}, "create");

export {
  color,
  background,
  typography,
  light_default,
  mkColor,
  lightenColor,
  darkenColor,
  getPreferredColorScheme,
  themes,
  create
};
