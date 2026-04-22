// Vite config: enables React plugin and local API proxy for development.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // /api requests from the client are forwarded to the Express server.
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
