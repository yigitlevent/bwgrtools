import { vi } from "vitest";

// client/src/utils' environment helpers read import.meta.env.VITE_ENV/VITE_API_URL eagerly at
// module-import time — vitest's jsdom environment doesn't run Vite's env loading, so without a
// default here any test importing a module that reads Env would throw on import. A dedicated
// env test can override these via vi.stubEnv + vi.resetModules() per-case to exercise real
// validation logic; this default only needs to cover every other test file's incidental import.
vi.stubEnv("VITE_ENV", "dev");
vi.stubEnv("VITE_API_URL", "http://localhost:3000");
