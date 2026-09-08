import { Button, Grid, Select, Textarea, TextInput } from "@mantine/core";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { BuildCharacterBurnerSnapshot } from "../../../../hooks/featureStores/CharacterBurnerStores/characterBurnerSnapshot";
import { useCharacterBurnerAttributeStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerTraitStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { DownloadFile } from "../../../../utils/DownloadFile";


export function Basics({ openModal }: { openModal: (name: CharacterBurnerModals) => void; }): React.JSX.Element {
  const ruleset = useRulesetStore();
  const { name, stock, gender, concept, setName, setGender, setConcept, setStockAndReset } = useCharacterBurnerBasicsStore();
  const { getAge, lifepaths } = useCharacterBurnerLifepathStore();
  const { getStride } = useCharacterBurnerAttributeStore();
  const { traits } = useCharacterBurnerTraitStore();

  const lifepathsText = lifepaths.map(v => v.name).join(", ");

  const hasSpecialStock = (stock[1] === "Orc" && lifepaths.length > 4) || (stock[1] === "Great Wolf" && lifepaths.length > 0);

  const hasSpecialLifepath =
    lifepaths.some(lifepath => Array.isArray(lifepath.years) || (lifepath.companion?.givesSkills));

  const hasSpecialSkills =
    lifepaths.some(lifepath => (lifepath.skills ?? []).some(skillId => {
      const rulesetSkill = ruleset.getSkill(skillId);
      return rulesetSkill.name === "Any Skill" || rulesetSkill.name === "Any Wise" || rulesetSkill.subskillIds !== undefined;
    }));

  const hasSpecialResourceGrant =
    traits.filter(trait => trait.isOpen).some(trait => (ruleset.getTrait(trait.id).grantsResources ?? []).length >= 2);

  const hasSpecialAvarice = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Avarice");

  const hasSpecialStatPenalty =
    traits.filter(trait => trait.isOpen).some(trait => ["Crippled", "Frail", "Missing Limb"].includes(trait.name));

  const hasSpecialChildProdigy = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Child Prodigy");

  const hasSpecialDarlingOfCourt = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Darling of the Court");

  const hasSpecialEarToGround = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Ear to the Ground");

  const hasSpecialFamilyHeirloom = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Family Heirloom");

  const hasSpecialFeyBlood = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Fey Blood");

  const hasSpecialLessonOfOne = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Lesson of One");

  const hasSpecialLordOfAges = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Lord of Ages");

  const hasSpecialMourner = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Mourner");

  const hasSpecialCitadelVows =
    traits.filter(trait => trait.isOpen).some(trait => ["Servant of the Citadel", "Sworn to Protect"].includes(trait.name));

  const hasSpecialTaintedLegacy = traits.filter(trait => trait.isOpen).some(trait => trait.name === "Tainted Legacy");

  const disableSpecialOptionsModal =
    !hasSpecialStock && !hasSpecialLifepath && !hasSpecialSkills && !hasSpecialResourceGrant
    && !hasSpecialAvarice && !hasSpecialStatPenalty && !hasSpecialChildProdigy && !hasSpecialDarlingOfCourt
    && !hasSpecialEarToGround && !hasSpecialFamilyHeirloom && !hasSpecialFeyBlood && !hasSpecialLessonOfOne
    && !hasSpecialLordOfAges && !hasSpecialMourner && !hasSpecialCitadelVows && !hasSpecialTaintedLegacy;

  const exportChar = (): void => {
    const json = BuildCharacterBurnerSnapshot();

    const filename = `character-${json.basics.name.replaceAll(" ", "-")}.json`;
    const content = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    DownloadFile(filename, content);
  };

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
        <TextInput label="Stride" value={getStride()} variant="filled" disabled />
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
