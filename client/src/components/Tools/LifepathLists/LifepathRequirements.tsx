import { Box, Text } from "@mantine/core";
import { Fragment, memo } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { GetOrdinalSuffix } from "../../../utils/GetOrdinalSuffix";
import { PopoverLink } from "../../Shared/PopoverLink";


interface Resolvers {
  getSkill: (id: dat.SkillId) => Skill;
  getTrait: (id: dat.TraitId) => Trait;
  getLifepath: (id: dat.LifepathId) => Lifepath;
}

// A "part" is one piece of a rendered line: either static text, or a reference to a skill/trait/
// lifepath that should render as a popover link (matching LifepathSkills/LifepathTraits/the Lifepath
// Explorer). Building lines out of these instead of raw strings lets the same data drive both the
// rendered nodes and a plain-text key used to detect and collapse duplicate lines, without keeping
// two separate copies of the wording.
type Part =
  | { text: string; }
  | { skillId: dat.SkillId; name: string; }
  | { traitId: dat.TraitId; name: string; }
  | { lifepathId: dat.LifepathId; name: string; };

function T(text: string): Part {
  return { text };
}

function PartText(part: Part): string {
  return "text" in part ? part.text : part.name;
}

function PartsText(parts: Part[]): string {
  return parts.map(PartText).join("");
}

function PartNode(part: Part, key: number, resolvers: Resolvers): React.ReactNode {
  if ("text" in part) return part.text;
  if ("skillId" in part) return <PopoverLink key={key} data={resolvers.getSkill(part.skillId)} />;
  if ("traitId" in part) return <PopoverLink key={key} data={resolvers.getTrait(part.traitId)} />;
  return <PopoverLink key={key} data={resolvers.getLifepath(part.lifepathId)} />;
}

function RenderParts(parts: Part[], resolvers: Resolvers): React.ReactNode {
  return <Fragment>{parts.map((part, i) => <Fragment key={i}>{PartNode(part, i, resolvers)}</Fragment>)}</Fragment>;
}

type GroupableKind = "lifepath" | "skill" | "trait" | "setting";
const GroupableKindLabel: Record<GroupableKind, string> = { lifepath: "lifepath", skill: "skill", trait: "trait", setting: "setting" };

// The name-bearing part for a groupable item (lifepath/setting/skill/trait): a popover-linkable part
// for skills, traits, and lifepaths, plain text for settings (no setting popover exists yet).
function NamePart(item: LifepathRequirementItem, kind: GroupableKind): Part {
  if (kind === "skill" && item.skill !== undefined) return { skillId: item.skill[0], name: item.skill[1] };
  if (kind === "trait" && item.trait !== undefined) return { traitId: item.trait[0], name: item.trait[1] };
  if (kind === "lifepath" && item.lifepath !== undefined) return { lifepathId: item.lifepath[0], name: item.lifepath[1] };
  if (kind === "setting" && item.setting !== undefined) return T(item.setting[1]);
  return T("");
}

function ResolveRequirementItemParts(item: LifepathRequirementItem): Part[] {
  const subject = item.forCompanion === true ? "Companion of this character" : "Character";

  if (item.isUnique === true) return [T("This lifepath cannot be selected twice.")];
  if (item.isSettingEntry === true) return [T("If character leads into this setting, this lifepath must be chosen as the first one in this setting.")];
  if (item.minLpIndex !== undefined) return [T(`This can be selected as the ${GetOrdinalSuffix(item.minLpIndex)} lifepath or higher.`)];
  if (item.maxLpIndex !== undefined) return [T(`This can be selected as the ${GetOrdinalSuffix(item.maxLpIndex)} lifepath or lower.`)];
  if (item.minYears !== undefined) return [T(`Character must be at least ${item.minYears.toString()} years old.`)];
  if (item.maxYears !== undefined) return [T(`Character must be at most ${item.maxYears.toString()} years old.`)];
  if (item.gender !== undefined) return [T(`Character must be a ${item.gender.toLowerCase()}.`)];
  if (item.oldestBy !== undefined) return [T(`Character must be oldest in the party by ${item.oldestBy.toString()}.`)];
  if (item.attribute !== undefined) {
    if (item.min !== undefined) return [T(`${subject} must have at least a ${item.min.toString()} of ${item.attribute[1]} attribute.`)];
    if (item.max !== undefined) return [T(`${subject} must have at most a ${item.max.toString()} of ${item.attribute[1]} attribute.`)];
    return [T(`${subject} must have ${item.attribute[1]} attribute.`)];
  }
  if (item.skill !== undefined) return [T(`${subject} must have `), NamePart(item, "skill"), T(" skill.")];
  if (item.trait !== undefined) return [T(`${subject} must have `), NamePart(item, "trait"), T(" trait.")];
  if (item.lifepath !== undefined) return [T(`${subject} must have `), NamePart(item, "lifepath"), T(" lifepath.")];
  if (item.setting !== undefined) return [T(`${subject} must have ${item.setting[1]} setting.`)];
  throw new Error("Unidentified requirement block item");
}

