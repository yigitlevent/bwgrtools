import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetRaCActions(): Promise<RaCAction[]> {
  const convert = (a: dat.RangeAndCoverActionsList[], ar: dat.RangeAndCoverActionResolutionList[]): RaCAction[] => Timed("GetRaCActions Conversion", () => {
    const r: RaCAction[] = a.map(v => {
      const act: RaCAction = {
        id: v.id,
        name: v.name,
        group: [v.groupId!, v.group!],
        flags: {}
      };

      if (v.effect) act.effect = v.effect;
      if (v.specialRestriction) act.specialRestriction = v.specialRestriction;
      if (v.specialAction) act.specialAction = v.specialAction;
      if (v.however) act.however = v.however;

      if (v.useFoRKs) act.flags.useFoRKs = v.useFoRKs;
      if (v.useWeaponRangeAdvantage) act.flags.useWeaponRangeAdvantage = v.useWeaponRangeAdvantage;
      if (v.usePositionAdvantage) act.flags.usePositionAdvantage = v.usePositionAdvantage;
      if (v.useStrideAdvantage) act.flags.useStrideAdvantage = v.useStrideAdvantage;
      if (v.isOpenEnded) act.flags.isOpenEnded = v.isOpenEnded;

      const r = ar.filter(t => t.actionId === v.id);
      if (r.length > 0) {
        act.resolutions = [];

        r.forEach(res => {
          const actionRes: ActionResolution<dat.RangeAndCoverActionId> = {
            opposingAction: [res.opposingActionId!, res.opposingAction!],
            type: [res.resolutionTypeId!, res.resolutionType!]
          };

          if (res.isAgainstSkill) actionRes.isAgainstSkill = res.isAgainstSkill;
          if (res.obstacle) actionRes.obstacle = res.obstacle;
          if (res.opposingModifier) actionRes.opposingModifier = res.opposingModifier;

          if (res.skillId !== null) actionRes.skill = [res.skillId, res.skill!];
          if (res.abilityId !== null) actionRes.ability = [res.abilityId, res.ability!];
          if (res.opposingSkillId !== null && res.opposingSkill) actionRes.opposingSkill = [res.opposingSkillId, res.opposingSkill];
          if (res.opposingAbilityId !== null && res.opposingAbility) actionRes.opposingAbility = [res.opposingAbilityId, res.opposingAbility];

          act.resolutions?.push(actionRes);
        });
      }

      return act;
    });

    return r;
  });

  const query1 = "select * from dat.\"RangeAndCoverActionsList\";";
  const query2 = "select * from dat.\"RangeAndCoverActionResolutionList\";";
  return Timed("GetRaCActions Querying", () => Promise.all([
    PgPool.query<dat.RangeAndCoverActionsList>(query1),
    PgPool.query<dat.RangeAndCoverActionResolutionList>(query2)
  ])).then(result => convert(result[0].rows, result[1].rows));
}
