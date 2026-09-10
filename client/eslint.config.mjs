import rootConfig from "../shared/eslint.config.mjs";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // wasm-bindgen-generated output (client-renderer/README.md's build step regenerates this on
  // every build) — not hand-written, not meant to be linted, same treatment as node_modules.
  globalIgnores(["src/wasm/**/*"]),
  ...rootConfig,

  // Structural enforcement for the shared/ protocol|domain vs db|server split (see
  // .docs/codebase.md's "Package Relationships") — a lint error the moment client code imports
  // server-only shared/ code, rather than relying on client/tsconfig.json's `include` list alone
  // (a tsconfig gap is easy to reintroduce by accident; this makes the boundary visible in-editor
  // on the offending import line itself).
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": ["error", {
        zones: [{
          target: "./src",
          from: ["../shared/db", "../shared/utils"],
          message: "shared/db/ and shared/utils/ touch Postgres or hold server secrets and must never reach the browser bundle."
        }]
      }]
    }
  }
]);