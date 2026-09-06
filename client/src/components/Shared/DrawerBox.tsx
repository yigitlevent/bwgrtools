import { Drawer, Title, Divider } from "@mantine/core";

import { useDrawerStore } from "../../hooks/useDrawerStore";


export function DrawerBox({ children, title, expanded }: { children: React.ReactNode; title: string; expanded: boolean; }): React.JSX.Element {
  const { toggleDrawer } = useDrawerStore();

  return (
    <Drawer
      position="right"
      opened={expanded}
      onClose={() => { toggleDrawer(); }}
      size="350px"
      withCloseButton={false}
    >
      <Title order={5} ta="center">{title}</Title>
      <Divider my="xs" />
      {children}
    </Drawer>
  );
}
