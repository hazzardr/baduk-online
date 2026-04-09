// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
// https://astro.build/config
export default defineConfig({
  vite: {
      server: {
          proxy: {
            "/api": {target: "http://localhost:4000"}
          }
      },
    plugins: [tailwindcss()],
  },
    site: "https://play.baduk.online",
  integrations: [],
  middleware: {
    mode: "middleware",
  },
});
