import { beforeEach, describe, expect, it } from "vitest";

import {
  BuildCharacterBurnerSnapshot,
  HydrateCharacterBurner
} from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/characterBurnerSnapshot";
import { useCharacterBurnerBasicsStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerResourceStore } from "../../../../../client/src/hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";


describe("BuildCharacterBurnerSnapshot / HydrateCharacterBurner", () => {
  beforeEach(() => {
    useCharacterBurnerBasicsStore.setState({ name: "", concept: "" });
    useCharacterBurnerLifepathStore.getState().reset();
    useCharacterBurnerResourceStore.getState().reset();
  });

  it("captures the current basics state in the snapshot", () => {
    useCharacterBurnerBasicsStore.getState().setName("Torvald");
    useCharacterBurnerBasicsStore.getState().setConcept("A wandering smith");

    const snapshot = BuildCharacterBurnerSnapshot();

    expect(snapshot.basics.name).toBe("Torvald");
    expect(snapshot.basics.concept).toBe("A wandering smith");
    expect(snapshot).toHaveProperty("lifepaths");
    expect(snapshot).toHaveProperty("stats");
    expect(snapshot).toHaveProperty("skills");
    expect(snapshot).toHaveProperty("traits");
    expect(snapshot).toHaveProperty("attributes");
    expect(snapshot).toHaveProperty("resources");
    expect(snapshot).toHaveProperty("misc");
  });

  it("restores basics fields from a snapshot", () => {
    useCharacterBurnerBasicsStore.getState().setName("Original");
    const snapshot = BuildCharacterBurnerSnapshot();

    useCharacterBurnerBasicsStore.getState().setName("Changed");
    expect(useCharacterBurnerBasicsStore.getState().name).toBe("Changed");

    HydrateCharacterBurner({ ...snapshot, basics: { ...snapshot.basics, name: "Restored" } });

    expect(useCharacterBurnerBasicsStore.getState().name).toBe("Restored");
  });

  it("round-trips a snapshot through build and hydrate", () => {
    useCharacterBurnerBasicsStore.getState().setName("RoundTrip");
    const snapshot = BuildCharacterBurnerSnapshot();

    useCharacterBurnerBasicsStore.setState({ name: "" });
    expect(useCharacterBurnerBasicsStore.getState().name).not.toBe("RoundTrip");

    HydrateCharacterBurner(snapshot);

    expect(useCharacterBurnerBasicsStore.getState().name).toBe("RoundTrip");
    expect(useCharacterBurnerLifepathStore.getState().lifepaths).toEqual(snapshot.lifepaths.lifepaths);
  });
});
