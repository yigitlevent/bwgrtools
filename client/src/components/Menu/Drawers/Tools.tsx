import { Divider, Stack } from "@mantine/core";
import { Sparkles, Dices, Shapes, CalendarClock, Fingerprint, Users, Flame, Target, Coins, MessageCircle, Swords } from "lucide-react";
import { Fragment } from "react";

import { RouteButton } from "./RouteButton";
import { DrawerBox } from "../../Shared/DrawerBox";

import type { LucideIcon } from "lucide-react";


export function Tools({ expanded }: { expanded: boolean; }): React.JSX.Element {
  const items: [string, string, LucideIcon][] = [
    ["Lifepaths List", "/lifepaths", Fingerprint],
    ["Skills List", "/skills", Users],
    ["Traits List", "/traits", Shapes],
    ["Resources List", "/resources", Coins],
    ["Practice Planner", "/practiceplanner", CalendarClock],
    ["Fight Planner", "/fightplanner", Swords],
    ["Range and Cover Planner", "/racplanner", Target],
    ["Duel of Wits Planner", "/dowplanner", MessageCircle],
    ["Dice Roller", "/diceroller", Dices],
    ["Character Burner", "/characterburner", Flame],
    ["Magic Wheel", "/magicwheel", Sparkles],
    ["Magic Wheel Alt", "/magicwheelalt", Sparkles]
  ];

  return (
    <DrawerBox title="Tools" expanded={expanded}>
      <Stack gap={0}>
        {items.map((item, i) => {
          return (
            <Fragment key={i}>
              <RouteButton title={item[0]} route={item[1]} Icon={item[2]} />
              {[3, 7].includes(i) ? <Divider /> : null}
            </Fragment>
          );
        })}
      </Stack>
    </DrawerBox>
  );
}
