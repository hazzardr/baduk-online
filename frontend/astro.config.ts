// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// The site builds to static files. In production Caddy serves them and routes
// /api/* to the backend on the same origin; in dev the Vite proxy does the same.
// API_URL overrides where the dev proxy sends /api requests.
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
