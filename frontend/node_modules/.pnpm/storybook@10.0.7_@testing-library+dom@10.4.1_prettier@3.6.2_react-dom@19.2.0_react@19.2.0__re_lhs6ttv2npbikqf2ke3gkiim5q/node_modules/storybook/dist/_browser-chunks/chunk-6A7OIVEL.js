import {
  StorybookError
} from "./chunk-LASUB7TL.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// src/manager-errors.ts
var Category = /* @__PURE__ */ ((Category2) => {
  Category2["MANAGER_UNCAUGHT"] = "MANAGER_UNCAUGHT";
  Category2["MANAGER_UI"] = "MANAGER_UI";
  Category2["MANAGER_API"] = "MANAGER_API";
  Category2["MANAGER_CLIENT_LOGGER"] = "MANAGER_CLIENT-LOGGER";
  Category2["MANAGER_CHANNELS"] = "MANAGER_CHANNELS";
  Category2["MANAGER_CORE_EVENTS"] = "MANAGER_CORE-EVENTS";
  Category2["MANAGER_ROUTER"] = "MANAGER_ROUTER";
  Category2["MANAGER_THEMING"] = "MANAGER_THEMING";
  return Category2;
})(Category || {});
var _ProviderDoesNotExtendBaseProviderError = class _ProviderDoesNotExtendBaseProviderError extends StorybookError {
  constructor() {
    super({
      category: "MANAGER_UI" /* MANAGER_UI */,
      code: 1,
      message: `The Provider passed into Storybook's UI is not extended from the base Provider. Please check your Provider implementation.`
    });
  }
};
__name(_ProviderDoesNotExtendBaseProviderError, "ProviderDoesNotExtendBaseProviderError");
var ProviderDoesNotExtendBaseProviderError = _ProviderDoesNotExtendBaseProviderError;
var _UncaughtManagerError = class _UncaughtManagerError extends StorybookError {
  constructor(data) {
    super({
      category: "MANAGER_UNCAUGHT" /* MANAGER_UNCAUGHT */,
      code: 1,
      message: data.error.message
    });
    this.data = data;
    this.stack = data.error.stack;
  }
};
__name(_UncaughtManagerError, "UncaughtManagerError");
var UncaughtManagerError = _UncaughtManagerError;
var _StatusTypeIdMismatchError = class _StatusTypeIdMismatchError extends StorybookError {
  constructor(data) {
    super({
      category: "MANAGER_API" /* MANAGER_API */,
      code: 1,
      message: `Status has typeId "${data.status.typeId}" but was added to store with typeId "${data.typeId}". Full status: ${JSON.stringify(
        data.status,
        null,
        2
      )}`
    });
    this.data = data;
  }
};
__name(_StatusTypeIdMismatchError, "StatusTypeIdMismatchError");
var StatusTypeIdMismatchError = _StatusTypeIdMismatchError;

export {
  Category,
  ProviderDoesNotExtendBaseProviderError,
  UncaughtManagerError,
  StatusTypeIdMismatchError
};
