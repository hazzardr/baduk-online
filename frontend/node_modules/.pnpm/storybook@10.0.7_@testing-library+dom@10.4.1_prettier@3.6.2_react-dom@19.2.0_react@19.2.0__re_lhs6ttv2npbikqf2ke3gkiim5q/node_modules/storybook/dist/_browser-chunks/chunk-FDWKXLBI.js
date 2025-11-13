import {
  StorybookError
} from "./chunk-LASUB7TL.js";
import {
  dedent
} from "./chunk-OPCDBBL3.js";
import {
  __name
} from "./chunk-MM7DTO55.js";

// src/preview-errors.ts
var Category = /* @__PURE__ */ ((Category2) => {
  Category2["BLOCKS"] = "BLOCKS";
  Category2["DOCS_TOOLS"] = "DOCS-TOOLS";
  Category2["PREVIEW_CLIENT_LOGGER"] = "PREVIEW_CLIENT-LOGGER";
  Category2["PREVIEW_CHANNELS"] = "PREVIEW_CHANNELS";
  Category2["PREVIEW_CORE_EVENTS"] = "PREVIEW_CORE-EVENTS";
  Category2["PREVIEW_INSTRUMENTER"] = "PREVIEW_INSTRUMENTER";
  Category2["PREVIEW_API"] = "PREVIEW_API";
  Category2["PREVIEW_REACT_DOM_SHIM"] = "PREVIEW_REACT-DOM-SHIM";
  Category2["PREVIEW_ROUTER"] = "PREVIEW_ROUTER";
  Category2["PREVIEW_THEMING"] = "PREVIEW_THEMING";
  Category2["RENDERER_HTML"] = "RENDERER_HTML";
  Category2["RENDERER_PREACT"] = "RENDERER_PREACT";
  Category2["RENDERER_REACT"] = "RENDERER_REACT";
  Category2["RENDERER_SERVER"] = "RENDERER_SERVER";
  Category2["RENDERER_SVELTE"] = "RENDERER_SVELTE";
  Category2["RENDERER_VUE"] = "RENDERER_VUE";
  Category2["RENDERER_VUE3"] = "RENDERER_VUE3";
  Category2["RENDERER_WEB_COMPONENTS"] = "RENDERER_WEB-COMPONENTS";
  Category2["FRAMEWORK_NEXTJS"] = "FRAMEWORK_NEXTJS";
  Category2["ADDON_VITEST"] = "ADDON_VITEST";
  Category2["ADDON_A11Y"] = "ADDON_A11Y";
  return Category2;
})(Category || {});
var _MissingStoryAfterHmrError = class _MissingStoryAfterHmrError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 1,
      message: dedent`
        Couldn't find story matching id '${data.storyId}' after HMR.
        - Did you just rename a story?
        - Did you remove it from your CSF file?
        - Are you sure a story with the id '${data.storyId}' exists?
        - Please check the values in the stories field of your main.js config and see if they would match your CSF File.
        - Also check the browser console and terminal for potential error messages.`
    });
    this.data = data;
  }
};
__name(_MissingStoryAfterHmrError, "MissingStoryAfterHmrError");
var MissingStoryAfterHmrError = _MissingStoryAfterHmrError;
var _ImplicitActionsDuringRendering = class _ImplicitActionsDuringRendering extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 2,
      documentation: "https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#using-implicit-actions-during-rendering-is-deprecated-for-example-in-the-play-function",
      message: dedent`
        We detected that you use an implicit action arg while ${data.phase} of your story.  
        ${data.deprecated ? `
