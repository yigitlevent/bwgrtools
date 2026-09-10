import { Badge, Group, Title } from "@mantine/core";
import { Fragment, useEffect, useState } from "react";

import { Checklist } from "./CharacterBurner/Checklist";
import { GeneralSkillModal } from "./CharacterBurner/Modals/GeneralSkillModal";
import { GeneralTraitModal } from "./CharacterBurner/Modals/GeneralTraitModal";
import { ImportCharacterModal } from "./CharacterBurner/Modals/ImportCharacterModal";
import { LifepathSelectionModal } from "./CharacterBurner/Modals/LifepathSelectionModal";
import { QuestionsModal } from "./CharacterBurner/Modals/QuestionsModal";
import { RandomLifepathsModal } from "./CharacterBurner/Modals/RandomLifepathsModal";
import { ResourceSelectionModal } from "./CharacterBurner/Modals/ResourceSelectionModal";
import { RestoreCharacterModal } from "./CharacterBurner/Modals/RestoreCharacterModal";
import { SpecialOptionsModal } from "./CharacterBurner/Modals/SpecialOptionsModal";
import { Attributes } from "./CharacterBurner/Sections/Attributes";
import { Basics } from "./CharacterBurner/Sections/Basics";
import { Beliefs } from "./CharacterBurner/Sections/Beliefs";
import { Instincts } from "./CharacterBurner/Sections/Instincts";
import { Resources } from "./CharacterBurner/Sections/Resources";
import { Skills } from "./CharacterBurner/Sections/Skills";
import { Stats } from "./CharacterBurner/Sections/Stats";
import { Tolerances } from "./CharacterBurner/Sections/Tolerances";
import { Traits } from "./CharacterBurner/Sections/Traits";
import { IsRulesetMismatch, ReadPersistedCharacter, SubscribeCharacterBurnerAutosave } from "../../../hooks/featureStores/CharacterBurnerStores/characterBurnerAutosave";
import { useCharacterBurnerAttributeStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerSkillStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerTraitStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";


export function CharacterBurner(): React.JSX.Element {
  const { stock } = useCharacterBurnerBasicsStore();
  const { lifepaths, updateAvailableLifepaths } = useCharacterBurnerLifepathStore();
  const { skills } = useCharacterBurnerSkillStore();
  const { traits } = useCharacterBurnerTraitStore();
  const { attributes } = useCharacterBurnerAttributeStore();

  const [currentModal, setCurrentModal] = useState<CharacterBurnerModals | null>(null);
  const [restorePayload, setRestorePayload] = useState<CharacterBurnerAutosavePayload | null>(() => ReadPersistedCharacter());
  const [autosaveFailed, setAutosaveFailed] = useState(false);

  const openModal = (name: CharacterBurnerModals): void => { setCurrentModal(name); };
  const closeModals = (): void => { setCurrentModal(null); };

  useEffect(() => {
    updateAvailableLifepaths();
  }, [updateAvailableLifepaths, stock]);

  useEffect(() => SubscribeCharacterBurnerAutosave(setAutosaveFailed), []);

  return (
    <Fragment>
      <Group align="center" gap="sm">
        <Title order={3}>Character Burner</Title>

        {autosaveFailed
          ? <Badge variant="light" color="yellow">Autosave unavailable - export to avoid losing progress</Badge>
          : <Badge variant="light" color="green">Autosaved</Badge>}
      </Group>

      {restorePayload !== null
        ? (
          <RestoreCharacterModal
            payload={restorePayload}
            mismatch={IsRulesetMismatch(restorePayload)}
            close={() => { setRestorePayload(null); }}
          />
        )
        : null}

      <Basics openModal={openModal} />
      <Stats />

      {skills.length > 0
        ? <Skills openModal={openModal} />
        : null}

      {traits.length > 0
        ? <Traits openModal={openModal} />
        : null}

      {attributes.length > 0
        ? <Attributes />
        : null}

      {lifepaths.length > 0
        ? (
          <Fragment>
            <Resources openModal={openModal} />
            <Tolerances />
            <Beliefs />
            <Instincts />
          </Fragment>
        )
        : null}

      <Checklist />
      <LifepathSelectionModal isOpen={currentModal === "lp"} close={closeModals} />
      <RandomLifepathsModal isOpen={currentModal === "randLp"} close={closeModals} />
      <ResourceSelectionModal isOpen={currentModal === "re"} close={closeModals} />
      <GeneralSkillModal isOpen={currentModal === "geSk"} close={closeModals} />
      <GeneralTraitModal isOpen={currentModal === "geTr"} close={closeModals} />
      <QuestionsModal isOpen={currentModal === "qu"} close={closeModals} />
      <SpecialOptionsModal isOpen={currentModal === "so"} close={closeModals} />
      <ImportCharacterModal isOpen={currentModal === "import"} close={closeModals} />
    </Fragment>
  );
}
