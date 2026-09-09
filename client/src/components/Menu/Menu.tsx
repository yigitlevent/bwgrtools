import { Group } from "@mantine/core";

import { RulesetSelector } from "./Drawers/RulesetSelector";
import { Tools } from "./Drawers/Tools";
import { useDrawerStore } from "../../hooks/useDrawerStore";


export function Menu(): React.JSX.Element {
  const { drawer } = useDrawerStore();

  return (
    <Group align="center" justify="flex-end">
      <RulesetSelector expanded={drawer === "Datasets"} />
      <Tools expanded={drawer === "Tools"} />
    </Group>
  );
}
