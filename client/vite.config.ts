import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = "../";
  const env = loadEnv(mode, envDir, "");
  const apiUrl = env.VITE_API_URL ?? "http://localhost:3000";

  return {
    base: mode === "production" ? "/bwgrtools/" : "/",
    envDir,
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true
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