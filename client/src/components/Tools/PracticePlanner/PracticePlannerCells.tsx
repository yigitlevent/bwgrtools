import { ActionIcon, Box, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { CirclePlus, CircleMinus, Trash2 } from "lucide-react";
import { DataTable } from "mantine-datatable";
import { useState } from "react";

import { PracticePlannerCellIcon } from "./PracticePlannerCellIcon";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";

import type { PracticeCell } from "../../../hooks/featureStores/usePracticePlannerStore";


function DeleteButton({ confirmText, onDelete }: { confirmText: string; onDelete: () => void; }): React.JSX.Element {
  const [confirming, setConfirming] = useState(false);

  return (
    <Popover opened={confirming} onChange={setConfirming} withArrow position="bottom" width={260}>
      <Popover.Target>
        <ActionIcon size="sm" variant="subtle" onClick={e => { e.stopPropagation(); setConfirming(true); }}><Trash2 size={16} /></ActionIcon>
      </Popover.Target>

      <Popover.Dropdown onClick={e => { e.stopPropagation(); }}>
        <Stack gap="xs">
          <Text size="sm">{confirmText}</Text>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" size="xs" onClick={() => { setConfirming(false); }}>Cancel</Button>

            <Button
              color="red"
              size="xs"
              onClick={() => {
                onDelete();
                setConfirming(false);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

function PracticesTable({ cell, cellIndex }: { cell: PracticeCell; cellIndex: number; }): React.JSX.Element {
  const { getPractice } = useRulesetStore();
  const { deletePractice } = usePracticePlannerStore();

  const records = cell.placed.map((placed, practiceIndex) => ({ ...placed, practiceIndex }));

  if (records.length === 0) {
    return (
      <Box p="xs">
        <Text size="sm" c="dimmed">No practices placed on this day.</Text>
      </Box>
    );
  }

  return (
    <DataTable
      ml="xl"
      mb="xs"
      striped
      columns={[
        {
          accessor: "name",
          title: "Name",
          width: 160
        },
        {
          accessor: "test",
          title: "Test",
          width: 200,
          render: placed => {
            const practice = getPractice(placed.practiceId);
            return `${String(practice.ability ? practice.ability[1] : practice.skillType?.[1])}, ${placed.testType}`;
          }
        },
        {
          accessor: "hours",
          title: "Hours",
          width: 100,
          render: placed => `${placed.hours.toString()}hr${placed.hours > 1 ? "s" : ""}`
        },
        {
          accessor: "actions",
          title: "",
          textAlign: "right",
          render: placed => (
            <DeleteButton confirmText="Delete this practice?" onDelete={() => { deletePractice(cellIndex, placed.practiceIndex); }} />
          )
        }
      ]}
      records={records}
      idAccessor="practiceIndex"
    />
  );
}

export function PracticePlannerCells({ setNotification }: { setNotification: (value: React.SetStateAction<React.JSX.Element | null>) => void; }): React.JSX.Element {
  const { cells, deleteCell, changeCellHour } = usePracticePlannerStore();

  const records = cells.map((cell, cellIndex) => ({ ...cell, cellIndex }));


  return (
    <Box>
      {cells.length > 0 ? (
        <DataTable
          columns={[
            {
              accessor: "day",
              title: "Day",
              width: 60,
              render: cell => `Day ${(cell.cellIndex + 1).toString()}`
            },
            {
              accessor: "hours",
              title: "Hours Filled",
              render: cell => (
                <Box mt={8}>
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
              )
            },
            {
              accessor: "actions",
              title: "",
              width: 120,
              textAlign: "right",
              render: cell => (
                <Group gap={4} justify="flex-end" wrap="nowrap">
                  <ActionIcon size="sm" variant="subtle" onClick={e => { e.stopPropagation(); changeCellHour(cell.cellIndex, -1, cells, setNotification); }}><CircleMinus size={16} /></ActionIcon>
                  <ActionIcon size="sm" variant="subtle" onClick={e => { e.stopPropagation(); changeCellHour(cell.cellIndex, 1, cells, setNotification); }}><CirclePlus size={16} /></ActionIcon>
                  <DeleteButton confirmText="Delete this day? Any practices placed in it will be lost." onDelete={() => { deleteCell(cell.cellIndex); }} />
                </Group>
              )
            }
          ]}
          records={records}
          idAccessor="cellIndex"
          rowExpansion={{
            content: ({ record }) => <PracticesTable cell={record} cellIndex={record.cellIndex} />
          }}
        />
      ) : null}
    </Box>
  );
}
