import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetFightActions(): Promise<FightAction[]> {
  const convert = (a: dat.FightActionsList[], at: dat.FightActionTestList[], ar: dat.FightActionResolutionList[]): FightAction[] => Timed("GetFightActions Conversion", () => {
    const r: FightAction[] = a.map(v => {
      const act: FightAction = {
        id: v.id,
        name: v.name,
        group: [v.groupId!, v.group!],
        flags: {}
      };

      if (v.effect !== null) act.effect = v.effect;
      if (v.restrictions !== null) act.restrictions = v.restrictions;
      if (v.special !== null) act.special = v.special;
      if (v.testExtra !== null) act.testExtra = v.testExtra;
      if (v.actionCost !== null) act.actionCost = v.actionCost;
      if (v.countsAsNoAction !== null) act.flags.countsAsNoAction = v.countsAsNoAction;

      const t = at.filter(t => t.actionId === v.id);
      if (t.length > 0) {
        act.tests = {
          skills: [],
          abilities: []
        };

        t.forEach(test => {
          if (test.ability !== null && test.abilityId !== null) act.tests?.abilities.push([test.abilityId, test.ability]);
          if (test.skill !== null && test.skillId !== null) act.tests?.skills.push([test.skillId, test.skill]);
        });
      }

      const r = ar.filter(t => t.actionId === v.id);
      if (r.length > 0) {
        act.resolutions = [];

        r.forEach(res => {
          const actionRes: ActionResolution<dat.FightActionId> = {
            opposingAction: [res.opposingActionId!, res.opposingAction!],
            type: [res.resolutionTypeId!, res.resolutionType!]
          };

          if (res.isAgainstSkill !== null) actionRes.isAgainstSkill = res.isAgainstSkill;
          if (res.obstacle !== null) actionRes.obstacle = res.obstacle;
          if (res.opposingModifier !== null) actionRes.opposingModifier = res.opposingModifier;

          if (res.skillId !== null) actionRes.skill = [res.skillId, res.skill!];
          if (res.abilityId !== null) actionRes.ability = [res.abilityId, res.ability!];
          if (res.opposingSkillId !== null && res.opposingSkill !== null) actionRes.opposingSkill = [res.opposingSkillId, res.opposingSkill];
          if (res.opposingAbilityId !== null && res.opposingAbility !== null) actionRes.opposingAbility = [res.opposingAbilityId, res.opposingAbility];

          act.resolutions?.push(actionRes);
        });
      }

      return act;
    });

    return r;
  });

  const query1 = "select * from dat.\"FightActionsList\";";
  const query2 = "select * from dat.\"FightActionTestList\";";
  const query3 = "select * from dat.\"FightActionResolutionList\";";
  return Timed("GetFightActions Querying", () => Promise.all([
    PgPool.query<dat.FightActionsList>(query1),
    PgPool.query<dat.FightActionTestList>(query2),
    PgPool.query<dat.FightActionResolutionList>(query3)
  ])).then(result => convert(result[0].rows, result[1].rows, result[2].rows));
}
