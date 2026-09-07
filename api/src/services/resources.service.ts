import { PgPool } from "../../../shared/db/utils/pgPool";
import { Logger } from "../utils/logger";


export async function GetResources(rulesets: dat.RulesetId[]): Promise<Resource[]> {
  const convert = (re: dat.ResourcesList[], rmd: dat.ResourceMagicDetailsList[], rmo: dat.ResourceMagicObstaclesList[]): Resource[] => {
    const log = new Logger("GetResources Conversion");

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

      if (v.variableCost) res.variableCost = true;
      if (v.description) res.description = v.description;
      (v.costs ?? []).forEach((c, i) => res.costs.push([c, (v.costDescriptions ?? [])[i]]));
      (v.modifiers ?? []).forEach((c, i) => res.modifiers.push([c, (v.modifierIsPerCosts ?? [])[i], (v.modifierDescriptions ?? [])[i]]));

      const mDetails = rmd.find(a => a.resourceId === v.id);
      if (mDetails) {
        const mdet: ResourceMagicDetails = {
          origin: [mDetails.originId, mDetails.origin!],
          duration: [mDetails.durationId, mDetails.duration!],
          areaOfEffect: [mDetails.areaOfEffectId, mDetails.areaOfEffect!],
          elements: [],
          impetus: [],
          actions: mDetails.actions,
          doActionsMultiply: mDetails.actionsMultiply
        };

        if (mDetails.areaOfEffectModifierId !== null || mDetails.areaOfEffectModifier || mDetails.areaOfEffectUnitId !== null || mDetails.areaOfEffectUnit) mdet.areaOfEffectDetails = {};
        if (mdet.areaOfEffectDetails && mDetails.areaOfEffectUnitId !== null && mDetails.areaOfEffectUnit) {
          mdet.areaOfEffectDetails.unit = [mDetails.areaOfEffectUnitId, mDetails.areaOfEffectUnit];
        }
        if (mdet.areaOfEffectDetails && mDetails.areaOfEffectModifierId !== null && mDetails.areaOfEffectModifier) {
          mdet.areaOfEffectDetails.modifier = [mDetails.areaOfEffectModifierId, mDetails.areaOfEffectModifier];
        }

        if (mDetails.element1) mdet.elements.push([mDetails.element1Id, mDetails.element1]);
        if (mDetails.element2Id !== null && mDetails.element2) mdet.elements.push([mDetails.element2Id, mDetails.element2]);
        if (mDetails.element3Id !== null && mDetails.element3) mdet.elements.push([mDetails.element3Id, mDetails.element3]);
        if (mDetails.impetus1) mdet.impetus.push([mDetails.impetus1Id, mDetails.impetus1]);
        if (mDetails.impetus2Id !== null && mDetails.impetus2) mdet.impetus.push([mDetails.impetus2Id, mDetails.impetus2]);

        const mObs = rmo.filter(a => a.resourceId === v.id);
        if (mObs.length > 0) {
          mdet.obstacleDetails = mObs.map(mo => {
            const obsDet: ResourceMagicObstacleDetails = {};
            if (mo.obstacle) obsDet.obstacle = mo.obstacle;
            else if (mo.obstacleAbility1Id !== null || mo.obstacleAbility1 !== null || mo.obstacleAbility2Id !== null || mo.obstacleAbility2 !== null) {
              obsDet.abilities = [];
              if (mo.obstacleAbility1Id !== null && mo.obstacleAbility1 !== null) {
                obsDet.abilities.push([mo.obstacleAbility1Id, mo.obstacleAbility1]);
              }
              if (mo.obstacleAbility2Id !== null && mo.obstacleAbility2 !== null) {
                obsDet.abilities.push([mo.obstacleAbility2Id, mo.obstacleAbility2]);
              }
            }

            if (mo.obstacleCaret) obsDet.caret = mo.obstacleCaret;
            if (mo.description !== null) obsDet.description = mo.description;
            return obsDet;
          });
        }

        res.magical = mdet;
      }
      return res;
    });

    log.end();
    return r;
  };

  const log = new Logger("GetResources Querying");
  const query1 = `select * from dat."ResourcesList" where "rulesets"::text[] && ARRAY['${rulesets.join("','")}'];`;
  const query2 = "select * from dat.\"ResourceMagicDetailsList\";";
  const query3 = "select * from dat.\"ResourceMagicObstaclesList\";";
  return Promise.all([
    PgPool.query<dat.ResourcesList>(query1),
    PgPool.query<dat.ResourceMagicDetailsList>(query2),
    PgPool.query<dat.ResourceMagicObstaclesList>(query3)
  ]).then(result => {
    log.end();
    const res = convert(result[0].rows, result[1].rows, result[2].rows);
    return res;
  });
}
