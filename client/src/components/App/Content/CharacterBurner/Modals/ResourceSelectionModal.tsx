import { Button, Checkbox, Divider, Grid, Modal, Radio, Select, Text, TextInput, Title } from "@mantine/core";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { useRulesetStore } from "../../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerBasicsStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerResourceStore } from "../../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { GetSelectedModifiers, GetTotalCost, ResetCosts, type SelectedCost } from "../../../../../logic/resourceCost";
import { GetObstacleString } from "../../../../../utils/GetMagicalObstacleString";
import { AbilityButton } from "../../../../Shared/AbilityButton";


export function ResourceSelectionModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const { stock } = useCharacterBurnerBasicsStore();
  const ruleset = useRulesetStore();
  const { getResourcePools, addResource } = useCharacterBurnerResourceStore();

  const resourcePool = getResourcePools();

  const rulesetResource = ruleset.resources.find(x => x.stock[0] === stock[0]);
  if (rulesetResource === undefined) throw new Error("No resources found for the selected stock.");

  const [resource, setResource] = useState<Resource>(rulesetResource);
  const [resourceDesc, setResourceDesc] = useState("");
  const [costs, setCosts] = useState<SelectedCost>();
  const [numberOfWeapons, setNumberOfWeapons] = useState(1);

  const getStockResources = useCallback(() => {
    return ruleset.resources.filter(x => x.stock[0] === stock[0]);
  }, [ruleset.resources, stock]);

  const resetCosts = useCallback(() => {
    setCosts(ResetCosts(resource));
  }, [resource]);

  const modifyResource = useCallback((resource: Resource) => {
    const res = getStockResources().find(v => v.id === resource.id);
    if (res !== undefined) {
      setResourceDesc("");
      setResource(res);
      resetCosts();
    }
  }, [getStockResources, resetCosts]);

  const changeCost = useCallback((cost: number) => {
    if (costs === undefined) return;
    const newCosts = structuredClone(costs);
    newCosts.baseCost = cost > 0 ? cost : 0;
    setCosts(newCosts);
  }, [costs]);

  const changeModifier = useCallback((name: string) => {
    if (costs === undefined) return;
    const newCosts = structuredClone(costs);
    newCosts.modifiers[name] = { ...newCosts.modifiers[name], selected: !newCosts.modifiers[name].selected };
    setCosts(newCosts);
  }, [costs]);

  const totalCost = useMemo(() => costs !== undefined ? GetTotalCost(costs, GetSelectedModifiers(costs), numberOfWeapons) : undefined, [costs, numberOfWeapons]);
  const canAffordResource = totalCost !== undefined && totalCost <= resourcePool.remaining;

  const createResource = useCallback(() => {
    if (costs !== undefined && totalCost !== undefined && canAffordResource && resource.type[0] !== null) {
      const modifiers = GetSelectedModifiers(costs);
      addResource({
        id: resource.id,
        name: resource.name,
        type: [resource.type[0], resource.type[1]],
        modifiers: modifiers.map(v => v[0]),
        cost: totalCost,
        description: resourceDesc
      });
      close();
    }
  }, [addResource, canAffordResource, close, costs, resource.id, resource.name, resource.type, resourceDesc, totalCost]);

  useEffect(() => {
    resetCosts();
  }, [resource, resetCosts, numberOfWeapons]);

  const sortedStockResources = useMemo(() => getStockResources().sort((a, b) => {
    const typeComparison = a.type[1].localeCompare(b.type[1]);
    return typeComparison !== 0 ? typeComparison : a.name.localeCompare(b.name);
  }), [getStockResources]);

  const groupedResourceData = useMemo(() => {
    const groups = new Map<string, { value: string; label: string; }[]>();
    sortedStockResources.forEach(v => {
      const groupName = v.type[1];
      const items = groups.get(groupName) ?? [];
      items.push({ value: v.id.toString(), label: v.name });
      groups.set(groupName, items);
    });
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }, [sortedStockResources]);

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={6} gap="xs" align="center">
        <Grid.Col span={6}>
          <Select
            label="Chosen Resource"
            value={resource.id.toString()}
            data={groupedResourceData}
            onChange={v => {
              const found = sortedStockResources.find(r => r.id.toString() === v);
              if (found !== undefined) modifyResource(found);
            }}
            allowDeselect={false}
            searchable
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Divider
            label={(
              <Fragment>
                Type:
                {resource.type[1]}
              </Fragment>
            )}
          />
        </Grid.Col>

        {resource.costs.length === 1
          ? (
            <Grid.Col span={{ base: 6, sm: 2 }}>
              <Text size="sm">
                Cost:
                {resource.costs[0][1]}
              </Text>
            </Grid.Col>
          )
          : null}

        {resource.magical?.obstacleDetails !== undefined
          ? (
            <Fragment>
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Obstacle:
                  {GetObstacleString(resource, resource.magical.obstacleDetails)}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Actions:
                  {resource.magical.actions}
                </Text>
              </Grid.Col>
            </Fragment>
          )
          : null}

        {resource.magical !== undefined
          ? (
            <Fragment>
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Origin:
                  {resource.magical.origin[1]}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Element:
                  {resource.magical.elements.map(x => x[1]).join("/")}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Duration:
                  {resource.magical.duration[1]}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 4 }}>
                <Text size="sm">
                  Area of Effect:
                  {resource.magical.areaOfEffect[1]}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Text size="sm">
                  Impetus:
                  {resource.magical.impetus.map(x => x[1]).join("/")}
                </Text>
              </Grid.Col>
            </Fragment>
          )
          : null}

        {resource.description !== undefined
          ? (
            <Grid.Col span={6}>
              {resource.description.split("<br>").map((v, i) => {
                if (resource.magical !== undefined && i === 0) return <Text key={i} size="sm" fw={600}>{v}</Text>;
                return <Text key={i} size="sm">{v}</Text>;
              })}
            </Grid.Col>
          )
          : null}

        {costs !== undefined && resource.costs.length > 1
          ? (
            <Grid.Col span={6}>
              <Title order={6}>Cost</Title>

              <Radio.Group value={costs.baseCost.toString()} onChange={v => { changeCost(parseInt(v)); }}>
                {resource.costs.map((v, i) => {
                  if (v[1] === null || v[1] === "") return null;
                  return <Radio key={i} label={`${v[1]} (${v[0].toString()}rps)`} value={(v[0]).toString()} />;
                })}
              </Radio.Group>
            </Grid.Col>
          )
          : null}

        {costs !== undefined && resource.variableCost === true
          ? (
            <Grid.Col span={6}>
              <Text style={{ display: "inline", marginRight: 8 }}>Cost</Text>

              <AbilityButton
                onClick={e => { e.preventDefault(); changeCost(costs.baseCost + 1); }}
                onContextMenu={e => { e.preventDefault(); changeCost(costs.baseCost - 1); }}
              >
                {costs.baseCost}
              </AbilityButton>
            </Grid.Col>
          )
          : null}

        {costs !== undefined
          ? (
            <Fragment>
              <Grid.Col span={6}>
                <Title order={6}>Modifiers</Title>
              </Grid.Col>

              {resource.modifiers.map((v, i) =>
                (v[2] in costs.modifiers)
                  ? (
                    <Grid.Col key={i} span={2}>
                      <Checkbox
                        label={`${v[2]} (${v[0].toString()}rps)`}
                        checked={costs.modifiers[v[2]].selected}
                        onChange={() => { changeModifier(v[2]); }}
                      />
                    </Grid.Col>
                  )
                  : null
              )}
            </Fragment>
          )
          : null}

        {costs !== undefined && resource.modifiers.some(v => typeof v[1] === "string")
          ? (
            <Grid.Col span={6}>
              <Title order={6}>Number of Weapons</Title>

              <AbilityButton
                onClick={e => { e.preventDefault(); setNumberOfWeapons(v => v + 1); }}
                onContextMenu={e => { e.preventDefault(); setNumberOfWeapons(v => v - 1); }}
              >
                {numberOfWeapons}
              </AbilityButton>
            </Grid.Col>
          )
          : null}

        <Grid.Col span={6}>
          <TextInput label="Add description (optional)" variant="filled" value={resourceDesc} onChange={e => { setResourceDesc(e.target.value); }} />
        </Grid.Col>

        {costs !== undefined
          ? (
            <Grid.Col span={6}>
              <Text my="sm" c={totalCost !== undefined && totalCost > resourcePool.remaining ? "red" : undefined}>
                Total Cost:
                {totalCost}
                {" "}
                (Remaining:
                {" "}
                {resourcePool.remaining}
                )
              </Text>
            </Grid.Col>
          )
          : null}

        <Grid.Col span={6}>
          <Button variant="light" size="compact-md" onClick={() => { createResource(); }} disabled={!canAffordResource}>Add Resource</Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
