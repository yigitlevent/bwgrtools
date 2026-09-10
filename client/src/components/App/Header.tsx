import { Group, Title } from "@mantine/core";

import { GithubLink } from "./Menus/GithubLink";
import { RulesetSelector } from "./Menus/RulesetSelector";
import { Tools } from "./Menus/Tools";
import { useMenuStore } from "../../hooks/useMenuStore";


export function Header(): React.JSX.Element {
  const { menu } = useMenuStore();

  return (
    <Group justify="space-between" style={{ height: "54px", minHeight: "54px" }}>
      <Title mt={8}>BWGR Tools</Title>

      <Group align="center" justify="flex-end">
        <GithubLink />
        <RulesetSelector expanded={menu === "Datasets"} />
        <Tools expanded={menu === "Tools"} />
      </Group>
    </Group>
  );
}
