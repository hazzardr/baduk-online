import {
  __definePreview
} from "./_browser-chunks/chunk-O24TFCLO.js";
import {
  entry_preview_exports,
  renderToCanvas
} from "./_browser-chunks/chunk-7HDTOAND.js";
import {
  entry_preview_argtypes_exports
} from "./_browser-chunks/chunk-SKEPQA2F.js";
import "./_browser-chunks/chunk-HBQ5Y6GW.js";
import "./_browser-chunks/chunk-BUAOEMNB.js";
import "./_browser-chunks/chunk-VVH2AMAL.js";
import {
  __name
} from "./_browser-chunks/chunk-L5NVL7MD.js";

// src/globals.ts
import { global } from "@storybook/global";
var { window: globalWindow } = global;
if (globalWindow) {
  globalWindow.STORYBOOK_ENV = "react";
}

// src/portable-stories.tsx
import * as React from "react";
import {
  composeConfigs,
  composeStories as originalComposeStories,
  composeStory as originalComposeStory,
  setProjectAnnotations as originalSetProjectAnnotations,
  setDefaultProjectAnnotations
} from "storybook/preview-api";
function setProjectAnnotations(projectAnnotations) {
  setDefaultProjectAnnotations(INTERNAL_DEFAULT_PROJECT_ANNOTATIONS);
  return originalSetProjectAnnotations(
    projectAnnotations
  );
}
__name(setProjectAnnotations, "setProjectAnnotations");
var INTERNAL_DEFAULT_PROJECT_ANNOTATIONS = composeConfigs([
  entry_preview_exports,
  entry_preview_argtypes_exports,
  {
    /** @deprecated */
    renderToCanvas: /* @__PURE__ */ __name(async (renderContext, canvasElement) => {
      if (renderContext.storyContext.testingLibraryRender == null) {
        return renderToCanvas(renderContext, canvasElement);
      }
      const {
        storyContext: { context, unboundStoryFn: Story, testingLibraryRender: render }
      } = renderContext;
      const { unmount } = render(React.createElement(Story, { ...context }), { container: context.canvasElement });
      return unmount;
    }, "renderToCanvas")
  }
]);
function composeStory(story, componentAnnotations, projectAnnotations, exportsName) {
  return originalComposeStory(
    story,
    componentAnnotations,
    projectAnnotations,
    globalThis.globalProjectAnnotations ?? INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,
    exportsName
  );
}
__name(composeStory, "composeStory");
function composeStories(csfExports, projectAnnotations) {
  const composedStories = originalComposeStories(csfExports, projectAnnotations, composeStory);
  return composedStories;
}
__name(composeStories, "composeStories");
export {
  INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,
  __definePreview,
  composeStories,
  composeStory,
  setProjectAnnotations
};
