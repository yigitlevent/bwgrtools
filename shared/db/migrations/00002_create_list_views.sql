CREATE OR REPLACE VIEW
  dat."RulesetsList" AS
SELECT
  r."id",
  r."name",
  r."isOfficial",
  r."isPublic",
  r."isExpansion",
  r."userId" AS "user",
  ARRAY (
    SELECT
      re."expansionId"
    FROM
      dat."RulesetExpansion" re
    WHERE
      r."id"::TEXT = re."rulesetId"::TEXT
  ) AS "expansionIds"
FROM
  dat."Ruleset" r;

CREATE OR REPLACE VIEW
  dat."AbilitiesList" AS
SELECT
  a."id",
  a."name",
  a."abilityTypeId",
  aty."name" AS "abilityType",
  a."hasShades",
  a."cycle",
  a."routine",
  a."difficult",
  a."challenging",
  ARRAY (
    SELECT
      art."traitId"
    FROM
      dat."AbilityRequiredTrait" art
    WHERE
      art."abilityId" = a."id"
    ORDER BY
      art."traitId"
  ) AS "requiredTraitIds"
FROM
  dat."Ability" a
  LEFT JOIN dat."AbilityType" aty ON aty."id" = a."abilityTypeId";

CREATE OR REPLACE VIEW
  dat."StocksList" AS
SELECT
  ARRAY (
    SELECT
      rs."rulesetId"
    FROM
      dat."RulesetStock" rs
    WHERE
      rs."stockId" = s."id"
  ) AS "rulesets",
  s."id",
  s."name",
  s."namePlural",
  s."stride",
  ARRAY (
    SELECT
      ss."id"
    FROM
      dat."Setting" ss
    WHERE
      ss."stockId" = s."id"
  ) AS "settingIds"
FROM
  dat."Stock" s;

CREATE OR REPLACE VIEW
  dat."SettingsList" AS
SELECT
  ARRAY (
    SELECT
      rs."rulesetId"
    FROM
      dat."RulesetSetting" rs
    WHERE
      rs."settingId" = s."id"
  ) AS "rulesets",
  s."id",
  s."name",
  s."nameShort",
  s."stockId",
  ss."name" AS "stockName",
  s."isSubsetting"
FROM
  dat."Setting" s
  LEFT JOIN dat."Stock" ss ON ss."id" = s."stockId";

CREATE OR REPLACE VIEW
  dat."SkillsList" AS
SELECT
  ARRAY (
    SELECT
      rs."rulesetId"
    FROM
      dat."RulesetSkill" rs
    WHERE
      rs."skillId" = s."id"
  ) AS "rulesets",
  s."id",
  s."name",
  s."stockId",
  sto."name" AS "stock",
  s."categoryId",
  sc."name" AS "category",
  s."typeId",
  sty."name" AS "type",
  ARRAY_REMOVE(ARRAY[s."root1Id", s."root2Id"], NULL::INTEGER) AS "rootIds",
  ARRAY_REMOVE(ARRAY[ab1."name", ab2."name"], NULL::CHARACTER VARYING) AS "roots",
  s."dontList",
  s."isMagical",
  s."isTraining",
  s."toolTypeId",
  stt."name" AS "tool",
  s."toolDescription",
  s."description",
  s."restrictionOnlyStockId",
  sto2."name" AS "restrictionOnlyStock",
  s."restrictionWhenBurning",
  s."restrictionAbilityId",
  ab3."name" AS "restrictionAbility",
  ARRAY (
    SELECT
      ss."subskillId"
    FROM
      dat."SkillSubskill" ss
    WHERE
      ss."skillId" = s."id"
  ) AS "subskillIds"
FROM
  dat."Skill" s
  LEFT JOIN dat."Stock" sto ON sto."id" = s."stockId"
  LEFT JOIN dat."Stock" sto2 ON sto2."id" = s."restrictionOnlyStockId"
  LEFT JOIN dat."SkillCategory" sc ON sc."id" = s."categoryId"
  LEFT JOIN dat."SkillType" sty ON sty."id" = s."typeId"
  LEFT JOIN dat."SkillToolType" stt ON stt."id" = s."toolTypeId"
  LEFT JOIN dat."Ability" ab1 ON ab1."id" = s."root1Id"
  LEFT JOIN dat."Ability" ab2 ON ab2."id" = s."root2Id"
  LEFT JOIN dat."Ability" ab3 ON ab3."id" = s."restrictionAbilityId";

