import { Stepper, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useCharacterBurnerAttributeStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerAttribute";
import { useCharacterBurnerBasicsStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerBasics";
import { useCharacterBurnerLifepathStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerLifepath";
import { useCharacterBurnerMiscStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerMisc";
import { useCharacterBurnerResourceStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerResource";
import { useCharacterBurnerSkillStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSkill";
import { useCharacterBurnerStatStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerStat";
import { useCharacterBurnerTraitStore } from "../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerTrait";
import { DrawerBox } from "../../Shared/DrawerBox";
import { StepIcon } from "../../Shared/StepIcon";


const ChecklistSteps: { label: string; description: string[]; }[] = [
  {
    label: "Write character concept",
    description: [
      "Concepts should abide by two guidelines: They should be feasible for the genre/style of your group, and they should be tied into the situation at hand."
    ]
  },
  {
    label: "Choose lifepaths",
    description: [
      "Choose lifepaths by clicking the 'Add Lifepath' menu. You can also use random lifepaths menu to get a list of random lifepaths.",
      "At this stage, you should also head into the 'Special Lifepaths' and/or 'Special Skills' menus if they are enabled."
    ]
  },
  {
    label: "Check stock specifics",
    description: [
      "Head into 'Stock Specific' menu to determine all the required stock specific information."
    ]
  },
  {
    label: "Spend stat points",
    description: [
      "Spend your physical, mental, and either pools to their respective stats."
    ]
  },
  {
    label: "Spend skill points",
    description: [
      "Spend your general and lifepath skill points on skill exponents or opening skills. You may also use 'Add General Skill' menu to add new skills that can be opened and advanced with general points."
    ]
  },
  {
    label: "Spend trait points",
    description: [
      "Spend your trait points on opening traits. You may also use 'Add General Trait' menu to add new trait that can be opened."
    ]
  },
  {
    label: "Answer questions",
    description: [
      "Use 'Answer Questions' menu to give the answers about your character's past.",
      "You may also shift the shade of some of the attributes that have an exponent 6 or more."
    ]
  },
  {
    label: "Spend resource points",
    description: [
      "Spend your resource points on buying resources.",
      "Fill up the description of these resources as you wish. You can edit the descriptions after adding resources, but not the cost or modifiers."
    ]
  },
  {
    label: "Design Beliefs and Instincts",
    description: [
      "Fill all the enabled beliefs and instincts. Usually, you need to write three beliefs and three instincts, but some traits may modify this."
    ]
  },
  {
    label: "Name the character",
    description: [
      "Name the character and you are finished with the character burning."
    ]
  }
];

export function Checklist({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const { stock, concept, name, beliefs, instincts } = useCharacterBurnerBasicsStore();
  const { lifepaths, getEitherPool, getMentalPool, getPhysicalPool } = useCharacterBurnerLifepathStore();
  const { stats } = useCharacterBurnerStatStore();
  const { attributes } = useCharacterBurnerAttributeStore();
  const { skills, getSkillPools } = useCharacterBurnerSkillStore();
  const { traits, getTraitPools } = useCharacterBurnerTraitStore();
  const { resources, getResourcePools } = useCharacterBurnerResourceStore();
  const { special, questions, limits } = useCharacterBurnerMiscStore();

  const location = useLocation();

  // TODO: also check special lifepath and skill stuff

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const remainingStatPoints = getEitherPool().remaining + getMentalPool().remaining + getPhysicalPool().remaining;
    const skillPoints = getSkillPools();
    const remainingSkillPoints = skillPoints.general.remaining + skillPoints.lifepath.remaining;
    const remainingTraitPoints = getTraitPools().remaining;
    const remainingResourcePoints = getResourcePools().remaining;

    const stockSpecificFulfilled =
      !(stock[1] === "Orc" && special.stock.brutalLifeTraits.length < lifepaths.length - 5)
      && !(stock[1] === "Great Wolf" && special.stock.huntingGround === undefined);

    if (concept === "") setActiveStep(0);
    else if (lifepaths.length === 0) setActiveStep(1);
    else if (!stockSpecificFulfilled) setActiveStep(2);
    else if (remainingStatPoints !== 0) setActiveStep(3);
    else if (remainingSkillPoints !== 0) setActiveStep(4);
    else if (remainingTraitPoints !== 0) setActiveStep(5);
    else if (questions.some(q => q.answer)) setActiveStep(6);
    else if (remainingResourcePoints !== 0) setActiveStep(7);
    else if ((beliefs.filter(v => v.belief !== "").length !== limits.beliefs || instincts.filter(v => v.instinct !== "").length !== limits.instincts)) setActiveStep(8);
    else if (name === "") setActiveStep(9);
    else setActiveStep(10);
  }, [beliefs, concept, instincts, lifepaths, limits, name, questions, special, stock, stats, attributes, skills, traits, resources,
    getEitherPool, getMentalPool, getPhysicalPool, getResourcePools, getSkillPools, getTraitPools]);

  return (
    <DrawerBox title="Checklist" expanded={expanded}>
      {location.pathname === "/characterburner" ? (
        <Stepper active={activeStep} orientation="vertical" mt="md">
          {ChecklistSteps.map((step, i) => (
            <Stepper.Step
              key={i}
              icon={<StepIcon active={activeStep === i} completed={activeStep > i} />}
              label={<Text size="sm" mb="4px" c={activeStep !== i ? "gray" : undefined}>{step.label}</Text>}
            >
              {step.description.map((desc, ii) => (
                <Text key={ii} size="xs" c={activeStep !== i ? "gray" : undefined}>
                  {activeStep === i ? desc : ""}
                </Text>
              ))}
            </Stepper.Step>
          ))}
        </Stepper>
      ) : (
        <Text>
          Checklist is only available when using the Character Burner tool.
        </Text>
      )}
    </DrawerBox>
  );
}
