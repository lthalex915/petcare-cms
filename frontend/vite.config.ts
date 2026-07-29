import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isDocker = fs.existsSync("/.dockerenv");
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? (isDocker ? "http://backend:4000" : "http://localhost:4000");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true
      }
    }
  }
});
