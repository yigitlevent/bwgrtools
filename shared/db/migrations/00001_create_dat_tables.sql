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
    "userId" UUID,
    PRIMARY KEY ("id"),
    UNIQUE ("id"),
    FOREIGN KEY ("userId") REFERENCES usr."User" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
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
    "requiredTraitId" INTEGER,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("abilityTypeId") REFERENCES dat."AbilityType" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID,
    FOREIGN KEY ("requiredTraitId") REFERENCES dat."Trait" ("id") MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID
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