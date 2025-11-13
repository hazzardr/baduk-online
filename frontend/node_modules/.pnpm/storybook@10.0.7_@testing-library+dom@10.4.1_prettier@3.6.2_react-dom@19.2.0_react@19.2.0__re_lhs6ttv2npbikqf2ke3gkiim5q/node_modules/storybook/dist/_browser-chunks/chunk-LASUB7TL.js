import {
  __name
} from "./chunk-MM7DTO55.js";

// src/storybook-error.ts
function parseErrorCode({
  code,
  category
}) {
  const paddedCode = String(code).padStart(4, "0");
  return `SB_${category}_${paddedCode}`;
}
__name(parseErrorCode, "parseErrorCode");
function appendErrorRef(url) {
  if (/^(?!.*storybook\.js\.org)|[?&]ref=error\b/.test(url)) {
    return url;
  }
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("ref", "error");
    return urlObj.toString();
  } catch {
    return url;
  }
}
__name(appendErrorRef, "appendErrorRef");
var _StorybookError = class _StorybookError extends Error {
  constructor(props) {
    super(_StorybookError.getFullMessage(props));
    /**
     * Data associated with the error. Used to provide additional information in the error message or
     * to be passed to telemetry.
     */
    this.data = {};
    /** Flag used to easily determine if the error originates from Storybook. */
    this.fromStorybook = true;
    this.category = props.category;
    this.documentation = props.documentation ?? false;
    this.code = props.code;
  }
  get fullErrorCode() {
    return parseErrorCode({ code: this.code, category: this.category });
  }
  /** Overrides the default `Error.name` property in the format: SB_<CATEGORY>_<CODE>. */
  get name() {
    const errorName = this.constructor.name;
    return `${this.fullErrorCode} (${errorName})`;
  }
  /** Generates the error message along with additional documentation link (if applicable). */
  static getFullMessage({
    documentation,
    code,
    category,
    message
  }) {
    let page;
    if (documentation === true) {
      page = `https://storybook.js.org/error/${parseErrorCode({ code, category })}?ref=error`;
    } else if (typeof documentation === "string") {
      page = appendErrorRef(documentation);
    } else if (Array.isArray(documentation)) {
      page = `
${documentation.map((doc) => `	- ${appendErrorRef(doc)}`).join("\n")}`;
    }
    return `${message}${page != null ? `

More info: ${page}
` : ""}`;
  }
};
__name(_StorybookError, "StorybookError");
var StorybookError = _StorybookError;

export {
  StorybookError
};