This is deprecated and won't work in Storybook 8 anymore.
` : ``}
        Please provide an explicit spy to your args like this:
          import { fn } from 'storybook/test';
          ... 
          args: {
           ${data.name}: fn()
          }`
    });
    this.data = data;
  }
};
__name(_ImplicitActionsDuringRendering, "ImplicitActionsDuringRendering");
var ImplicitActionsDuringRendering = _ImplicitActionsDuringRendering;
var _CalledExtractOnStoreError = class _CalledExtractOnStoreError extends StorybookError {
  constructor() {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 3,
      message: dedent`
        Cannot call \`storyStore.extract()\` without calling \`storyStore.cacheAllCsfFiles()\` first.

        You probably meant to call \`await preview.extract()\` which does the above for you.`
    });
  }
};
__name(_CalledExtractOnStoreError, "CalledExtractOnStoreError");
var CalledExtractOnStoreError = _CalledExtractOnStoreError;
var _MissingRenderToCanvasError = class _MissingRenderToCanvasError extends StorybookError {
  constructor() {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 4,
      message: dedent`
        Expected your framework's preset to export a \`renderToCanvas\` field.

        Perhaps it needs to be upgraded for Storybook 7.0?`,
      documentation: "https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#mainjs-framework-field"
    });
  }
};
__name(_MissingRenderToCanvasError, "MissingRenderToCanvasError");
var MissingRenderToCanvasError = _MissingRenderToCanvasError;
var _CalledPreviewMethodBeforeInitializationError = class _CalledPreviewMethodBeforeInitializationError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 5,
      message: dedent`
        Called \`Preview.${data.methodName}()\` before initialization.
        
        The preview needs to load the story index before most methods can be called. If you want
        to call \`${data.methodName}\`, try \`await preview.initializationPromise;\` first.
        
        If you didn't call the above code, then likely it was called by an addon that needs to
        do the above.`
    });
    this.data = data;
  }
};
__name(_CalledPreviewMethodBeforeInitializationError, "CalledPreviewMethodBeforeInitializationError");
var CalledPreviewMethodBeforeInitializationError = _CalledPreviewMethodBeforeInitializationError;
var _StoryIndexFetchError = class _StoryIndexFetchError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 6,
      message: dedent`
        Error fetching \`/index.json\`:
        
        ${data.text}

        If you are in development, this likely indicates a problem with your Storybook process,
        check the terminal for errors.

        If you are in a deployed Storybook, there may have been an issue deploying the full Storybook
        build.`
    });
    this.data = data;
  }
};
__name(_StoryIndexFetchError, "StoryIndexFetchError");
var StoryIndexFetchError = _StoryIndexFetchError;
var _MdxFileWithNoCsfReferencesError = class _MdxFileWithNoCsfReferencesError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 7,
      message: dedent`
        Tried to render docs entry ${data.storyId} but it is a MDX file that has no CSF
        references, or autodocs for a CSF file that some doesn't refer to itself.
        
        This likely is an internal error in Storybook's indexing, or you've attached the
        \`attached-mdx\` tag to an MDX file that is not attached.`
    });
    this.data = data;
  }
};
__name(_MdxFileWithNoCsfReferencesError, "MdxFileWithNoCsfReferencesError");
var MdxFileWithNoCsfReferencesError = _MdxFileWithNoCsfReferencesError;
var _EmptyIndexError = class _EmptyIndexError extends StorybookError {
  constructor() {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 8,
      message: dedent`
        Couldn't find any stories in your Storybook.

        - Please check your stories field of your main.js config: does it match correctly?
        - Also check the browser console and terminal for error messages.`
    });
  }
};
__name(_EmptyIndexError, "EmptyIndexError");
var EmptyIndexError = _EmptyIndexError;
var _NoStoryMatchError = class _NoStoryMatchError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 9,
      message: dedent`
        Couldn't find story matching '${data.storySpecifier}'.

        - Are you sure a story with that id exists?
        - Please check your stories field of your main.js config.
        - Also check the browser console and terminal for error messages.`
    });
    this.data = data;
  }
};
__name(_NoStoryMatchError, "NoStoryMatchError");
var NoStoryMatchError = _NoStoryMatchError;
var _MissingStoryFromCsfFileError = class _MissingStoryFromCsfFileError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 10,
      message: dedent`
        Couldn't find story matching id '${data.storyId}' after importing a CSF file.

        The file was indexed as if the story was there, but then after importing the file in the browser
        we didn't find the story. Possible reasons:
        - You are using a custom story indexer that is misbehaving.
        - You have a custom file loader that is removing or renaming exports.

        Please check your browser console and terminal for errors that may explain the issue.`
    });
    this.data = data;
  }
};
__name(_MissingStoryFromCsfFileError, "MissingStoryFromCsfFileError");
var MissingStoryFromCsfFileError = _MissingStoryFromCsfFileError;
var _StoryStoreAccessedBeforeInitializationError = class _StoryStoreAccessedBeforeInitializationError extends StorybookError {
  constructor() {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 11,
      message: dedent`
        Cannot access the Story Store until the index is ready.

        It is not recommended to use methods directly on the Story Store anyway, in Storybook 9 we will
        remove access to the store entirely`
    });
  }
};
__name(_StoryStoreAccessedBeforeInitializationError, "StoryStoreAccessedBeforeInitializationError");
var StoryStoreAccessedBeforeInitializationError = _StoryStoreAccessedBeforeInitializationError;
var _MountMustBeDestructuredError = class _MountMustBeDestructuredError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 12,
      message: dedent`
      Incorrect use of mount in the play function.
      
      To use mount in the play function, you must satisfy the following two requirements: 
      
      1. You *must* destructure the mount property from the \`context\` (the argument passed to your play function). 
         This makes sure that Storybook does not start rendering the story before the play function begins.
      
      2. Your Storybook framework or builder must be configured to transpile to ES2017 or newer. 
         This is because destructuring statements and async/await usages are otherwise transpiled away, 
         which prevents Storybook from recognizing your usage of \`mount\`.
      
      Note that Angular is not supported. As async/await is transpiled to support the zone.js polyfill. 
      
      More info: https://storybook.js.org/docs/writing-tests/interaction-testing?ref=error#run-code-before-the-component-gets-rendered
      
      Received the following play function:
      ${data.playFunction}`
    });
    this.data = data;
  }
};
__name(_MountMustBeDestructuredError, "MountMustBeDestructuredError");
var MountMustBeDestructuredError = _MountMustBeDestructuredError;
var _NoRenderFunctionError = class _NoRenderFunctionError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 14,
      message: dedent`
        No render function available for storyId '${data.id}'
      `
    });
    this.data = data;
  }
};
__name(_NoRenderFunctionError, "NoRenderFunctionError");
var NoRenderFunctionError = _NoRenderFunctionError;
var _NoStoryMountedError = class _NoStoryMountedError extends StorybookError {
  constructor() {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 15,
      message: dedent`
        No component is mounted in your story.
        
        This usually occurs when you destructure mount in the play function, but forget to call it.
        
        For example:

        async play({ mount, canvasElement }) {
          // 👈 mount should be called: await mount(); 
          const canvas = within(canvasElement);
          const button = await canvas.findByRole('button');
          await userEvent.click(button);
        };

        Make sure to either remove it or call mount in your play function.
      `
    });
  }
};
__name(_NoStoryMountedError, "NoStoryMountedError");
var NoStoryMountedError = _NoStoryMountedError;
var _StatusTypeIdMismatchError = class _StatusTypeIdMismatchError extends StorybookError {
  constructor(data) {
    super({
      category: "PREVIEW_API" /* PREVIEW_API */,
      code: 16,
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
var _NextJsSharpError = class _NextJsSharpError extends StorybookError {
  constructor() {
    super({
      category: "FRAMEWORK_NEXTJS" /* FRAMEWORK_NEXTJS */,
      code: 1,
      documentation: "https://storybook.js.org/docs/get-started/nextjs#faq",
      message: dedent`
      You are importing avif images, but you don't have sharp installed.

      You have to install sharp in order to use image optimization features in Next.js.
      `
    });
  }
};
__name(_NextJsSharpError, "NextJsSharpError");
var NextJsSharpError = _NextJsSharpError;
var _NextjsRouterMocksNotAvailable = class _NextjsRouterMocksNotAvailable extends StorybookError {
  constructor(data) {
    super({
      category: "FRAMEWORK_NEXTJS" /* FRAMEWORK_NEXTJS */,
      code: 2,
      message: dedent`
        Tried to access router mocks from "${data.importType}" but they were not created yet. You might be running code in an unsupported environment.
      `
    });
    this.data = data;
  }
};
__name(_NextjsRouterMocksNotAvailable, "NextjsRouterMocksNotAvailable");
var NextjsRouterMocksNotAvailable = _NextjsRouterMocksNotAvailable;
var _UnknownArgTypesError = class _UnknownArgTypesError extends StorybookError {
  constructor(data) {
    super({
      category: "DOCS-TOOLS" /* DOCS_TOOLS */,
      code: 1,
      documentation: "https://github.com/storybookjs/storybook/issues/26606",
      message: dedent`
        There was a failure when generating detailed ArgTypes in ${data.language} for:
        ${JSON.stringify(data.type, null, 2)} 
        
        Storybook will fall back to use a generic type description instead.

        This type is either not supported or it is a bug in the docgen generation in Storybook.
        If you think this is a bug, please detail it as much as possible in the Github issue.
      `
    });
    this.data = data;
  }
};
__name(_UnknownArgTypesError, "UnknownArgTypesError");
var UnknownArgTypesError = _UnknownArgTypesError;
var _UnsupportedViewportDimensionError = class _UnsupportedViewportDimensionError extends StorybookError {
  constructor(data) {
    super({
      category: "ADDON_VITEST" /* ADDON_VITEST */,
      code: 1,
      // TODO: Add documentation about viewports support
      // documentation: '',
      message: dedent`
        Encountered an unsupported value "${data.value}" when setting the viewport ${data.dimension} dimension.
        
        The Storybook plugin only supports values in the following units:
        - px, vh, vw, em, rem and %.
        
        You can either change the viewport for this story to use one of the supported units or skip the test by adding '!test' to the story's tags per https://storybook.js.org/docs/writing-stories/tags
      `
    });
    this.data = data;
  }
};
__name(_UnsupportedViewportDimensionError, "UnsupportedViewportDimensionError");
var UnsupportedViewportDimensionError = _UnsupportedViewportDimensionError;
var _ElementA11yParameterError = class _ElementA11yParameterError extends StorybookError {
  constructor() {
    super({
      category: "ADDON_A11Y" /* ADDON_A11Y */,
      code: 1,
      documentation: "https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#a11y-addon-replace-element-parameter-with-context-parameter",
      message: 'The "element" parameter in parameters.a11y has been removed. Use "context" instead.'
    });
  }
};
__name(_ElementA11yParameterError, "ElementA11yParameterError");
var ElementA11yParameterError = _ElementA11yParameterError;

export {
  Category,
  MissingStoryAfterHmrError,
  ImplicitActionsDuringRendering,
  CalledExtractOnStoreError,
  MissingRenderToCanvasError,
  CalledPreviewMethodBeforeInitializationError,
  StoryIndexFetchError,
  MdxFileWithNoCsfReferencesError,
  EmptyIndexError,
  NoStoryMatchError,
  MissingStoryFromCsfFileError,
  StoryStoreAccessedBeforeInitializationError,
  MountMustBeDestructuredError,
  NoRenderFunctionError,
  NoStoryMountedError,
  StatusTypeIdMismatchError,
  NextJsSharpError,
  NextjsRouterMocksNotAvailable,
  UnknownArgTypesError,
  UnsupportedViewportDimensionError,
  ElementA11yParameterError
};
