// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// The site builds to static files. In production they are embedded in the Go
// binary and served on the same origin as /api/*; in dev the Vite proxy sends
// /api to the backend. API_URL overrides where the dev proxy sends it.
const apiUrl = process.env.API_URL ?? "http://localhost:4000";

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      proxy: {
        "/api": { target: apiUrl },
      },
    },
    plugins: [tailwindcss()],
  },
  site: process.env.SITE_URL ?? "https://play.baduk.online",
  integrations: [],
});
