/**
 * A stat's "own" pool (Mental for Mental-pool stats, Physical for Physical-pool
 * stats) is always spent from before falling back to the shared Either pool.
 * Both `shiftStatShade` and `modifyStatExponent` in useCharacterBurnerStat.tsx
 * need to know which pool has room for a given stat - this resolves that.
 */
export function ResolvePoolForStat(poolType: "Mental" | "Physical", getMentalPool: () => Points, getPhysicalPool: () => Points): Points {
  return poolType === "Mental" ? getMentalPool() : getPhysicalPool();
}
