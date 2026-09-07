import { Title } from "@mantine/core";
import { Fragment, useEffect, useState } from "react";

import { GeneralSkillModal } from "./Modals/GeneralSkillModal";
import { GeneralTraitModal } from "./Modals/GeneralTraitModal";
import { LifepathSelectionModal } from "./Modals/LifepathSelectionModal";
import { QuestionsModal } from "./Modals/QuestionsModal";
import { RandomLifepathsModal } from "./Modals/RandomLifepathsModal";
import { ResourceSelectionModal } from "./Modals/ResourceSelectionModal";
import { SpecialOptionsModal } from "./Modals/SpecialOptionsModal";
import { Attributes } from "./Sections/Attributes";
import { Basics } from "./Sections/Basics";
import { Beliefs } from "./Sections/Beliefs";
import { Instincts } from "./Sections/Instincts";
import { Resources } from "./Sections/Resources";
import { Skills } from "./Sections/Skills";
import { Stats } from "./Sections/Stats";
import { Tolerances } from "./Sections/Tolerances";
import { Traits } from "./Sections/Traits";
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

  const openModal = (name: CharacterBurnerModals): void => { setCurrentModal(name); };
  const closeModals = (): void => { setCurrentModal(null); };

  useEffect(() => {
    updateAvailableLifepaths();
  }, [updateAvailableLifepaths, stock]);

  return (
    <Fragment>
      <Title order={3}>Character Burner</Title>
      <Basics openModal={openModal} />
      <Stats />
      {skills.length > 0 ? <Skills openModal={openModal} /> : null}
      {traits.length > 0 ? <Traits openModal={openModal} /> : null}
      {attributes.length > 0 ? <Attributes /> : null}

      {lifepaths.length > 0 ? (
        <Fragment>
          <Resources openModal={openModal} />
          <Tolerances />
          <Beliefs />
          <Instincts />
        </Fragment>
      ) : null}

      <LifepathSelectionModal isOpen={currentModal === "lp"} close={closeModals} />
      <RandomLifepathsModal isOpen={currentModal === "randLp"} close={closeModals} />
      <ResourceSelectionModal isOpen={currentModal === "re"} close={closeModals} />
      <GeneralSkillModal isOpen={currentModal === "geSk"} close={closeModals} />
      <GeneralTraitModal isOpen={currentModal === "geTr"} close={closeModals} />
      <QuestionsModal isOpen={currentModal === "qu"} close={closeModals} />
      <SpecialOptionsModal isOpen={currentModal === "so"} close={closeModals} />
    </Fragment>
  );
}
