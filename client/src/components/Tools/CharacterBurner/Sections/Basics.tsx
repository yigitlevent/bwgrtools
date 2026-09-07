import { Button, Grid, Select, Textarea, TextInput } from "@mantine/core";
import { useCallback } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { DownloadFile } from "../../../../utils/DownloadFile";


export function Basics({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { name, stock, gender, concept, beliefs, instincts, setName, setGender, setConcept, setStockAndReset } = useCharacterBurnerBasicsStore();
  const { getAge, lifepaths } = useCharacterBurnerLifepathStore();
  const { stats } = useCharacterBurnerStatStore();
  const { attributes } = useCharacterBurnerAttributeStore();
  const { skills } = useCharacterBurnerSkillStore();
  const { traits } = useCharacterBurnerTraitStore();
  const { resources } = useCharacterBurnerResourceStore();
  const { special, questions, limits, traitEffects } = useCharacterBurnerMiscStore();

  const rulesetStock = ruleset.getStock(stock[0]);

  const lifepathsText = lifepaths.map(v => v.name).join(", ");

  const hasSpecialStock = (stock[1] === "Orc" && lifepaths.length > 4) || (stock[1] === "Great Wolf" && lifepaths.length > 0);

  const hasSpecialLifepath =
    lifepaths.some(lifepath => Array.isArray(lifepath.years) || (lifepath.companion?.givesSkills));

  const hasSpecialSkills =
    skills.filter(charSkill => { return charSkill.name === "Any Skill" || charSkill.name === "Any Wise" || ruleset.getSkill(charSkill.id).subskillIds !== undefined; }).length > 0;

  const disableSpecialOptionsModal = !hasSpecialStock && !hasSpecialLifepath && !hasSpecialSkills;

  const exportChar = useCallback(() => {
    const json: CharacterBurnerExportSnapshot = {
      basics: { name, concept, gender, stock, beliefs, instincts },
      lifepaths: { lifepaths },
      stats: { stats },
      skills: { skills: skills.items },
      traits: { traits: traits.items },
      attributes: { attributes: attributes.items },
      resources: { resources },
      misc: { special, questions, limits, traitEffects }
    };

    const filename = `character-${json.basics.name.replaceAll(" ", "-")}.json`;
    const content = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    DownloadFile(filename, content);
  }, [attributes.items, beliefs, concept, gender, instincts, lifepaths, limits, name, questions, resources, skills.items, special, stats, stock, traitEffects, traits.items]);

  return (
    <Grid columns={12} align="center" justify="center" mb="xl">
      <Grid.Col span={12}>
        <TextInput label="Name" value={name} onChange={e => { setName(e.target.value); }} variant="filled" />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput label="Concept" value={concept} onChange={e => { setConcept(e.target.value); }} variant="filled" />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          label="Stock"
          variant="filled"
          value={stock[0].toString()}
          data={ruleset.stocks.map(v => ({ value: v.id?.toString() ?? "", label: v.name ?? "" }))}
          onChange={v => {
            const found = ruleset.stocks.find(s => s.id?.toString() === v);
            if (found?.id) setStockAndReset([found.id, found.name ?? ""]);
          }}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          label="Gender"
          variant="filled"
          value={gender}
          data={["Male", "Female"]}
          onChange={v => { if (v) setGender(v); }}
          allowDeselect={false}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 2 }}>
        <TextInput label="Age" value={getAge()} variant="filled" disabled />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 2 }}>
        <TextInput label="Stride" value={rulesetStock.stride ?? 0} variant="filled" disabled />
      </Grid.Col>

      <Grid.Col span={12}>
        <Textarea label="Lifepaths" value={lifepathsText} variant="filled" disabled autosize minRows={1} />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={() => { openModal("lp"); }} fullWidth>Select</Button>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={() => { openModal("randLp"); }} fullWidth>Random</Button>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={() => { openModal("qu"); }} disabled={lifepaths.length === 0} fullWidth>Questions</Button>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={() => { openModal("so"); }} disabled={disableSpecialOptionsModal} fullWidth>Special</Button>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={() => { openModal("import"); }} fullWidth>Import</Button>
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Button variant="outline" size="md" onClick={exportChar} fullWidth>Export</Button>
      </Grid.Col>
    </Grid>
  );
}
