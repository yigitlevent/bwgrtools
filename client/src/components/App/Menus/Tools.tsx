import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { ClipboardList, Sparkles, Dices, Shapes, CalendarClock, Fingerprint, Users, Flame, Target, Coins, MessageCircle, Swords } from "lucide-react";
import { Fragment } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useMenuStore } from "../../../hooks/useMenuStore";


export function Tools({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const { toggleMenu } = useMenuStore();
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
    <Menu opened={expanded} onClose={() => { toggleMenu(); }} position="bottom-end" withArrow>
      <Menu.Target>
        <Tooltip color="gray" label="Tools">
          <ActionIcon size="lg" mt={16} p={4} variant="subtle" onClick={() => { toggleMenu("Tools"); }}>
            <ClipboardList />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        {items.map((item, i) => {
          return (
            <Fragment key={i}>
              <Menu.Item
                component={RouterLink}
                to={item[1]}
                leftSection={item[2]}
                onClick={() => { toggleMenu(); }}
                fw={location.pathname === item[1] ? 700 : undefined}
              >
                {item[0]}
              </Menu.Item>

              {[3, 6, 9].includes(i) ? <Menu.Divider /> : null}
            </Fragment>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
