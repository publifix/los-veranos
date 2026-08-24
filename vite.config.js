import { defineConfig } from "vite";

// Relative base so the built site works from any subpath (GitHub Pages
// project sites are served at /<repo>/, not the domain root).
export default defineConfig({
  base: "./",
  build: {
    target: "es2019",
    cssMinify: true,
  },
});
