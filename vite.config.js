import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist", // You can change this
    rollupOptions: {
      input: "./src/main.jsx", // adjust to your entry file
      output: {
        entryFileNames: "index-grid.js", // ✅ fixed filename
        format: "iife", // ✅ IIFE instead of ESM
        name: "ReactApp", // required for IIFE
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