function GetGroupableKind(item: LifepathRequirementItem): GroupableKind | undefined {
  const isPlain = item.isUnique !== true
    && item.isSettingEntry !== true
    && item.minLpIndex === undefined
    && item.maxLpIndex === undefined
    && item.minYears === undefined
    && item.maxYears === undefined
    && item.gender === undefined
    && item.oldestBy === undefined
    && item.attribute === undefined
    && item.min === undefined
    && item.max === undefined;

  if (!isPlain) return undefined;
  if (item.lifepath !== undefined) return "lifepath";
  if (item.skill !== undefined) return "skill";
  if (item.trait !== undefined) return "trait";
  if (item.setting !== undefined) return "setting";
  return undefined;
}

// Groups consecutive items of the same groupable kind (lifepath/skill/trait/setting) so an OR block
// mixing kinds (e.g. "must have lifepath X, Y or skill Z") can render as one sentence instead of one
// line per item.
function GroupConsecutiveItems(items: LifepathRequirementItem[]): { kind: GroupableKind; items: LifepathRequirementItem[]; }[] {
  const groups: { kind: GroupableKind; items: LifepathRequirementItem[]; }[] = [];
  let lastKind: GroupableKind | undefined;

  items.forEach(item => {
    const kind = GetGroupableKind(item);
    if (kind === undefined) return;

    if (kind === lastKind) groups[groups.length - 1].items.push(item);
    else groups.push({ kind, items: [item] });

    lastKind = kind;
  });

  return groups;
}

function DedupeNameParts(items: LifepathRequirementItem[], kind: GroupableKind): Part[] {
  const seen = new Set<string>();
  const parts: Part[] = [];

  items.forEach(item => {
    const part = NamePart(item, kind);
    const key = PartText(part);
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(part);
  });

  return parts;
}

// Interleaves parts with a plain-text separator.
function JoinParts(parts: Part[], separator: string): Part[] {
  const result: Part[] = [];
  parts.forEach((part, i) => {
    if (i > 0) result.push(T(separator));
    result.push(part);
  });
  return result;
}

function ResolveGroupClauseParts(group: { kind: GroupableKind; items: LifepathRequirementItem[]; }, joiner: "and" | "or"): Part[] {
  const nameParts = DedupeNameParts(group.items, group.kind);
  const label = GroupableKindLabel[group.kind];
  const plural = nameParts.length > 1 ? `${label}s` : label;

  if (nameParts.length === 1) return [...nameParts, T(` ${plural}`)];

  const connector = joiner === "and" ? "each of " : "one of ";
  return [T(connector), ...JoinParts(nameParts, ", "), T(` ${plural}`)];
}

// Joins clauses the way English lists items: "A" / "A and B" / "A, B, and C".
function JoinAsEnglishList(clauses: Part[][], joiner: "and" | "or"): Part[] {
  if (clauses.length === 1) return clauses[0];
  if (clauses.length === 2) return [...clauses[0], T(` ${joiner} `), ...clauses[1]];

  const result: Part[] = [];
  clauses.slice(0, -1).forEach((clause, i) => {
    if (i > 0) result.push(T(", "));
    result.push(...clause);
  });
  result.push(T(`, ${joiner} `), ...clauses[clauses.length - 1]);
  return result;
}

