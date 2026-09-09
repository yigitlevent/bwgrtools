import { PgPool } from "../../../shared/db/utils/pgPool";
import { Timed } from "../utils/logger";


export async function GetResources(rulesets: dat.RulesetId[]): Promise<Resource[]> {
  const convert = (re: dat.ResourcesList[], rmd: dat.ResourceMagicDetailsList[], rmo: dat.ResourceMagicObstaclesList[]): Resource[] => Timed("GetResources Conversion", () => {
    const r: Resource[] = re.map(v => {
      const res: Resource = {
        rulesets: v.rulesets,
        id: v.id!,
        name: v.name!,
        stock: [v.stockId, v.stock!],
        type: [v.resourceTypeId, v.resourceType!],
        costs: [],
        modifiers: []
      };

      if (v.variableCost === true) res.variableCost = true;
      if (v.description !== null) res.description = v.description;
      (v.costs ?? []).forEach((c, i) => res.costs.push([c, (v.costDescriptions ?? [])[i]]));
      (v.modifiers ?? []).forEach((c, i) => res.modifiers.push([c, (v.modifierIsPerCosts ?? [])[i], (v.modifierDescriptions ?? [])[i]]));

      const mDetails = rmd.find(a => a.resourceId === v.id);
      if (mDetails !== undefined) {
        const mdet: ResourceMagicDetails = {
          origin: [mDetails.originId, mDetails.origin!],
          duration: [mDetails.durationId, mDetails.duration!],
          areaOfEffect: [mDetails.areaOfEffectId, mDetails.areaOfEffect!],
          elements: [],
          impetus: [],
          actions: mDetails.actions,
          doActionsMultiply: mDetails.actionsMultiply
        };

        if (mDetails.areaOfEffectModifierId !== null || mDetails.areaOfEffectModifier !== null || mDetails.areaOfEffectUnitId !== null || mDetails.areaOfEffectUnit !== null) mdet.areaOfEffectDetails = {};
        if (mdet.areaOfEffectDetails !== undefined && mDetails.areaOfEffectUnitId !== null && mDetails.areaOfEffectUnit !== null) {
          mdet.areaOfEffectDetails.unit = [mDetails.areaOfEffectUnitId, mDetails.areaOfEffectUnit];
        }
        if (mdet.areaOfEffectDetails !== undefined && mDetails.areaOfEffectModifierId !== null && mDetails.areaOfEffectModifier !== null) {
          mdet.areaOfEffectDetails.modifier = [mDetails.areaOfEffectModifierId, mDetails.areaOfEffectModifier];
        }

        if (mDetails.element1Id !== null && mDetails.element1 !== null) mdet.elements.push([mDetails.element1Id, mDetails.element1]);
        if (mDetails.element2Id !== null && mDetails.element2 !== null) mdet.elements.push([mDetails.element2Id, mDetails.element2]);
        if (mDetails.element3Id !== null && mDetails.element3 !== null) mdet.elements.push([mDetails.element3Id, mDetails.element3]);
        if (mDetails.impetus1Id !== null && mDetails.impetus1 !== null) mdet.impetus.push([mDetails.impetus1Id, mDetails.impetus1]);
        if (mDetails.impetus2Id !== null && mDetails.impetus2 !== null) mdet.impetus.push([mDetails.impetus2Id, mDetails.impetus2]);

        const mObs = rmo.filter(a => a.resourceId === v.id);
        if (mObs.length > 0) {
          mdet.obstacleDetails = mObs.map(mo => {
            const obsDet: ResourceMagicObstacleDetails = {};
            // Was `if (mo.obstacle)`, which would silently drop a legitimate obstacle of 0 and fall through to the ability branch.
            if (mo.obstacle !== null) obsDet.obstacle = mo.obstacle;
            else if (mo.obstacleAbility1Id !== null || mo.obstacleAbility1 !== null || mo.obstacleAbility2Id !== null || mo.obstacleAbility2 !== null) {
              obsDet.abilities = [];
              if (mo.obstacleAbility1Id !== null && mo.obstacleAbility1 !== null) {
                obsDet.abilities.push([mo.obstacleAbility1Id, mo.obstacleAbility1]);
              }
              if (mo.obstacleAbility2Id !== null && mo.obstacleAbility2 !== null) {
                obsDet.abilities.push([mo.obstacleAbility2Id, mo.obstacleAbility2]);
              }
            }

            if (mo.obstacleCaret === true) obsDet.caret = mo.obstacleCaret;
            if (mo.description !== null) obsDet.description = mo.description;
            return obsDet;
          });
        }

        res.magical = mdet;
      }
      return res;
    });

    return r;
  });

  const query1 = "select * from dat.\"ResourcesList\" where \"rulesets\"::text[] && $1::text[];";
  const query2 = "select * from dat.\"ResourceMagicDetailsList\";";
  const query3 = "select * from dat.\"ResourceMagicObstaclesList\";";
  return Timed("GetResources Querying", () => Promise.all([
    PgPool.query<dat.ResourcesList>(query1, [rulesets]),
    PgPool.query<dat.ResourceMagicDetailsList>(query2),
    PgPool.query<dat.ResourceMagicObstaclesList>(query3)
  ])).then(result => convert(result[0].rows, result[1].rows, result[2].rows));
}
