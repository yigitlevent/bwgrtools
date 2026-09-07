import { ActionIcon, Box, Divider, Paper, Stack, Text } from "@mantine/core";
import { CirclePlus, CircleMinus, Trash2 } from "lucide-react";
import { Fragment } from "react";

import { PracticePlannerCellIcon } from "./PracticePlannerCellIcon";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";

import type { PracticeCell, PracticePlaced } from "../../../hooks/featureStores/usePracticePlannerStore";


function Placed({ placed, practiceIndex, cellIndex }: { placed: PracticePlaced; practiceIndex: number; cellIndex: number; }): React.JSX.Element {
  const { getPractice } = useRulesetStore();
  const { deletePractice } = usePracticePlannerStore();

  const practice = getPractice(placed.practiceId);

  const text = `${String(practice.ability ? practice.ability[1] : practice.skillType?.[1])}, ${placed.testType}, ${placed.hours.toString()}hr${placed.hours > 1 ? "s" : ""}`;

  return (
    <Paper shadow="sm" style={{ padding: "2px 4px" }}>
      <Text style={{ display: "inline", marginRight: "8px" }}>{placed.name}</Text>
      <Text size="xs">{text}</Text>
      <ActionIcon size="sm" variant="subtle" style={{ float: "right" }} onClick={() => { deletePractice(cellIndex, practiceIndex); }}><Trash2 size={16} /></ActionIcon>
    </Paper>
  );
}

function PracticePlannerCell({ cell, cellIndex, setNotification }: { cell: PracticeCell; cellIndex: number; setNotification: (value: React.SetStateAction<React.JSX.Element | null>) => void; }): React.JSX.Element {
  const { cells, deleteCell, changeCellHour } = usePracticePlannerStore();

  return (
    <Paper shadow="md" style={{ padding: "5px 10px", margin: "10px" }}>
      <Stack gap={0}>
        <Text>
          Day
          {" "}
          {cellIndex + 1}
          <ActionIcon size="sm" variant="subtle" style={{ float: "right" }} onClick={() => { deleteCell(cellIndex); }}><Trash2 size={16} /></ActionIcon>
          <ActionIcon size="sm" variant="subtle" style={{ float: "right" }} onClick={() => { changeCellHour(cellIndex, -1, cells, setNotification); }}><CircleMinus size={16} /></ActionIcon>
          <ActionIcon size="sm" variant="subtle" style={{ float: "right" }} onClick={() => { changeCellHour(cellIndex, 1, cells, setNotification); }}><CirclePlus size={16} /></ActionIcon>
        </Text>

        <Box style={{ margin: "0 5px" }}>
          {[...Array<number>(cell.maxHours)].map((_, ii) => {
            const filled = (cell.placed.length > 0 ? cell.placed.map(v => v.hours).reduce((pv, cv) => pv + cv) : 0);
            return (
              <PracticePlannerCellIcon
                key={ii}
                isDayFull={cell.maxHours === filled ? "full" : filled > 0 ? "partial" : "empty"}
                isCellFull={ii < filled}
              />
            );
          })}
        </Box>

        {cell.placed.length > 0 ? <Divider /> : null}

        <Stack gap="xs" style={{ margin: "6px 0" }}>
          {cell.placed.map((placed, practiceIndex) => <Placed key={practiceIndex} placed={placed} practiceIndex={practiceIndex} cellIndex={cellIndex} />)}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function PracticePlannerCells({ setNotification }: { setNotification: (value: React.SetStateAction<React.JSX.Element | null>) => void; }): React.JSX.Element {
  const { cells } = usePracticePlannerStore();

  return (
    <Fragment>
      {cells.length > 0 ? <Divider label="Timetable Details" mt="10px" /> : null}

      <Stack>
        {cells.map((cell, cellIndex) => <PracticePlannerCell key={cellIndex} cell={cell} cellIndex={cellIndex} setNotification={setNotification} />)}
      </Stack>
    </Fragment>
  );
}
