import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetLifepaths(rulesets: dat.RulesetId[]): Promise<Lifepath[]> {
  const convert = (l: dat.LifepathsList[], lr: dat.LifepathRequirementBlock[], lri: dat.LifepathRequirementBlockItem[]): Lifepath[] => Timed("GetLifepaths Conversion", () => {
    const r: Lifepath[] = l.map(v => {
      const lp: Lifepath = {
        rulesets: v.rulesets,
        id: v.id!,
        name: v.name,
        stock: [v.stockId, v.stock!],
        setting: [v.settingId!, v.setting!],
        years: (v.years ?? []).length === 1 ? (v.years ?? [])[0] : (v.years ?? []),
        pools: {
          eitherStatPool: v.eitherPool,
          mentalStatPool: v.mentalPool,
          physicalStatPool: v.physicalPool,
          generalSkillPool: v.generalSkillPool,
          lifepathSkillPool: v.lifepathSkillPool,
          traitPool: v.traitPool,
          resourcePoints: v.resourcePoints
        },
        flags: {
          isBorn: v.born,
          isGSPMultipliedByYear: v.isGspMultiplier,
          isLSPMultipliedByYear: v.isLspMultiplier,
          isRPMultipliedByYear: v.isRpMultiplier,
          getHalfGSPFromPrevLP: v.halfGspFromPrev,
          getHalfLSPFromPrevLP: v.halfLspFromPrev,
          getHalfRPFromPrevLP: v.halfRpFromPrev
        }
      };

      if (v.leadIds && v.leadIds.length > 0) lp.leads = v.leadIds;
      if (v.skillIds && v.skillIds.length > 0) lp.skills = v.skillIds;
      if (v.traitIds && v.traitIds.length > 0) lp.traits = v.traitIds;

      if (v.companionName && v.companionGivesSkills && v.companionSettingIds && v.companionSettingIds.length > 0) {
        lp.companion = {
          name: v.companionName,
          givesSkills: v.companionGivesSkills,
          settingIds: v.companionSettingIds
        };

        if (v.companionGspMultiplier && v.companionGspMultiplier > 0) lp.companion.inheritGSPMultiplier = v.companionGspMultiplier;
        if (v.companionLspMultiplier && v.companionLspMultiplier > 0) lp.companion.inheritLSPMultiplier = v.companionLspMultiplier;
        if (v.companionRpMultiplier && v.companionRpMultiplier > 0) lp.companion.inheritRPMultiplier = v.companionRpMultiplier;
      }

      if (v.requirementText) lp.requirementsText = v.requirementText;

      const reqBlocks = lr.filter(a => a.lifepathId === v.id);
      if (reqBlocks.length > 0) {
        lp.requirements = reqBlocks.map(vrb => {
          const rb: LifepathRequirementBlock = {
            logicType: [vrb.logicTypeId, vrb.logicType] as NamedTuple<dat.LogicTypeId>,
            mustFulfill: vrb.mustFulfill,
            fulfillmentAmount: vrb.fulfillmentAmount,
            items: []
          };

          const items: LifepathRequirementItem[] = lri
            .filter(a => a.requirementId === vrb.id)
            .map(vrbi => {
              const rbi = {
                logicType: [vrbi.requirementTypeId, vrbi.requirementType] as NamedTuple<dat.RequirementItemTypeId>
              };

              if (vrbi.requirementType === "UNIQUE") return { ...rbi, isUnique: true };
              else if (vrbi.requirementType === "SETTINGENTRY") return { ...rbi, isSettingEntry: true };
              else if (vrbi.requirementType === "LPINDEX") {
                if (vrbi.min) return { ...rbi, minLpIndex: vrbi.min };
                if (!vrbi.max) throw new Error("max value must be set for LPINDEX requirement type");
                return { ...rbi, maxLpIndex: vrbi.max };
              }
              else if (vrbi.requirementType === "YEARS") {
                if (vrbi.min) return { ...rbi, minYears: vrbi.min };
                if (!vrbi.max) throw new Error("max value must be set for YEARS requirement type");
                return { ...rbi, maxYears: vrbi.max };
              }
              else if (vrbi.requirementType === "FEMALE") return { ...rbi, gender: "Female" };
              else if (vrbi.requirementType === "MALE") return { ...rbi, gender: "Male" };
              else if (vrbi.requirementType === "OLDESTBY") {
                if (!vrbi.max) throw new Error("max value must be set for OLDESTBY requirement type");
                return { ...rbi, oldestBy: vrbi.max };
              }
              else if (vrbi.requirementType === "ATTRIBUTE" && vrbi.attributeId && vrbi.attribute) {
                const atr: LifepathRequirementItem = {
                  ...rbi,
                  attribute: [vrbi.attributeId, vrbi.attribute] as NamedTuple<dat.AbilityId>,
                  forCompanion: vrbi.forCompanion
                };
                if (vrbi.min) atr.min = vrbi.min;
                if (vrbi.max) atr.max = vrbi.max;
                return atr;
              }
              else if (vrbi.requirementType === "SKILL" && vrbi.skillId && vrbi.skill) {
                return { ...rbi, skill: [vrbi.skillId, vrbi.skill], forCompanion: vrbi.forCompanion };
              }
              else if (vrbi.requirementType === "TRAIT" && vrbi.traitId && vrbi.trait) {
                return { ...rbi, trait: [vrbi.traitId, vrbi.trait], forCompanion: vrbi.forCompanion };
              }
              else if (vrbi.requirementType === "LIFEPATH" && vrbi.lifepathId && vrbi.lifepath) {
                return { ...rbi, lifepath: [vrbi.lifepathId, vrbi.lifepath], forCompanion: vrbi.forCompanion };
              }
              else if (vrbi.requirementType === "SETTING" && vrbi.settingId && vrbi.setting) {
                return { ...rbi, setting: [vrbi.settingId, vrbi.setting], forCompanion: vrbi.forCompanion };
              }
              else throw new Error(`unidentified requirement block item type: ${vrbi.requirementType ?? "null"}`);
            });

          rb.items = items;

          return rb;
        });
      }

      return lp;
    });

    return r;
  });

  const query1 = "select * from dat.\"LifepathsList\" where \"rulesets\"::text[] && $1::text[];";
  const query2 = "select * from dat.\"LifepathRequirementBlock\";";
  const query3 = "select * from dat.\"LifepathRequirementBlockItem\";";
  return Timed("GetLifepaths Querying", () => Promise.all([
    PgPool.query<dat.LifepathsList>(query1, [rulesets]),
    PgPool.query<dat.LifepathRequirementBlock>(query2),
    PgPool.query<dat.LifepathRequirementBlockItem>(query3)
  ])).then(result => convert(result[0].rows, result[1].rows, result[2].rows));
}
