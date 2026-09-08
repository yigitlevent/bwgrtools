import { describe, expect, it, vi } from "vitest";

import { DownloadFile } from "../../../client/src/utils/DownloadFile";


describe("DownloadFile", () => {
  it("creates a temporary anchor with the given filename and href, clicks it, then removes it", () => {
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    const setAttributeSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);

    vi.spyOn(document, "createElement").mockReturnValue({
      setAttribute: setAttributeSpy,
      click: clickSpy,
      remove: removeSpy
    } as unknown as HTMLAnchorElement);

    DownloadFile("character.json", "data:text/json,{}");

    expect(setAttributeSpy).toHaveBeenCalledWith("href", "data:text/json,{}");
    expect(setAttributeSpy).toHaveBeenCalledWith("download", "character.json");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });
});
