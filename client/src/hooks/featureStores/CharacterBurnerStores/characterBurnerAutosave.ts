import { BuildCharacterBurnerSnapshot } from "./characterBurnerSnapshot";
import { IsCharacterBurnerExportSnapshot } from "./characterBurnerSnapshotGuard";
import { useCharacterBurnerAttributeStore } from "./useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "./useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "./useCharacterBurnerLifepath";
import { useCharacterBurnerLimitsStore } from "./useCharacterBurnerLimits";
import { useCharacterBurnerResourceStore } from "./useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "./useCharacterBurnerSkill";
import { useCharacterBurnerSpecialStore } from "./useCharacterBurnerSpecial";
import { useCharacterBurnerStatStore } from "./useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "./useCharacterBurnerTrait";
import { useRulesetStore } from "../../apiStores/useRulesetStore";


const StorageKey = "CharacterBurnerAutosave";
const DebounceMs = 500;

function IsCharacterBurnerAutosavePayload(value: unknown): value is CharacterBurnerAutosavePayload {
  if (typeof value !== "object" || value === null) return false;
  if (!("rulesetIds" in value) || !Array.isArray(value.rulesetIds)) return false;
  if (!("savedAt" in value) || typeof value.savedAt !== "string") return false;
  if (!("snapshot" in value) || !IsCharacterBurnerExportSnapshot(value.snapshot)) return false;
  return true;
}

export function ReadPersistedCharacter(): CharacterBurnerAutosavePayload | null {
  const raw = localStorage.getItem(StorageKey);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  }
  catch {
    return null;
  }

  return IsCharacterBurnerAutosavePayload(parsed) ? parsed : null;
}

export function IsRulesetMismatch(payload: CharacterBurnerAutosavePayload): boolean {
  const current = useRulesetStore.getState().chosenRulesets;
  if (current.length !== payload.rulesetIds.length) return true;
  return !current.every(id => payload.rulesetIds.includes(id));
}

export function PersistCharacterSnapshot(): boolean {
  try {
    const payload: CharacterBurnerAutosavePayload = {
      rulesetIds: useRulesetStore.getState().chosenRulesets,
      savedAt: new Date().toISOString(),
      snapshot: BuildCharacterBurnerSnapshot()
    };
    localStorage.setItem(StorageKey, JSON.stringify(payload));
    return true;
  }
  catch {
    return false;
  }
}

export function ClearPersistedCharacter(): void {
  localStorage.removeItem(StorageKey);
}

export function SubscribeCharacterBurnerAutosave(onPersistFailure: (failed: boolean) => void): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const scheduleSave = (): void => {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = setTimeout(() => {
      onPersistFailure(!PersistCharacterSnapshot());
    }, DebounceMs);
  };

  const unsubscribes = [
    useCharacterBurnerBasicsStore.subscribe(scheduleSave),
    useCharacterBurnerStatStore.subscribe(scheduleSave),
    useCharacterBurnerSkillStore.subscribe(scheduleSave),
    useCharacterBurnerTraitStore.subscribe(scheduleSave),
    useCharacterBurnerAttributeStore.subscribe(scheduleSave),
    useCharacterBurnerLifepathStore.subscribe(scheduleSave),
    useCharacterBurnerResourceStore.subscribe(scheduleSave),
    useCharacterBurnerSpecialStore.subscribe(scheduleSave),
    useCharacterBurnerLimitsStore.subscribe(scheduleSave)
  ];

  return () => {
    if (timeout !== undefined) clearTimeout(timeout);
    unsubscribes.forEach(unsubscribe => { unsubscribe(); });
  };
}
