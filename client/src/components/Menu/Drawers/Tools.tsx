import { Divider, Drawer, NavLink, Stack } from "@mantine/core";
import { Sparkles, Dices, Shapes, CalendarClock, Fingerprint, Users, Flame, Target, Coins, MessageCircle, Swords } from "lucide-react";
import { Fragment } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useDrawerStore } from "../../../hooks/useDrawerStore";


export function Tools({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const { toggleDrawer } = useDrawerStore();
  const location = useLocation();

  const getProps = (path: string): { size: number; color: string | undefined; } =>
    ({ size: 20, color: location.pathname === path ? "var(--mantine-primary-color-filled)" : undefined });

  const items: [string, string, React.JSX.Element][] = [
    ["Lifepaths List", "/lifepaths", <Fingerprint {...getProps("/lifepaths")} />],
    ["Skills List", "/skills", <Users {...getProps("/skills")} />],
    ["Traits List", "/traits", <Shapes {...getProps("/traits")} />],
    ["Resources List", "/resources", <Coins {...getProps("/resources")} />],
    ["Fight Planner", "/fightplanner", <Swords {...getProps("/fightplanner")} />],
    ["Range and Cover Planner", "/racplanner", <Target {...getProps("/racplanner")} />],
    ["Duel of Wits Planner", "/dowplanner", <MessageCircle {...getProps("/dowplanner")} />],
    ["Dice Roller", "/diceroller", <Dices {...getProps("/diceroller")} />],
    ["Practice Planner", "/practiceplanner", <CalendarClock {...getProps("/practiceplanner")} />],
    ["Character Burner", "/characterburner", <Flame {...getProps("/characterburner")} />],
    ["Magic Wheel", "/magicwheel", <Sparkles {...getProps("/magicwheel")} />],
    ["Magic Wheel Alt", "/magicwheelalt", <Sparkles {...getProps("/magicwheelalt")} />]
  ];

  return (
    <Drawer
      title="Tools"
      position="right"
      opened={expanded}
      onClose={() => { toggleDrawer(); }}
      size="500px"
      withCloseButton
      closeOnEscape
      closeOnClickOutside
    >

      <Stack gap={0}>
        {items.map((item, i) => {
          return (
            <Fragment key={i}>
              <NavLink
                component={RouterLink}
                to={item[1]}
                label={item[0]}
                active={location.pathname === item[1]}
                leftSection={item[2]}
                onClick={() => { toggleDrawer(); }}
              />

              {[3, 6, 9].includes(i) ? <Divider /> : null}
            </Fragment>
          );
        })}
      </Stack>
    </Drawer>
  );
}