CREATE OR REPLACE VIEW
  dat."TraitsList" AS
SELECT
  ARRAY (
    SELECT
      rt."rulesetId"
    FROM
      dat."RulesetTrait" rt
    WHERE
      rt."traitId" = t."id"
  ) AS "rulesets",
  t."id",
  t."name",
  t."stockId",
  sto."name" AS "stock",
  t."categoryId",
  tc."name" AS "category",
  t."typeId",
  tty."name" AS "type",
  t."cost",
  t."description",
  ARRAY (
    SELECT
      tcos."skillId"
    FROM
      dat."TraitCallOnSkill" tcos
    WHERE
      tcos."traitId" = t."id"
  ) AS "callOnSkillIds",
  ARRAY (
    SELECT
      tcoa."abilityId"
    FROM
      dat."TraitCallOnAbility" tcoa
    WHERE
      tcoa."traitId" = t."id"
  ) AS "callOnAbilityIds",
  ARRAY (
    SELECT
      tgr."resourceId"
    FROM
      dat."TraitGrantsResource" tgr
    WHERE
      tgr."traitId" = t."id"
    ORDER BY
      tgr."resourceId"
  ) AS "grantsResourceIds",
  ARRAY (
    SELECT
      tgr."minCost"
    FROM
      dat."TraitGrantsResource" tgr
    WHERE
      tgr."traitId" = t."id"
    ORDER BY
      tgr."resourceId"
  ) AS "grantsResourceMinCosts",
  (
    SELECT
      BOOL_AND(tgr."isChoice")
    FROM
      dat."TraitGrantsResource" tgr
    WHERE
      tgr."traitId" = t."id"
  ) AS "grantsResourceIsChoice"
FROM
  dat."Trait" t
  LEFT JOIN dat."Stock" sto ON sto."id" = t."stockId"
  LEFT JOIN dat."TraitCategory" tc ON tc."id" = t."categoryId"
  LEFT JOIN dat."TraitType" tty ON tty."id" = t."typeId";

CREATE OR REPLACE VIEW
  dat."LifepathsList" AS
SELECT
  ARRAY (
    SELECT
      rl."rulesetId"
    FROM
      dat."RulesetLifepath" rl
    WHERE
      rl."lifepathId" = l."id"
  ) AS "rulesets",
  l."id",
  l."name",
  l."stockId",
  sto."name" AS "stock",
  l."settingId",
  stt."name" AS "setting",
  ARRAY (
    SELECT
      ll."settingId"
    FROM
      dat."LifepathLead" ll
    WHERE
      ll."lifepathId" = l."id"
  ) AS "leadIds",
  ARRAY (
    SELECT
      ls."skillId"
    FROM
      dat."LifepathSkill" ls
    WHERE
      ls."lifepathId" = l."id"
    ORDER BY
      ls."index"
  ) AS "skillIds",
  ARRAY (
    SELECT
      lt."traitId"
    FROM
      dat."LifepathTrait" lt
    WHERE
      lt."lifepathId" = l."id"
    ORDER BY
      lt."index"
  ) AS "traitIds",
  l."born",
  l."years",
  l."eitherPool",
  l."mentalPool",
  l."physicalPool",
  l."generalSkillPool",
  l."lifepathSkillPool",
  l."traitPool",
  l."resourcePoints",
  l."isGspMultiplier",
  l."isLspMultiplier",
  l."isRpMultiplier",
  l."halfGspFromPrev",
  l."halfLspFromPrev",
  l."halfRpFromPrev",
  l."requirementText",
  lc."companionName",
  lc."givesSkills" AS "companionGivesSkills",
  lc."gspMultiplier" AS "companionGspMultiplier",
  lc."lspMultiplier" AS "companionLspMultiplier",
  lc."rpMultiplier" AS "companionRpMultiplier",
  ARRAY (
    SELECT
      lcs."companionSettingId"
    FROM
      dat."LifepathCompanionSetting" lcs
    WHERE
      lcs."lifepathId" = l."id"
  ) AS "companionSettingIds"
FROM
  dat."Lifepath" l
  LEFT JOIN dat."Stock" sto ON sto."id" = l."stockId"
  LEFT JOIN dat."Setting" stt ON stt."id" = l."settingId"
  LEFT JOIN dat."LifepathCompanion" lc ON lc."lifepathId" = l."id";

CREATE OR REPLACE VIEW
  dat."LifepathRequirementBlock" AS
