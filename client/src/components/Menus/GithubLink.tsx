import { Tooltip, ActionIcon } from "@mantine/core";

import { GithubIcon } from "../Shared/GithubIcon";


export function GithubLink(): React.JSX.Element {
  return (
    <Tooltip color="gray" label="GitHub">
      <ActionIcon
        size="lg"
        mt={16}
        p={4}
        variant="subtle"
        component="a"
        href="https://github.com/yigitlevent/bwgrtools"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GithubIcon />
      </ActionIcon>
    </Tooltip>
  );
}
