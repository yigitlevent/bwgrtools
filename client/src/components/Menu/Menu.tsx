import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { ClipboardList, Database } from "lucide-react";

import { RulesetSelector } from "./Drawers/RulesetSelector";
import { Tools } from "./Drawers/Tools";
import { useDrawerStore } from "../../hooks/useDrawerStore";

import type { DrawerNames } from "../../hooks/useDrawerStore";


function DrawerIconButton({ title, icon, onClick }: { title: string; icon: React.JSX.Element; onClick: () => void; }): React.JSX.Element {
  return (
    <Tooltip color="gray" label={title}>
      <ActionIcon mt={16} p={4} variant="subtle" onClick={() => { onClick(); }}>{icon}</ActionIcon>
    </Tooltip>
  );
}

export function Menu(): React.JSX.Element {
  const { drawer } = useDrawerStore();
  const { toggleDrawer } = useDrawerStore();

  const buttons: { title: DrawerNames; icon: React.JSX.Element; authOnly: boolean; }[] = [
    { title: "Tools", icon: <ClipboardList />, authOnly: false },
    { title: "Datasets", icon: <Database />, authOnly: false }
  ];

  return (
    <Group
      align="center"
      justify="flex-end"
    >
      {buttons.reverse().map((v, i) => (
        <DrawerIconButton
          key={i}
          title={v.title}
          icon={v.icon}
          onClick={() => { toggleDrawer(v.title); }}
        />
      ))}

      <Tools expanded={drawer === "Tools"} />
      <RulesetSelector expanded={drawer === "Datasets"} />
    </Group>
  );
}