SELECT
  lr."id",
  lr."lifepathId",
  lr."logicTypeId",
  lt."name" AS "logicType",
  lr."mustFulfill",
  lr."fulfillmentAmount"
FROM
  dat."LifepathRequirement" lr
  LEFT JOIN dat."LogicType" lt ON lr."logicTypeId" = lt."id";

CREATE OR REPLACE VIEW
  dat."LifepathRequirementBlockItem" AS
SELECT
  lri."requirementId",
  lri."requirementTypeId",
  rit."name" AS "requirementType",
  lri."forCompanion",
  lri."min",
  lri."max",
  lri."settingId",
  s."name" AS "setting",
  lri."lifepathId",
  l."name" AS "lifepath",
  lri."skillId",
  sk."name" AS "skill",
  lri."traitId",
  t."name" AS "trait",
  lri."attributeId",
  a."name" AS "attribute"
FROM
  dat."LifepathRequirementItem" lri
  LEFT JOIN dat."RequirementItemType" rit ON rit."id" = lri."requirementTypeId"
  LEFT JOIN dat."Setting" s ON s."id" = lri."settingId"
  LEFT JOIN dat."Lifepath" l ON l."id" = lri."lifepathId"
  LEFT JOIN dat."Skill" sk ON sk."id" = lri."skillId"
  LEFT JOIN dat."Trait" t ON t."id" = lri."traitId"
  LEFT JOIN dat."Ability" a ON a."id" = lri."attributeId";

CREATE OR REPLACE VIEW
  dat."ResourcesList" AS
SELECT
  ARRAY (
    SELECT
      rr."rulesetId"
    FROM
      dat."RulesetResource" rr
    WHERE
      rr."resourceId" = r."id"
  ) AS "rulesets",
  r."id",
  r."name",
  r."stockId",
  s."name" AS "stock",
  r."resourceTypeId",
  rt."name" AS "resourceType",
  r."description",
  r."variableCost",
  ARRAY (
    SELECT
      rc."cost"
    FROM
      dat."ResourceCost" rc
    WHERE
      r."id" = rc."resourceId"
    ORDER BY
      rc."id"
  ) AS "costs",
  ARRAY_REMOVE(
    ARRAY (
      SELECT
        rc."description"
      FROM
        dat."ResourceCost" rc
      WHERE
        r."id" = rc."resourceId"
      ORDER BY
        rc."id"
    ),
    NULL::CHARACTER VARYING
  ) AS "costDescriptions",
  ARRAY (
    SELECT
      rc."cost"
    FROM
      dat."ResourceModifier" rc
    WHERE
      r."id" = rc."resourceId"
    ORDER BY
      rc."id"
  ) AS "modifiers",
  ARRAY (
    SELECT
      rc."isPerCost"
    FROM
      dat."ResourceModifier" rc
    WHERE
      r."id" = rc."resourceId"
    ORDER BY
      rc."id"
  ) AS "modifierIsPerCosts",
  ARRAY (
    SELECT
      rc."description"
    FROM
      dat."ResourceModifier" rc
    WHERE
      r."id" = rc."resourceId"
    ORDER BY
      rc."id"
  ) AS "modifierDescriptions"
FROM
  dat."Resource" r
  LEFT JOIN dat."Stock" s ON s."id" = r."stockId"
  LEFT JOIN dat."ResourceType" rt ON rt."id" = r."resourceTypeId";

CREATE OR REPLACE VIEW
  dat."ResourceMagicDetailsList" AS
SELECT
  rmd."id",
  rmd."resourceId",
  rmd."originId",
  sof."name" AS "origin",
  rmd."durationId",
  sdf."name" AS "duration",
  rmd."areaOfEffectId",
  saf."name" AS "areaOfEffect",
  rmd."areaOfEffectUnitId",
  du."name" AS "areaOfEffectUnit",
  rmd."areaOfEffectModifierId",
  um."name" AS "areaOfEffectModifier",
  rmd."element1Id",
  sef1."name" AS "element1",
  rmd."element2Id",
  sef2."name" AS "element2",
  rmd."element3Id",
  sef3."name" AS "element3",
  rmd."impetus1Id",
  sif1."name" AS "impetus1",
  rmd."impetus2Id",
  sif2."name" AS "impetus2",
  rmd."actions",
  rmd."actionsMultiply"
