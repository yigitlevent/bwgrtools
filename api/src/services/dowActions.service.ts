import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetDoWActions(): Promise<DoWAction[]> {
  const convert = (a: dat.DuelOfWitsAction[], at: dat.DoWActionTestList[], ar: dat.DoWActionResolutionList[]): DoWAction[] => Timed("GetDoWActions Conversion", () => {
    const r: DoWAction[] = a.map(v => {
      const act: DoWAction = {
        id: v.id,
        name: v.name
      };

      if (v.effect) act.effect = v.effect;
      if (v.speakingThePart) act.speakingThePart = v.speakingThePart;
      if (v.special) act.special = v.special;

      const t = at.filter(t => t.actionId === v.id);
      if (t.length > 0) {
        act.tests = {
          skills: [],
          abilities: []
        };

        t.forEach(test => {
          if (test.ability && test.abilityId !== null) act.tests?.abilities.push([test.abilityId, test.ability]);
          if (test.skill && test.skillId !== null) act.tests?.skills.push([test.skillId, test.skill]);
        });
      }

      const r = ar.filter(t => t.actionId === v.id);
      if (r.length > 0) {
        act.resolutions = [];

        r.forEach(res => {
          const actionRes: ActionResolution<dat.DuelOfWitsActionId> = {
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

  const query1 = "select * from dat.\"DuelOfWitsAction\";";
  const query2 = "select * from dat.\"DoWActionTestList\";";
  const query3 = "select * from dat.\"DoWActionResolutionList\";";
  return Timed("GetDoWActions Querying", () => Promise.all([
    PgPool.query<dat.DuelOfWitsAction>(query1),
    PgPool.query<dat.DoWActionTestList>(query2),
    PgPool.query<dat.DoWActionResolutionList>(query3)
  ])).then(result => convert(result[0].rows, result[1].rows, result[2].rows));
}
