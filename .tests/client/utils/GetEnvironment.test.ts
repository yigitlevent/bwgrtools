import { afterEach, describe, expect, it, vi } from "vitest";


describe("GetEnvironment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns env and apiUrl when both are valid", async () => {
    vi.stubEnv("VITE_ENV", "prod");
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
    vi.resetModules();

    const { Env } = await import("../../../client/src/utils/GetEnvironment");
    expect(Env).toEqual({ env: "prod", apiUrl: "https://api.example.com" });
  });

  it("throws when VITE_ENV is missing", async () => {
    vi.stubEnv("VITE_ENV", "");
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
    vi.resetModules();

    // GetEnvironment() also runs eagerly at module load (`export const Env = GetEnvironment();`),
    // so an invalid env throws during the import itself rather than when calling the export.
    await expect(import("../../../client/src/utils/GetEnvironment")).rejects.toThrow("bad environment");
  });

  it("throws when VITE_ENV is not dev/prod", async () => {
    vi.stubEnv("VITE_ENV", "staging");
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
    vi.resetModules();

    await expect(import("../../../client/src/utils/GetEnvironment")).rejects.toThrow("bad environment");
  });

  it("throws when VITE_API_URL is missing", async () => {
    vi.stubEnv("VITE_ENV", "dev");
    vi.stubEnv("VITE_API_URL", "");
    vi.resetModules();

    await expect(import("../../../client/src/utils/GetEnvironment")).rejects.toThrow("bad apiUrl");
  });
});