FROM
  dat."ResourceMagicDetail" rmd
  LEFT JOIN dat."SpellOriginFacet" sof ON sof."id" = rmd."originId"
  LEFT JOIN dat."SpellDurationFacet" sdf ON sdf."id" = rmd."durationId"
  LEFT JOIN dat."SpellAreaOfEffectFacet" saf ON saf."id" = rmd."areaOfEffectId"
  LEFT JOIN dat."SpellElementFacet" sef1 ON sef1."id" = rmd."element1Id"
  LEFT JOIN dat."SpellElementFacet" sef2 ON sef2."id" = rmd."element2Id"
  LEFT JOIN dat."SpellElementFacet" sef3 ON sef3."id" = rmd."element3Id"
  LEFT JOIN dat."SpellImpetusFacet" sif1 ON sif1."id" = rmd."impetus1Id"
  LEFT JOIN dat."SpellImpetusFacet" sif2 ON sif2."id" = rmd."impetus2Id"
  LEFT JOIN dat."DistanceUnit" du ON du."id" = rmd."areaOfEffectUnitId"
  LEFT JOIN dat."UnitModifier" um ON um."id" = rmd."areaOfEffectModifierId";

CREATE OR REPLACE VIEW
  dat."ResourceMagicObstaclesList" AS
SELECT
  rmo."id",
  rmo."resourceId",
  rmo."obstacle",
  rmo."obstacleAbility1Id",
  a1."name" AS "obstacleAbility1",
  rmo."obstacleAbility2Id",
  a2."name" AS "obstacleAbility2",
  rmo."obstacleCaret",
  rmo."description"
FROM
  dat."ResourceMagicObstacle" rmo
  LEFT JOIN dat."Ability" a1 ON a1."id" = rmo."obstacleAbility1Id"
  LEFT JOIN dat."Ability" a2 ON a2."id" = rmo."obstacleAbility2Id";

CREATE OR REPLACE VIEW
  dat."DoWActionTestList" AS
SELECT
  a."actionId",
  a."skillId",
  s."name" AS "skill",
  a."abilityId",
  ab."name" AS "ability"
FROM
  dat."DuelOfWitsActionTest" a
  LEFT JOIN dat."Skill" s ON s."id" = a."skillId"
  LEFT JOIN dat."Ability" ab ON ab."id" = a."abilityId";

CREATE OR REPLACE VIEW
  dat."DoWActionResolutionList" AS
SELECT
  a."actionId",
  a."opposingActionId",
  oa."name" AS "opposingAction",
  a."resolutionTypeId",
  rt."name" AS "resolutionType",
  a."isAgainstSkill",
  a."obstacle",
  a."opposingModifier",
  a."skillId",
  s."name" AS "skill",
  a."abilityId",
  ab."name" AS "ability",
  a."opposingSkillId",
  os."name" AS "opposingSkill",
  a."opposingAbilityId",
  oab."name" AS "opposingAbility"
FROM
  dat."DuelOfWitsActionResolution" a
  LEFT JOIN dat."DuelOfWitsAction" oa ON oa."id" = a."opposingActionId"
  LEFT JOIN dat."ActionResolutionType" rt ON rt."id" = a."resolutionTypeId"
  LEFT JOIN dat."Skill" s ON s."id" = a."skillId"
  LEFT JOIN dat."Skill" os ON os."id" = a."opposingSkillId"
  LEFT JOIN dat."Ability" ab ON ab."id" = a."abilityId"
  LEFT JOIN dat."Ability" oab ON oab."id" = a."opposingAbilityId";

CREATE OR REPLACE VIEW
  dat."RangeAndCoverActionsList" AS
SELECT
  r."id",
  r."name",
  r."groupId",
  rg."name" AS "group",
  r."useFoRKs",
  r."useWeaponRangeAdvantage",
  r."usePositionAdvantage",
  r."useStrideAdvantage",
  r."isOpenEnded",
  r."effect",
  r."specialRestriction",
  r."specialAction",
  r."however"
FROM
  dat."RangeAndCoverAction" r
  LEFT JOIN dat."RangeAndCoverActionGroup" rg ON rg."id" = r."groupId";

CREATE OR REPLACE VIEW
  dat."RangeAndCoverActionResolutionList" AS
SELECT
  a."actionId",
  a."opposingActionId",
  oa."name" AS "opposingAction",
  a."resolutionTypeId",
  rt."name" AS "resolutionType",
  a."isAgainstSkill",
  a."obstacle",
  a."opposingModifier",
  a."skillId",
  s."name" AS "skill",
  a."abilityId",
  ab."name" AS "ability",
  a."opposingSkillId",
  os."name" AS "opposingSkill",
  a."opposingAbilityId",
  oab."name" AS "opposingAbility"
