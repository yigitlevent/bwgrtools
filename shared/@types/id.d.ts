declare const NominalBrand: unique symbol;

type Nominal<Type, Identifier> = Type & { readonly [NominalBrand]: Identifier; };


type Id =
  | meta.Id
  | dat.Id;

declare namespace meta {
  type Id =
    | MigrationId;

  type MigrationId = Nominal<number, "MigrationId">;
}

declare namespace dat {
  type Id =
    | AbilityId
    | AbilityTypeId
    | ActionResolutionTypeId
    | AgePoolId
    | AltSpellAreaOfEffectFacetId
    | AltSpellDurationFacetId
    | AltSpellFacetTypeId
    | AltSpellHigherElementFacetId
    | AltSpellLawFacetId
    | AltSpellLowerElementFacetId
    | AltSpellOriginFacetId
    | AltSpellPrimeElementFacetId
    | DistanceUnitId
    | DuelOfWitsActionResolutionId
    | DuelOfWitsActionId
    | DuelOfWitsActionTestId
    | FightActionGroupId
    | FightActionResolutionId
    | FightActionId
    | FightActionTestId
    | LifepathRequirementBlockId
    | LifepathRequirementItemId
    | LifepathRequirementId
    | LifepathId
    | LogicTypeId
    | QuestionId
    | RangeAndCoverActionGroupId
    | RangeAndCoverActionResolutionId
    | RangeAndCoverActionId
    | RequirementItemTypeId
    | ResourceCostId
    | ResourceMagicDetailId
    | ResourceMagicObstacleId
    | ResourceModifierId
    | ResourceId
    | ResourceTypeId
    | RulesetId
    | SettingId
    | SkillCategoryId
    | SkillId
    | SkillToolTypeId
    | SkillTypeId
    | SpellAreaOfEffectFacetId
    | SpellDurationFacetId
    | SpellElementFacetId
    | SpellFacetTypeId
    | SpellImpetusFacetId
    | SpellOriginFacetId
    | StockId
    | TimeUnitId
    | TraitCategoryId
    | TraitId
    | TraitTypeId
    | UnitModifierId;

  type AbilityId = Nominal<number, "AbilityId">;
  type AbilityTypeId = Nominal<number, "AbilityTypeId">;
  type ActionResolutionTypeId = Nominal<number, "ActionResolutionTypeId">;
  type AgePoolId = Nominal<number, "AgePoolId">;
  type AltSpellAreaOfEffectFacetId = Nominal<number, "AltSpellAreaOfEffectFacetId">;
  type AltSpellDurationFacetId = Nominal<number, "AltSpellDurationFacetId">;
  type AltSpellFacetTypeId = Nominal<number, "AltSpellFacetTypeId">;
  type AltSpellHigherElementFacetId = Nominal<number, "AltSpellHigherElementFacetId">;
  type AltSpellLawFacetId = Nominal<number, "AltSpellLawFacetId">;
  type AltSpellLowerElementFacetId = Nominal<number, "AltSpellLowerElementFacetId">;
  type AltSpellOriginFacetId = Nominal<number, "AltSpellOriginFacetId">;
  type AltSpellPrimeElementFacetId = Nominal<number, "AltSpellPrimeElementFacetId">;
  type DistanceUnitId = Nominal<number, "DistanceUnitId">;
  type DuelOfWitsActionResolutionId = Nominal<number, "DuelOfWitsActionResolutionId">;
  type DuelOfWitsActionId = Nominal<number, "DuelOfWitsActionId">;
  type DuelOfWitsActionTestId = Nominal<number, "DuelOfWitsActionTestId">;
  type FightActionGroupId = Nominal<number, "FightActionGroupId">;
  type FightActionResolutionId = Nominal<number, "FightActionResolutionId">;
  type FightActionId = Nominal<number, "FightActionId">;
  type FightActionTestId = Nominal<number, "FightActionTestId">;
  type LifepathRequirementBlockId = Nominal<number, "LifepathRequirementBlockId">;
  type LifepathRequirementItemId = Nominal<number, "LifepathRequirementItemId">;
  type LifepathRequirementId = Nominal<number, "LifepathRequirementId">;
  type LifepathId = Nominal<number, "LifepathId">;
  type LogicTypeId = Nominal<number, "LogicTypeId">;
  type QuestionId = Nominal<number, "QuestionId">;
  type RangeAndCoverActionGroupId = Nominal<number, "RangeAndCoverActionGroupId">;
  type RangeAndCoverActionResolutionId = Nominal<number, "RangeAndCoverActionResolutionId">;
  type RangeAndCoverActionId = Nominal<number, "RangeAndCoverActionId">;
  type RequirementItemTypeId = Nominal<number, "RequirementItemTypeId">;
  type ResourceCostId = Nominal<number, "ResourceCostId">;
  type ResourceMagicDetailId = Nominal<number, "ResourceMagicDetailId">;
  type ResourceMagicObstacleId = Nominal<number, "ResourceMagicObstacleId">;
  type ResourceModifierId = Nominal<number, "ResourceModifierId">;
  type ResourceId = Nominal<number, "ResourceId">;
  type ResourceTypeId = Nominal<number, "ResourceTypeId">;
  type RulesetId = Nominal<string, "RulesetId">;
  type SettingId = Nominal<number, "SettingId">;
  type SkillCategoryId = Nominal<number, "SkillCategoryId">;
  type SkillId = Nominal<number, "SkillId">;
  type SkillToolTypeId = Nominal<number, "SkillToolTypeId">;
  type SkillTypeId = Nominal<number, "SkillTypeId">;
  type SpellAreaOfEffectFacetId = Nominal<number, "SpellAreaOfEffectFacetId">;
  type SpellDurationFacetId = Nominal<number, "SpellDurationFacetId">;
  type SpellElementFacetId = Nominal<number, "SpellElementFacetId">;
  type SpellFacetTypeId = Nominal<number, "SpellFacetTypeId">;
  type SpellImpetusFacetId = Nominal<number, "SpellImpetusFacetId">;
  type SpellOriginFacetId = Nominal<number, "SpellOriginFacetId">;
  type StockId = Nominal<number, "StockId">;
  type TimeUnitId = Nominal<number, "TimeUnitId">;
  type TraitCategoryId = Nominal<number, "TraitCategoryId">;
  type TraitId = Nominal<number, "TraitId">;
  type TraitTypeId = Nominal<number, "TraitTypeId">;
  type UnitModifierId = Nominal<number, "UnitModifierId">;
}
