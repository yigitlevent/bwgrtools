CREATE TABLE
  dat."LogicType" ("id" INT NOT NULL, "name" CHARACTER VARYING(7) NOT NULL, PRIMARY KEY ("id"));

CREATE TABLE
  dat."RequirementItemType" ("id" INT NOT NULL, "name" CHARACTER VARYING(31) NOT NULL, PRIMARY KEY ("id"));

CREATE TABLE
  dat."AbilityType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SkillToolType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SkillType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "cycle" INTEGER NOT NULL,
    "routine" INTEGER NOT NULL,
    "difficult" INTEGER NOT NULL,
    "challenging" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SkillCategory" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."TraitType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."TraitCategory" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."ActionResolutionType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(15) NOT NULL,
    "nameLong" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."ResourceType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."TimeUnit" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."DistanceUnit" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."UnitModifier" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."Ruleset" (
    "id" CHARACTER VARYING(15) NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "isOfficial" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "isExpansion" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("id")
  );

CREATE TABLE
  dat."RulesetExpansion" (
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    "expansionId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("rulesetId", "expansionId"),
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("expansionId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Stock" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "namePlural" CHARACTER VARYING(255) NOT NULL,
    "stride" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AgePool" (
    "id" serial NOT NULL,
    "stockId" serial NOT NULL,
    "minAge" INTEGER NOT NULL,
    "mentalPool" INTEGER NOT NULL,
    "physicalPool" INTEGER NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetStock" (
    "stockId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("stockId", "rulesetId"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Setting" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "nameShort" CHARACTER VARYING(255) NOT NULL,
    "stockId" INTEGER NOT NULL,
    "isSubsetting" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetSetting" (
    "settingId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("settingId", "rulesetId"),
    FOREIGN KEY ("settingId") REFERENCES dat."Setting" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Trait" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "stockId" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "description" CHARACTER VARYING(325124), -- 10485760?,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("categoryId") REFERENCES dat."TraitCategory" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("typeId") REFERENCES dat."TraitType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetTrait" (
    "traitId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("traitId", "rulesetId"),
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Ability" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "abilityTypeId" INTEGER NOT NULL,
    "hasShades" BOOLEAN NOT NULL,
    "cycle" INTEGER,
    "routine" INTEGER,
    "difficult" INTEGER,
    "challenging" INTEGER,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("abilityTypeId") REFERENCES dat."AbilityType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Skill" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "stockId" INTEGER,
    "categoryId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "isMagical" BOOLEAN NOT NULL,
    "isTraining" BOOLEAN NOT NULL,
    "dontList" BOOLEAN NOT NULL,
    "root1Id" INTEGER,
    "root2Id" INTEGER,
    "description" CHARACTER VARYING(325124), -- 10485760?
    "toolTypeId" INTEGER,
    "toolDescription" CHARACTER VARYING(255),
    "restrictionOnlyStockId" INTEGER,
    "restrictionWhenBurning" BOOLEAN,
    "restrictionAbilityId" INTEGER,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("categoryId") REFERENCES dat."SkillCategory" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("typeId") REFERENCES dat."SkillType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("root1Id") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("root2Id") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("toolTypeId") REFERENCES dat."SkillToolType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("restrictionOnlyStockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("restrictionAbilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetSkill" (
    "skillId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("skillId", "rulesetId"),
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."SkillSubskill" (
    "skillId" INTEGER NOT NULL,
    "subskillId" INTEGER NOT NULL,
    PRIMARY KEY ("skillId", "subskillId"),
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("subskillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    CHECK ("skillId" <> "subskillId")
  );

CREATE TABLE
  dat."TraitCallOnSkill" (
    "traitId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    PRIMARY KEY ("traitId", "skillId"),
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."TraitCallOnAbility" (
    "traitId" INTEGER NOT NULL,
    "abilityId" INTEGER NOT NULL,
    PRIMARY KEY ("traitId", "abilityId"),
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."AbilityRequiredTrait" (
    "abilityId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    PRIMARY KEY ("abilityId", "traitId"),
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Lifepath" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "stockId" INT NOT NULL,
    "settingId" INT NOT NULL,
    "born" BOOLEAN NOT NULL,
    "years" INT[] NOT NULL,
    "eitherPool" INT NOT NULL,
    "mentalPool" INT NOT NULL,
    "physicalPool" INT NOT NULL,
    "generalSkillPool" INT NOT NULL,
    "lifepathSkillPool" INT NOT NULL,
    "traitPool" INT NOT NULL,
    "resourcePoints" INT NOT NULL,
    "isGspMultiplier" BOOLEAN NOT NULL,
    "isLspMultiplier" BOOLEAN NOT NULL,
    "isRpMultiplier" BOOLEAN NOT NULL,
    "halfGspFromPrev" BOOLEAN NOT NULL,
    "halfLspFromPrev" BOOLEAN NOT NULL,
    "halfRpFromPrev" BOOLEAN NOT NULL,
    "requirementText" CHARACTER VARYING(325124),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("settingId") REFERENCES dat."Setting" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathLead" (
    "lifepathId" INT NOT NULL,
    "settingId" INT NOT NULL,
    PRIMARY KEY ("lifepathId", "settingId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("settingId") REFERENCES dat."Setting" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathSkill" (
    "lifepathId" INT NOT NULL,
    "skillId" INT NOT NULL,
    "index" INT NOT NULL,
    PRIMARY KEY ("lifepathId", "skillId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathTrait" (
    "lifepathId" INT NOT NULL,
    "traitId" INT NOT NULL,
    "index" INT NOT NULL,
    PRIMARY KEY ("lifepathId", "traitId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathCompanion" (
    "lifepathId" INT NOT NULL,
    "companionName" CHARACTER VARYING(63) NOT NULL,
    "givesSkills" BOOLEAN NOT NULL,
    "gspMultiplier" FLOAT NOT NULL,
    "lspMultiplier" FLOAT NOT NULL,
    "rpMultiplier" FLOAT NOT NULL,
    PRIMARY KEY ("lifepathId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathCompanionSetting" (
    "lifepathId" INT NOT NULL,
    "companionSettingId" INT,
    PRIMARY KEY ("lifepathId", "companionSettingId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("companionSettingId") REFERENCES dat."Setting" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetLifepath" (
    "lifepathId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("lifepathId", "rulesetId"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathRequirement" (
    "id" serial NOT NULL,
    "lifepathId" INT NOT NULL,
    "logicTypeId" INT NOT NULL,
    "mustFulfill" BOOLEAN NOT NULL,
    "fulfillmentAmount" INT NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("logicTypeId") REFERENCES dat."LogicType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."LifepathRequirementItem" (
    "id" serial NOT NULL,
    "requirementId" INT NOT NULL,
    "requirementTypeId" INT NOT NULL,
    "forCompanion" BOOLEAN NOT NULL,
    "min" INT,
    "max" INT,
    "settingId" INT,
    "lifepathId" INT,
    "skillId" INT,
    "traitId" INT,
    "attributeId" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("requirementId") REFERENCES dat."LifepathRequirement" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("requirementTypeId") REFERENCES dat."RequirementItemType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("settingId") REFERENCES dat."Setting" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("lifepathId") REFERENCES dat."Lifepath" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("attributeId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."DuelOfWitsAction" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "speakingThePart" CHARACTER VARYING(325124),
    "special" CHARACTER VARYING(325124),
    "effect" CHARACTER VARYING(325124),
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."DuelOfWitsActionTest" (
    "id" serial NOT NULL,
    "actionId" INT NOT NULL,
    "skillId" INT,
    "abilityId" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("actionId") REFERENCES dat."DuelOfWitsAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    CHECK (("skillId" IS NULL) <> ("abilityId" IS NULL))
  );

CREATE TABLE
  dat."DuelOfWitsActionResolution" (
    "id" serial NOT NULL,
    "actionId" INT NOT NULL,
    "opposingActionId" INT NOT NULL,
    "resolutionTypeId" INT NOT NULL,
    "isAgainstSkill" BOOLEAN,
    "obstacle" INT,
    "skillId" INT,
    "abilityId" INT,
    "opposingSkillId" INT,
    "opposingAbilityId" INT,
    "opposingModifier" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("actionId") REFERENCES dat."DuelOfWitsAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingActionId") REFERENCES dat."DuelOfWitsAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("resolutionTypeId") REFERENCES dat."ActionResolutionType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingSkillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingAbilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RangeAndCoverActionGroup" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."RangeAndCoverAction" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "modifier" INT NOT NULL,
    "useFoRKs" BOOLEAN NOT NULL,
    "useWeaponRangeAdvantage" BOOLEAN NOT NULL,
    "usePositionAdvantage" BOOLEAN NOT NULL,
    "useStrideAdvantage" BOOLEAN NOT NULL,
    "isOpenEnded" BOOLEAN NOT NULL,
    "effect" CHARACTER VARYING(325124),
    "specialRestriction" CHARACTER VARYING(325124),
    "specialAction" CHARACTER VARYING(325124),
    "however" CHARACTER VARYING(325124),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("groupId") REFERENCES dat."RangeAndCoverActionGroup" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RangeAndCoverActionResolution" (
    "id" serial NOT NULL,
    "actionId" INT NOT NULL,
    "opposingActionId" INT NOT NULL,
    "resolutionTypeId" INT NOT NULL,
    "isAgainstSkill" BOOLEAN,
    "obstacle" INT,
    "skillId" INT,
    "abilityId" INT,
    "opposingSkillId" INT,
    "opposingAbilityId" INT,
    "opposingModifier" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("actionId") REFERENCES dat."RangeAndCoverAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingActionId") REFERENCES dat."RangeAndCoverAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("resolutionTypeId") REFERENCES dat."ActionResolutionType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingSkillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingAbilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."FightActionGroup" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."FightAction" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "actionCost" INTEGER,
    "testExtra" CHARACTER VARYING(325124),
    "restrictions" CHARACTER VARYING(325124),
    "effect" CHARACTER VARYING(325124),
    "special" CHARACTER VARYING(325124),
    "countsAsNoAction" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("groupId") REFERENCES dat."FightActionGroup" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."FightActionTest" (
    "id" INT NOT NULL,
    "actionId" INT NOT NULL,
    "skillId" INT,
    "abilityId" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("actionId") REFERENCES dat."FightAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    CHECK (("skillId" IS NULL) <> ("abilityId" IS NULL))
  );

CREATE TABLE
  dat."FightActionResolution" (
    "id" serial NOT NULL,
    "actionId" INT NOT NULL,
    "opposingActionId" INT NOT NULL,
    "resolutionTypeId" INT NOT NULL,
    "isAgainstSkill" BOOLEAN,
    "obstacle" INT,
    "skillId" INT,
    "abilityId" INT,
    "opposingSkillId" INT,
    "opposingAbilityId" INT,
    "opposingModifier" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("actionId") REFERENCES dat."FightAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingActionId") REFERENCES dat."FightAction" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("resolutionTypeId") REFERENCES dat."ActionResolutionType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("skillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("abilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingSkillId") REFERENCES dat."Skill" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("opposingAbilityId") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."SpellFacetType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SpellOriginFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SpellDurationFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SpellAreaOfEffectFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SpellElementFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."SpellImpetusFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."Resource" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "stockId" INT NOT NULL,
    "resourceTypeId" INTEGER NOT NULL,
    "description" CHARACTER VARYING(325124), -- 10485760?,
    "variableCost" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("stockId") REFERENCES dat."Stock" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("resourceTypeId") REFERENCES dat."ResourceType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."ResourceCost" (
    "id" INT NOT NULL,
    "resourceId" INT NOT NULL,
    "cost" INT NOT NULL,
    "description" CHARACTER VARYING(255),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."ResourceModifier" (
    "id" INT NOT NULL,
    "resourceId" INT NOT NULL,
    "cost" INT NOT NULL,
    "isPerCost" BOOLEAN NOT NULL,
    "description" CHARACTER VARYING(255),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."ResourceMagicDetail" (
    "id" serial NOT NULL,
    "resourceId" INT NOT NULL,
    "originId" INT NOT NULL,
    "originModifierId" INT,
    "durationId" INT NOT NULL,
    "durationUnitId" INT,
    "areaOfEffectId" INT NOT NULL,
    "areaOfEffectUnitId" INT,
    "areaOfEffectModifierId" INT,
    "element1Id" INT NOT NULL,
    "element2Id" INT,
    "element3Id" INT,
    "impetus1Id" INT NOT NULL,
    "impetus2Id" INT,
    "actions" INT NOT NULL,
    "actionsMultiply" BOOLEAN NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("originModifierId") REFERENCES dat."UnitModifier" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("areaOfEffectModifierId") REFERENCES dat."UnitModifier" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("durationUnitId") REFERENCES dat."TimeUnit" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("areaOfEffectUnitId") REFERENCES dat."DistanceUnit" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("originId") REFERENCES dat."SpellOriginFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("durationId") REFERENCES dat."SpellDurationFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("areaOfEffectId") REFERENCES dat."SpellAreaOfEffectFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("element1Id") REFERENCES dat."SpellElementFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("element2Id") REFERENCES dat."SpellElementFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("element3Id") REFERENCES dat."SpellElementFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("impetus1Id") REFERENCES dat."SpellImpetusFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("impetus2Id") REFERENCES dat."SpellImpetusFacet" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."ResourceMagicObstacle" (
    "id" serial NOT NULL,
    "resourceId" INT NOT NULL,
    "obstacle" INT,
    "obstacleAbility1Id" INT,
    "obstacleAbility2Id" INT,
    "obstacleCaret" BOOLEAN NOT NULL,
    "description" CHARACTER VARYING(255),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("obstacleAbility1Id") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("obstacleAbility2Id") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."RulesetResource" (
    "resourceId" INTEGER NOT NULL,
    "rulesetId" CHARACTER VARYING(15) NOT NULL,
    PRIMARY KEY ("resourceId", "rulesetId"),
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("rulesetId") REFERENCES dat."Ruleset" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."TraitGrantsResource" (
    "traitId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "minCost" INTEGER NOT NULL,
    "isChoice" BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY ("traitId", "resourceId"),
    FOREIGN KEY ("traitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("resourceId") REFERENCES dat."Resource" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."Question" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "question" CHARACTER VARYING(325124) NOT NULL,
    "attributeId1" INT,
    "attributeId2" INT,
    PRIMARY KEY ("id"),
    UNIQUE ("name"),
    FOREIGN KEY ("attributeId1") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("attributeId2") REFERENCES dat."Ability" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
  );

CREATE TABLE
  dat."AltSpellFacetType" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellOriginFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellDurationFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    "subFacet" CHARACTER VARYING(255),
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellAreaOfEffectFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    "subFacet" CHARACTER VARYING(255),
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellPrimeElementFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellLowerElementFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellHigherElementFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  dat."AltSpellLawFacet" (
    "id" serial NOT NULL,
    "name" CHARACTER VARYING(255) NOT NULL,
    "obstacle" INTEGER NOT NULL,
    "actions" INTEGER NOT NULL,
    "resource" INTEGER NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE INDEX IF NOT EXISTS "IDX_RulesetExpansion_expansionId" ON dat."RulesetExpansion" ("expansionId");

CREATE INDEX IF NOT EXISTS "IDX_AgePool_stockId" ON dat."AgePool" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_RulesetStock_rulesetId" ON dat."RulesetStock" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_Setting_stockId" ON dat."Setting" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_RulesetSetting_rulesetId" ON dat."RulesetSetting" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_Trait_stockId" ON dat."Trait" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_Trait_categoryId" ON dat."Trait" ("categoryId");

CREATE INDEX IF NOT EXISTS "IDX_Trait_typeId" ON dat."Trait" ("typeId");

CREATE INDEX IF NOT EXISTS "IDX_RulesetTrait_rulesetId" ON dat."RulesetTrait" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_Ability_abilityTypeId" ON dat."Ability" ("abilityTypeId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_stockId" ON dat."Skill" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_categoryId" ON dat."Skill" ("categoryId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_typeId" ON dat."Skill" ("typeId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_root1Id" ON dat."Skill" ("root1Id");

CREATE INDEX IF NOT EXISTS "IDX_Skill_root2Id" ON dat."Skill" ("root2Id");

CREATE INDEX IF NOT EXISTS "IDX_Skill_toolTypeId" ON dat."Skill" ("toolTypeId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_restrictionOnlyStockId" ON dat."Skill" ("restrictionOnlyStockId");

CREATE INDEX IF NOT EXISTS "IDX_Skill_restrictionAbilityId" ON dat."Skill" ("restrictionAbilityId");

CREATE INDEX IF NOT EXISTS "IDX_RulesetSkill_rulesetId" ON dat."RulesetSkill" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_SkillSubskill_subskillId" ON dat."SkillSubskill" ("subskillId");

CREATE INDEX IF NOT EXISTS "IDX_TraitCallOnSkill_skillId" ON dat."TraitCallOnSkill" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_TraitCallOnAbility_abilityId" ON dat."TraitCallOnAbility" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_AbilityRequiredTrait_traitId" ON dat."AbilityRequiredTrait" ("traitId");

CREATE INDEX IF NOT EXISTS "IDX_Lifepath_stockId" ON dat."Lifepath" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_Lifepath_settingId" ON dat."Lifepath" ("settingId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathLead_settingId" ON dat."LifepathLead" ("settingId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathSkill_skillId" ON dat."LifepathSkill" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathTrait_traitId" ON dat."LifepathTrait" ("traitId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathCompanionSetting_companionSettingId" ON dat."LifepathCompanionSetting" ("companionSettingId");

CREATE INDEX IF NOT EXISTS "IDX_RulesetLifepath_rulesetId" ON dat."RulesetLifepath" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirement_lifepathId" ON dat."LifepathRequirement" ("lifepathId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirement_logicTypeId" ON dat."LifepathRequirement" ("logicTypeId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_requirementId" ON dat."LifepathRequirementItem" ("requirementId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_requirementTypeId" ON dat."LifepathRequirementItem" ("requirementTypeId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_settingId" ON dat."LifepathRequirementItem" ("settingId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_lifepathId" ON dat."LifepathRequirementItem" ("lifepathId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_skillId" ON dat."LifepathRequirementItem" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_traitId" ON dat."LifepathRequirementItem" ("traitId");

CREATE INDEX IF NOT EXISTS "IDX_LifepathRequirementItem_attributeId" ON dat."LifepathRequirementItem" ("attributeId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionTest_actionId" ON dat."DuelOfWitsActionTest" ("actionId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionTest_skillId" ON dat."DuelOfWitsActionTest" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionTest_abilityId" ON dat."DuelOfWitsActionTest" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_actionId" ON dat."DuelOfWitsActionResolution" ("actionId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_opposingActionId" ON dat."DuelOfWitsActionResolution" ("opposingActionId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_resolutionTypeId" ON dat."DuelOfWitsActionResolution" ("resolutionTypeId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_skillId" ON dat."DuelOfWitsActionResolution" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_abilityId" ON dat."DuelOfWitsActionResolution" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_opposingSkillId" ON dat."DuelOfWitsActionResolution" ("opposingSkillId");

CREATE INDEX IF NOT EXISTS "IDX_DuelOfWitsActionResolution_opposingAbilityId" ON dat."DuelOfWitsActionResolution" ("opposingAbilityId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverAction_groupId" ON dat."RangeAndCoverAction" ("groupId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_actionId" ON dat."RangeAndCoverActionResolution" ("actionId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_opposingActionId" ON dat."RangeAndCoverActionResolution" ("opposingActionId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_resolutionTypeId" ON dat."RangeAndCoverActionResolution" ("resolutionTypeId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_skillId" ON dat."RangeAndCoverActionResolution" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_abilityId" ON dat."RangeAndCoverActionResolution" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_opposingSkillId" ON dat."RangeAndCoverActionResolution" ("opposingSkillId");

CREATE INDEX IF NOT EXISTS "IDX_RangeAndCoverActionResolution_opposingAbilityId" ON dat."RangeAndCoverActionResolution" ("opposingAbilityId");

CREATE INDEX IF NOT EXISTS "IDX_FightAction_groupId" ON dat."FightAction" ("groupId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionTest_actionId" ON dat."FightActionTest" ("actionId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionTest_skillId" ON dat."FightActionTest" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionTest_abilityId" ON dat."FightActionTest" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_actionId" ON dat."FightActionResolution" ("actionId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_opposingActionId" ON dat."FightActionResolution" ("opposingActionId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_resolutionTypeId" ON dat."FightActionResolution" ("resolutionTypeId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_skillId" ON dat."FightActionResolution" ("skillId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_abilityId" ON dat."FightActionResolution" ("abilityId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_opposingSkillId" ON dat."FightActionResolution" ("opposingSkillId");

CREATE INDEX IF NOT EXISTS "IDX_FightActionResolution_opposingAbilityId" ON dat."FightActionResolution" ("opposingAbilityId");

CREATE INDEX IF NOT EXISTS "IDX_Resource_stockId" ON dat."Resource" ("stockId");

CREATE INDEX IF NOT EXISTS "IDX_Resource_resourceTypeId" ON dat."Resource" ("resourceTypeId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceCost_resourceId" ON dat."ResourceCost" ("resourceId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceModifier_resourceId" ON dat."ResourceModifier" ("resourceId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_resourceId" ON dat."ResourceMagicDetail" ("resourceId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_originModifierId" ON dat."ResourceMagicDetail" ("originModifierId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_areaOfEffectModifierId" ON dat."ResourceMagicDetail" ("areaOfEffectModifierId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_durationUnitId" ON dat."ResourceMagicDetail" ("durationUnitId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_areaOfEffectUnitId" ON dat."ResourceMagicDetail" ("areaOfEffectUnitId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_originId" ON dat."ResourceMagicDetail" ("originId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_durationId" ON dat."ResourceMagicDetail" ("durationId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_areaOfEffectId" ON dat."ResourceMagicDetail" ("areaOfEffectId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_element1Id" ON dat."ResourceMagicDetail" ("element1Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_element2Id" ON dat."ResourceMagicDetail" ("element2Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_element3Id" ON dat."ResourceMagicDetail" ("element3Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_impetus1Id" ON dat."ResourceMagicDetail" ("impetus1Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicDetail_impetus2Id" ON dat."ResourceMagicDetail" ("impetus2Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicObstacle_resourceId" ON dat."ResourceMagicObstacle" ("resourceId");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicObstacle_obstacleAbility1Id" ON dat."ResourceMagicObstacle" ("obstacleAbility1Id");

CREATE INDEX IF NOT EXISTS "IDX_ResourceMagicObstacle_obstacleAbility2Id" ON dat."ResourceMagicObstacle" ("obstacleAbility2Id");

CREATE INDEX IF NOT EXISTS "IDX_RulesetResource_rulesetId" ON dat."RulesetResource" ("rulesetId");

CREATE INDEX IF NOT EXISTS "IDX_TraitGrantsResource_resourceId" ON dat."TraitGrantsResource" ("resourceId");

CREATE INDEX IF NOT EXISTS "IDX_Question_attributeId1" ON dat."Question" ("attributeId1");

CREATE INDEX IF NOT EXISTS "IDX_Question_attributeId2" ON dat."Question" ("attributeId2");