FROM
  dat."RangeAndCoverActionResolution" a
  LEFT JOIN dat."RangeAndCoverAction" oa ON oa."id" = a."opposingActionId"
  LEFT JOIN dat."ActionResolutionType" rt ON rt."id" = a."resolutionTypeId"
  LEFT JOIN dat."Skill" s ON s."id" = a."skillId"
  LEFT JOIN dat."Skill" os ON os."id" = a."opposingSkillId"
  LEFT JOIN dat."Ability" ab ON ab."id" = a."abilityId"
  LEFT JOIN dat."Ability" oab ON oab."id" = a."opposingAbilityId";

CREATE OR REPLACE VIEW
  dat."FightActionsList" AS
SELECT
  f."id",
  f."name",
  f."groupId",
  fg."name" AS "group",
  f."actionCost",
  f."testExtra",
  f."restrictions",
  f."effect",
  f."special",
  f."countsAsNoAction"
FROM
  dat."FightAction" f
  LEFT JOIN dat."FightActionGroup" fg ON fg."id" = f."groupId";

CREATE OR REPLACE VIEW
  dat."FightActionTestList" AS
SELECT
  a."actionId",
  a."skillId",
  s."name" AS "skill",
  a."abilityId",
  ab."name" AS "ability"
FROM
  dat."FightActionTest" a
  LEFT JOIN dat."Skill" s ON s."id" = a."skillId"
  LEFT JOIN dat."Ability" ab ON ab."id" = a."abilityId";

CREATE OR REPLACE VIEW
  dat."FightActionResolutionList" AS
SELECT
  a."actionId",
  a."opposingActionId",
  oa."name" AS "opposingAction",
  a."resolutionTypeId",
  rt."name" AS "resolutionType",
  a."isAgainstSkill",
  a."obstacle",
  a."opposingModifier",
  a."skillId",
  s."name" AS "skill",
  a."abilityId",
  ab."name" AS "ability",
  a."opposingSkillId",
  os."name" AS "opposingSkill",
  a."opposingAbilityId",
  oab."name" AS "opposingAbility"
FROM
  dat."FightActionResolution" a
  LEFT JOIN dat."FightAction" oa ON oa."id" = a."opposingActionId"
  LEFT JOIN dat."ActionResolutionType" rt ON rt."id" = a."resolutionTypeId"
  LEFT JOIN dat."Skill" s ON s."id" = a."skillId"
  LEFT JOIN dat."Skill" os ON os."id" = a."opposingSkillId"
  LEFT JOIN dat."Ability" ab ON ab."id" = a."abilityId"
  LEFT JOIN dat."Ability" oab ON oab."id" = a."opposingAbilityId";

CREATE OR REPLACE VIEW
  dat."PracticeList" AS
SELECT
  ROW_NUMBER() OVER (
    ORDER BY
      x."skillTypeId",
      x."abilityId"
  ) AS "id",
  x."abilityId",
  x."ability",
  x."skillTypeId",
  x."skillType",
  x."cycle",
  x."routine",
  x."difficult",
  x."challenging"
FROM
  (
    SELECT
      "Ability"."id" AS "abilityId",
      "Ability"."name" AS "ability",
      NULL::INTEGER AS "skillTypeId",
      NULL::CHARACTER VARYING AS "skillType",
      "Ability"."cycle",
      "Ability"."routine",
      "Ability"."difficult",
      "Ability"."challenging"
    FROM
      dat."Ability"
    WHERE
      "Ability"."cycle" IS NOT NULL
    UNION
    SELECT
      NULL::INTEGER AS "abilityId",
      NULL::CHARACTER VARYING AS "abilityName",
      "SkillType"."id" AS "skillTypeId",
      "SkillType"."name" AS "skillType",
      "SkillType"."cycle",
      "SkillType"."routine",
      "SkillType"."difficult",
      "SkillType"."challenging"
    FROM
      dat."SkillType"
    WHERE
      "SkillType"."cycle" IS NOT NULL
  ) x;

CREATE OR REPLACE VIEW
  dat."QuestionList" AS
SELECT
  a."id",
  a."name",
  a."question",
  a."attributeId1",
  att1."name" AS "attributeName1",
  a."attributeId2",
  att2."name" AS "attributeName2"
FROM
  dat."Question" a
  LEFT JOIN dat."Ability" att1 ON att1."id" = a."attributeId1"
  LEFT JOIN dat."Ability" att2 ON att2."id" = a."attributeId2";