function GetGroupableJoiner(block: LifepathRequirementBlock): "and" | "or" | undefined {
  if (block.logicType[1] === "AND") return "and";
  if (block.logicType[1] === "OR") return "or";
  return undefined;
}

function IsFullyGroupableBlock(block: LifepathRequirementBlock): boolean {
  return block.items.length > 1 && GetGroupableJoiner(block) !== undefined && block.items.every(item => GetGroupableKind(item) !== undefined);
}

function ResolveGroupedBlockParts(block: LifepathRequirementBlock, joiner: "and" | "or"): Part[] {
  const subject = block.items[0].forCompanion === true ? "Companion of this character" : "Character";
  const groups = GroupConsecutiveItems(block.items);
  const clauses = groups.map(g => ResolveGroupClauseParts(g, joiner));

  return [T(`${subject} must have `), ...JoinAsEnglishList(clauses, joiner), T(".")];
}

function ResolveBlockTitleParts(block: LifepathRequirementBlock, isGroupedBlock: boolean): Part[] {
  if (isGroupedBlock) {
    const joiner = GetGroupableJoiner(block);
    if (joiner !== undefined) return ResolveGroupedBlockParts(block, joiner);
  }
  if (block.items.length === 1 && block.logicType[1] !== "NOT") return ResolveRequirementItemParts(block.items[0]);
  return [T(BlockTitle(block.logicType[1], block.fulfillmentAmount))];
}

function BlockTitle(logicType: string | null, fulfillmentAmount: number | null): string {
  const fa = fulfillmentAmount !== null && fulfillmentAmount > 1 ? ` ${fulfillmentAmount.toString()} times` : "";

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

function ResolveRequirementBlocks(requirementBlocks: LifepathRequirementBlock[], resolvers: Resolvers): React.JSX.Element {
  const parentLogic = requirementBlocks.every(v => v.mustFulfill === true) ? "AND" : "OR";

  const hasOneBlock = requirementBlocks.length === 1;

  const seenBlockText = new Set<string>();

  return (
    <Fragment>
      {!hasOneBlock ? <Box key="parent-logic">{BlockTitle(parentLogic, 1)}</Box> : null}

      {requirementBlocks.map((block, i) => {
        const isGroupedBlock = IsFullyGroupableBlock(block);
        const isCollapsed = isGroupedBlock || (block.items.length === 1 && block.logicType[1] !== "NOT");

        const titleParts = ResolveBlockTitleParts(block, isGroupedBlock);
        const itemPartsList = isCollapsed ? [] : block.items.map(item => ResolveRequirementItemParts(item));

        // Duplicate blocks (same requirement expressed twice, e.g. via multiple stock/setting
        // variants) render identical text -- skip repeats among sibling blocks.
        const blockText = [PartsText(titleParts), ...itemPartsList.map(PartsText)].join("\n");
        if (seenBlockText.has(blockText)) return null;
        seenBlockText.add(blockText);

        return (
          <Fragment key={i}>
            <Box ml={hasOneBlock ? 0 : "xs"}>{RenderParts(titleParts, resolvers)}</Box>

            {!isCollapsed ? (
              <Box ml={hasOneBlock ? 0 : "xs"}>
                {itemPartsList.map((parts, ii) => <Box key={ii} ml="xs">{RenderParts(parts, resolvers)}</Box>)}
              </Box>
            ) : null}
          </Fragment>
        );
      })}
    </Fragment>
  );
}

export const LifepathRequirements = memo(({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element => {
  const { getSkill, getTrait, getLifepath } = useRulesetStore();
  const resolvers: Resolvers = { getSkill, getTrait, getLifepath };

  return (
    <Box>
      <Text fw={700} mt={4}>Requirements:</Text>
      {lifepath.requirements !== undefined ? <Text component="div">{ResolveRequirementBlocks(lifepath.requirements, resolvers)}</Text> : null}
      {lifepath.requirementsText !== undefined && lifepath.requirementsText.length > 0 ? lifepath.requirementsText.split("<br>").map((text, textIndex) => <Text key={textIndex}>{text}</Text>) : null}
    </Box>
  );
});
