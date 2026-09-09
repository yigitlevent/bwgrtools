import { Box, Text } from "@mantine/core";
import { memo, useMemo } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


export const LifepathSkills = memo(({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element => {
  const { getSkill } = useRulesetStore();

  const hasGeneralSkill = lifepath.pools.generalSkillPool !== 0;
  const hasLifepathSkill = lifepath.pools.lifepathSkillPool !== 0;

  const generalSkill = useMemo(() => getSkill("General"), [getSkill]);

  const lifepathSkills = useMemo(() => lifepath.skills !== undefined ? lifepath.skills.map(skillId => getSkill(skillId)) : undefined, [lifepath.skills, getSkill]);

  return (
    <Box>
      <Text mr={4} fw={700} style={{ display: "inline-block" }}>Skills:</Text>

      {hasGeneralSkill ? (
        <Text mr={4} style={{ display: "inline-block" }}>
          {lifepath.pools.generalSkillPool}
          {(lifepath.pools.generalSkillPool ?? 0) > 1 ? "pts:" : "pt:"}
        </Text>
      ) : null}

      {hasGeneralSkill ? <PopoverLink data={generalSkill} /> : null}

      <Box mr={4} style={{ display: "inline-block" }}>
        {(hasGeneralSkill && hasLifepathSkill) ? ";" : null}
      </Box>

      {hasLifepathSkill ? (
        <Text mr={4} style={{ display: "inline-block" }}>
          {lifepath.pools.lifepathSkillPool}
          {(lifepath.pools.lifepathSkillPool ?? 0) > 1 ? "pts:" : "pt:"}
        </Text>
      ) : null}

      {hasLifepathSkill && lifepathSkills !== undefined ? lifepathSkills.map((skill, i) =>
        <PopoverLink key={skill.id} data={skill} hasComma={i < lifepathSkills.length - 1} />
      ) : null}
    </Box>
  );
});
