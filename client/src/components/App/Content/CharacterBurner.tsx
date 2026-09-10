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
import { useCharacterBurnerBasicsStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";


export function CharacterBurner(): React.JSX.Element {
  const { stock } = useCharacterBurnerBasicsStore();
  const { lifepaths, updateAvailableLifepaths } = useCharacterBurnerLifepathStore();

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

      {lifepaths.length > 0
        && (
          <Fragment>
            <Stats />
            <Skills openModal={openModal} />
            <Traits openModal={openModal} />
            <Attributes />
            <Resources openModal={openModal} />
            <Tolerances />
            <Beliefs />
            <Instincts />
          </Fragment>
        )}

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
