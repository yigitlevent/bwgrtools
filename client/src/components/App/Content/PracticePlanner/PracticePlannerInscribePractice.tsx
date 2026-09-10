import { Box, Button, Grid, Modal, RangeSlider, Select, Text, TextInput } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";

import { useRulesetStore } from "../../../../hooks/apiStores/useRulesetStore";
import { usePracticePlannerStore } from "../../../../hooks/featureStores/usePracticePlannerStore";


interface PracticePlannerInscribePracticeProps {
  isOpen: boolean;
  close: () => void;
  setNotification: React.Dispatch<React.SetStateAction<React.JSX.Element | null>>;
}

export function PracticePlannerInscribePractice({ isOpen, close, setNotification }: PracticePlannerInscribePracticeProps): React.JSX.Element {
  const { practices, skills } = useRulesetStore();
  const { cells, marks, addPractice } = usePracticePlannerStore();

  const [cellStartEndIndex, setCellStartEndIndex] = useState<[number, number]>([1, 2]);
  const [practiceType, setPracticeType] = useState<Practice>(practices[0]);
  const [testType, setTestType] = useState<string>("Routine");
  const [practiceName, setPracticeName] = useState<string | Skill>("");

  const practiceOptionLabel = (option: Practice): string =>
    option.ability !== undefined ? `${option.ability[1]} - ${String(option.cycle)}m, R: ${String(option.routine)}h, D: ${String(option.difficult)}h, C: ${String(option.challenging)}h` : `${String(option.skillType?.[1])} - ${String(option.cycle)}m, R: ${String(option.routine)}h, D: ${String(option.difficult)}h, C: ${String(option.challenging)}h`;

  const possibleSkills = useMemo(() => {
    if (practiceType.ability !== undefined) {
      return null;
    }
    return skills.filter(s => s.type[0] === practiceType.skillType?.[0] && s.flags.dontList !== true).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [practiceType, skills]);

  const defaultPracticeName = useMemo(() => {
    if (practiceType.ability !== undefined) {
      return practiceType.ability[1];
    }
    return possibleSkills?.[0] ?? "";
  }, [practiceType, possibleSkills]);

  useEffect(() => {
    setPracticeName(defaultPracticeName);
  }, [defaultPracticeName]);

  const handleAddPractice = (): void => {
    const practice = practices.find(p => p.id === practiceType.id);
    if (practice?.id !== undefined && practice.id !== null) {
      const practiceHours = (testType === "Routine" ? practice.routine : testType === "Difficult" ? practice.difficult : practice.challenging) ?? 0;
      const name = typeof practiceName === "string" ? practiceName : (practiceName.name ?? "");
      addPractice(practice.id, actualCellStartEndIndex, practiceHours, name, testType, setNotification);
    }
  };

  // Derive the constrained end index to avoid cascading renders
  const constrainedEndIndex = Math.min(cellStartEndIndex[1], cells.length);
  const actualCellStartEndIndex: [number, number] = [cellStartEndIndex[0], constrainedEndIndex];

  return (
    <Modal opened={isOpen} onClose={close} size="auto" title="Inscribe Practice">
      <Grid columns={12} justify="space-between" align="center" mb="16px">
        <Grid.Col span={{ base: 10, sm: 4, md: 5 }}>
          <Select
            label="Practice Type"
            variant="filled"
            value={practiceType.id?.toString() ?? null}
            data={practices.map(p => ({ value: p.id?.toString() ?? "", label: practiceOptionLabel(p) }))}
            onChange={v => {
              const found = practices.find(p => p.id?.toString() === v);
              if (found !== undefined) setPracticeType(found);
            }}
            allowDeselect={false}
            disabled={cells.length < 1}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 3 }}>
          {possibleSkills !== null && typeof practiceName !== "string"
            ? (
              <Select
                label="Name"
                variant="filled"
                value={practiceName.id?.toString() ?? null}
                data={possibleSkills.map(s => ({ value: s.id?.toString() ?? "", label: s.name ?? "" }))}
                onChange={v => {
                  const found = possibleSkills.find(s => s.id?.toString() === v);
                  if (found !== undefined) setPracticeName(found);
                }}
                allowDeselect={false}
                disabled={cells.length < 1}
              />
            )
            : <TextInput label="Name" variant="filled" defaultValue={typeof practiceName === "string" ? practiceName : (practiceName.name ?? "")} disabled />}
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 2 }}>
          <Select
            label="Test Type"
            variant="filled"
            value={testType}
            data={["Routine", "Difficult", "Challenging"]}
            onChange={v => { if (v !== null) setTestType(v); }}
            allowDeselect={false}
            disabled={cells.length < 1}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 2 }} style={{ alignSelf: "end" }}>
          <Button
            type="submit"
            variant="light"
            size="sm"
            disabled={cells.length < 1}
            onClick={() => { handleAddPractice(); }}
          >
            Add Practice
          </Button>
        </Grid.Col>
      </Grid>

      <Box mb="32px">
        <Text mb="4px">Start/End Day</Text>

        <RangeSlider
          value={actualCellStartEndIndex}
          onChange={v => { setCellStartEndIndex(v); }}
          min={1}
          max={cells.length}
          minRange={1}
          disabled={cells.length < 1}
          marks={marks}
        />
      </Box>
    </Modal>
  );
}
