import { defineConfig } from "vitest/config";


export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["{api,shared}/**/*.test.ts"],
          setupFiles: ["./setup/node.setup.ts"]
        }
      },
      {
        test: {
          name: "client",
          environment: "jsdom",
          include: ["client/**/*.test.{ts,tsx}"],
          setupFiles: ["./setup/client.setup.ts"]
        }
      }
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      reportOnFailure: true,
      allowExternal: true,
      include: [
        "**/api/src/**",
        "**/client/src/**",
        "**/shared/utils/**",
        "**/shared/db/**"
      ]
    }
  }
});
