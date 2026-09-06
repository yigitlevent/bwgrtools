import { Box, Text } from "@mantine/core";
import { Fragment } from "react";

import { GetOrdinalSuffix } from "../../../utils/GetOrdinalSuffix";


function ResolveRequirementBlockItem(item: LifepathRequirementItem): string {
  const subject = item.forCompanion ? "Companion of this character" : "Character";

  if (item.isUnique) return "This lifepath cannot be selected twice.";
  else if (item.isSettingEntry) return "If character leads into this setting, this lifepath must be chosen as the first one in this setting.";
  else if (item.minLpIndex !== undefined) return `This can be selected as the ${GetOrdinalSuffix(item.minLpIndex)} lifepath or higher.`;
  else if (item.maxLpIndex !== undefined) return `This can be selected as the ${GetOrdinalSuffix(item.maxLpIndex)} lifepath or lower.`;
  else if (item.minYears !== undefined) return `Character must be at least ${item.minYears.toString()} years old.`;
  else if (item.maxYears !== undefined) return `Character must be at most ${item.maxYears.toString()} years old.`;
  else if (item.gender) return `Character must be a ${item.gender.toLowerCase()}.`;
  else if (item.oldestBy !== undefined) return `Character must be oldest in the party by ${item.oldestBy.toString()}.`;
  else if (item.attribute) {
    if (item.min) return `${subject} must have at least a ${item.min.toString()} of ${item.attribute[1]} attribute.`;
    else if (item.max) return `${subject} must have at most a ${item.max.toString()} of ${item.attribute[1]} attribute.`;
    else return `${subject} must have ${item.attribute[1]} attribute.`;
  }
  else if (item.skill) return `${subject} must have ${item.skill[1]} skill.`;
  else if (item.trait) return `${subject} must have ${item.trait[1]} trait.`;
  else if (item.lifepath) return `${subject} must have ${item.lifepath[1]} lifepath.`;
  else if (item.setting) return `${subject} must have ${item.setting[1]} setting.`;
  else throw new Error("Unidentified requirement block item");
}

function BlockTitle(logicType: string | null, fulfillmentAmount: number | null): string {
  const fa = fulfillmentAmount && fulfillmentAmount > 1 ? ` ${fulfillmentAmount.toString()} times` : "";

  switch (logicType) {
    case "AND":
      return `All of the following must be true${fa}:`;
    case "OR":
      return `At least one of the following must be true${fa}:`;
    case "NOT":
      return `None of the following must be true${fa}:`;
    default:
      throw new Error(`Unidentified requirement block logic type: ${logicType ?? "null"}`);
  }
}

function ResolveRequirementBlocks(requirementBlocks: LifepathRequirementBlock[]): React.JSX.Element {
  const parentLogic = requirementBlocks.every(v => v.mustFulfill) ? "AND" : "OR";

  const hasOneBlock = requirementBlocks.length === 1;

  return (
    <Fragment>
      {!hasOneBlock ? <Box>{BlockTitle(parentLogic, 1)}</Box> : null}

      {requirementBlocks.map((block, i) => (
        <Fragment key={i}>
          <Box ml={hasOneBlock ? 0 : "xs"}>{BlockTitle(block.logicType[1], block.fulfillmentAmount)}</Box>

          <Box ml={hasOneBlock ? 0 : "xs"}>
            {block.items.map((item, ii) => <Box key={ii} ml="xs">{ResolveRequirementBlockItem(item)}</Box>)}
          </Box>
        </Fragment>
      )
      )}
    </Fragment>
  );
}

export function LifepathRequirements({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element {
  return (
    <Fragment>
      <b>Requirements:</b>

      {lifepath.requirements ? (
        <Box>
          <Text size="xs">{ResolveRequirementBlocks(lifepath.requirements)}</Text>
        </Box>
      ) : null}

      {lifepath.requirementsText ? lifepath.requirementsText.split("<br>").map((text, textIndex) => <Text key={textIndex} size="sm">{text}</Text>) : null}
    </Fragment>
  );
}
