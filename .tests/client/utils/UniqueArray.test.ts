import { describe, expect, it } from "vitest";

import { UniqueArray } from "../../../client/src/utils/UniqueArray";


describe("UniqueArray", () => {
  it("constructs from an initial array", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(ua.length).toBe(1);
    expect(ua.find("a")).toEqual({ id: "a", value: 1 });
  });

  it("add() appends a new item", () => {
    const ua = new UniqueArray<string, { value: number; }>();
    ua.add({ id: "a", value: 1 });
    expect(ua.items).toEqual([{ id: "a", value: 1 }]);
  });

  it("add() replaces an existing item with the same id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    ua.add({ id: "a", value: 2 });
    expect(ua.length).toBe(1);
    expect(ua.find("a")).toEqual({ id: "a", value: 2 });
  });

  it("remove() deletes an item by id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    ua.remove("a");
    expect(ua.items).toEqual([{ id: "b", value: 2 }]);
  });

  it("remove() is a no-op for a missing id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    ua.remove("missing");
    expect(ua.length).toBe(1);
  });

  it("at() supports non-negative indices directly", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    expect(ua.at(0)).toEqual({ id: "a", value: 1 });
    expect(ua.at(1)).toEqual({ id: "b", value: 2 });
  });

  it("at() supports negative indices from the end", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    expect(ua.at(-1)).toEqual({ id: "b", value: 2 });
  });

  it("at() throws when the index is out of bounds", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(() => ua.at(5)).toThrow();
    expect(() => ua.at(-5)).toThrow();
  });

  it("head() and last() return the first and last items", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    expect(ua.head()).toEqual({ id: "a", value: 1 });
    expect(ua.last()).toEqual({ id: "b", value: 2 });
  });

  it("clear() empties the collection", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    ua.clear();
    expect(ua.length).toBe(0);
  });

  it("has() reports whether an id exists", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(ua.has("a")).toBe(true);
    expect(ua.has("b")).toBe(false);
  });

  it("exists() checks a key/value pair for a specific id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(ua.exists("a", "value", 1)).toBe(true);
    expect(ua.exists("a", "value", 2)).toBe(false);
    expect(ua.exists("missing", "value", 1)).toBe(false);
  });

  it("existsAny() counts items matching a key/value pair", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 1 }, { id: "c", value: 2 }]);
    expect(ua.existsAny("value", 1)).toBe(2);
  });

  it("existsWithValues() checks a key against a list of acceptable values for a specific id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(ua.existsWithValues("a", "value", [1, 2])).toBe(true);
    expect(ua.existsWithValues("a", "value", [3, 4])).toBe(false);
  });

  it("findIndex() returns undefined for a missing id", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }]);
    expect(ua.findIndex("missing")).toBeUndefined();
  });

  it("map() and filter() delegate to the underlying array", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    expect(ua.map(v => v.value)).toEqual([1, 2]);
    expect(ua.filter(v => v.value > 1)).toEqual([{ id: "b", value: 2 }]);
  });

  it("forEach() iterates over every item", () => {
    const ua = new UniqueArray<string, { value: number; }>([{ id: "a", value: 1 }, { id: "b", value: 2 }]);
    const seen: number[] = [];
    ua.forEach(v => seen.push(v.value));
    expect(seen).toEqual([1, 2]);
  });
});
