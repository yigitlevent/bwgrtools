import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = "../";
  const env = loadEnv(mode, envDir, "");
  const apiUrl = env.VITE_API_URL ?? "http://localhost:3000";

  return {
    // "tauri" is a separate production mode from "production": the desktop build is served from
    // its own local proxy root (client-tauri/src/proxy.rs), not nested under yigitlevent.com's
    // /blacktower/ path the way the browser deployment is.
    base: mode === "production" ? "/blacktower/" : "/",
    envDir,
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true
        },
        "/ws": {
          target: apiUrl,
          changeOrigin: true,
          ws: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@mantine/')) return "vendor-mantine";
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return "vendor-react";
            if (id.includes('node_modules/')) return "vendor-misc";
          }
        }
      }
    }
  };
});