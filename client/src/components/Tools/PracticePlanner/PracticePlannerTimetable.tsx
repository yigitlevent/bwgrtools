import { Button, Divider, Group, Stack, Text, TextInput } from "@mantine/core";
import { Square } from "lucide-react";
import { Fragment } from "react";

import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";


export function PracticePlannerTimetable(): React.JSX.Element {
  const { days, hours, cells, changeDays, changeHours, addCells } = usePracticePlannerStore();

  return (
    <Fragment>
      <Divider label="Timetable" mt="10px" />

      <Group justify="center" gap="md" my="16px" wrap="nowrap">
        <TextInput
          label="Number of Days"
          inputMode="numeric"
          pattern="[0-9]*"
          value={days}
          onChange={e => { changeDays(e.target.value); }}
          variant="filled"
        />

        <TextInput
          label="Hours per Day"
          inputMode="numeric"
          pattern="[0-9]*"
          value={hours}
          onChange={e => { changeHours(e.target.value); }}
          variant="filled"
        />

        <Button variant="outline" onClick={() => { addCells(days, hours); }}>Add Days</Button>
      </Group>

      <Group wrap="nowrap" justify="flex-start" align="flex-start" style={{ maxWidth: "100%", overflow: "auto", paddingBottom: "16px" }}>
        {cells.map((cell, cellIndex) => (
          <Stack key={cellIndex} gap={0} style={{ paddingTop: "32px", marginRight: "-8px" }}>
            <Text
              size="xs"
              style={{ display: "block", transform: "rotate(-90deg)", margin: "0 -48px -8px 8px", height: "20px", width: "60px", transformOrigin: "left center" }}
            >
              {cellIndex === 0 || cellIndex === cells.length - 1 || (cellIndex + 1) % 5 === 0 ? `Day ${(cellIndex + 1).toString()}` : ""}
            </Text>

            {[...Array<number>(cell.maxHours)].map((_, ii) => {
              const filled = (cell.placed.length > 0 ? cell.placed.map(v => v.hours).reduce((pv, cv) => pv + cv) : 0);
              return (
                <Square
                  key={ii}
                  size={16}
                  color={filled >= cell.maxHours ? "var(--mantine-color-red-6)" : ii >= filled ? "var(--mantine-color-green-6)" : "var(--mantine-color-yellow-6)"}
                  style={{ display: "block", marginBottom: -4 }}
                />
              );
            })}
          </Stack>
        ))}
      </Group>
    </Fragment>
  );
}
