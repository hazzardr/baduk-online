import {
  entry_preview_exports
} from "./chunk-7HDTOAND.js";
import {
  entry_preview_argtypes_exports
} from "./chunk-SKEPQA2F.js";
import {
  entry_preview_docs_exports
} from "./chunk-HBQ5Y6GW.js";
import {
  __name
} from "./chunk-L5NVL7MD.js";

// src/preview.tsx
import { definePreview as definePreviewBase } from "storybook/internal/csf";
function __definePreview(input) {
  const preview = definePreviewBase({
    ...input,
    addons: [
      entry_preview_exports,
      entry_preview_argtypes_exports,
      entry_preview_docs_exports,
      ...input.addons ?? []
    ]
  });
  const defineMeta = preview.meta.bind(preview);
  preview.meta = (_input) => {
    const meta = defineMeta(_input);
    const defineStory = meta.story.bind(meta);
    meta.story = (__input) => {
      const story = defineStory(__input);
      story.Component = story.__compose();
      return story;
    };
    return meta;
  };
  return preview;
}
__name(__definePreview, "__definePreview");

export {
  __definePreview
};
