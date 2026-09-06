import { Box, Paper } from "@mantine/core";
import { Fragment } from "react";

import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { PopoverLink } from "../../Shared/PopoverLink";


export function LifepathSkills({ lifepath }: { lifepath: Lifepath; }): React.JSX.Element {
  const { getSkill } = useRulesetStore();

  const hasGeneralSkill = lifepath.pools.generalSkillPool !== 0;
  const hasLifepathSkill = lifepath.pools.lifepathSkillPool !== 0;

  const generalSkill = getSkill("General");

  const lifepathSkills =
    lifepath.skills ? lifepath.skills.map(skillId => getSkill(skillId)) : undefined;

  return (
    <Fragment>
      <b>Skills: </b>

      {hasGeneralSkill ? (
        <span>
          {lifepath.pools.generalSkillPool}
          {(lifepath.pools.generalSkillPool ?? 0) > 1 ? "pts: " : "pt: "}
        </span>
      ) : null}

      {hasGeneralSkill ? (
        <Paper shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "0 0 0 2px", width: "max-content", display: "inline-block" }}>
          <PopoverLink data={generalSkill} />
        </Paper>
      ) : null}

      <Box style={{ display: "inline-block", marginRight: 6 }}>
        {(hasGeneralSkill && hasLifepathSkill) ? "; " : null}
      </Box>

      {hasLifepathSkill ? (
        <span>
          {lifepath.pools.lifepathSkillPool}
          {(lifepath.pools.lifepathSkillPool ?? 0) > 1 ? "pts: " : "pt: "}
        </span>
      ) : null}

      {hasLifepathSkill && lifepathSkills ? lifepathSkills.map((skill, i) => {
        return (
          <Paper key={i} shadow="sm" style={{ cursor: "pointer", padding: "0 4px", margin: "0 0 0 2px", width: "max-content", display: "inline-block" }}>
            <PopoverLink data={skill} />
          </Paper>
        );
      }) : null}
    </Fragment>
  );
}
