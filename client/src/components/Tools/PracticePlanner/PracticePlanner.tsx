import { Box, Button, Divider, Grid, RangeSlider, Select, Text, TextInput, Title } from "@mantine/core";
import { Fragment, useEffect, useState, useMemo } from "react";

import { PracticePlannerCells } from "./PracticePlannerCells";
import { PracticePlannerTimetable } from "./PracticePlannerTimetable";
import { PracticePlannerTimetableSummary } from "./PracticePlannerTimetableSummary";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";


export function PracticePlanner(): React.JSX.Element {
  const { practices, skills } = useRulesetStore();
  const { cells, marks, addPractice } = usePracticePlannerStore();

  const [cellStartEndIndex, setCellStartEndIndex] = useState<[number, number]>([1, 2]);
  const [practiceType, setPracticeType] = useState<Practice>(practices[0]);
  const [testType, setTestType] = useState<string>("Routine");
  const [practiceName, setPracticeName] = useState<string | Skill>("");

  const [notification, setNotification] = useState<null | React.JSX.Element>(null);

  const practiceOptionLabel = (option: Practice): string =>
    option.ability ? `${option.ability[1]} - ${String(option.cycle)}m, R: ${String(option.routine)}h, D: ${String(option.difficult)}h, C: ${String(option.challenging)}h` : `${String(option.skillType?.[1])} - ${String(option.cycle)}m, R: ${String(option.routine)}h, D: ${String(option.difficult)}h, C: ${String(option.challenging)}h`;

  const possibleSkills = useMemo(() => {
    if (practiceType.ability) {
      return null;
    }
    return skills.filter(s => s.type[0] === practiceType.skillType?.[0] && !s.flags.dontList).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [practiceType, skills]);

  const defaultPracticeName = useMemo(() => {
    if (practiceType.ability) {
      return practiceType.ability[1];
    }
    return possibleSkills?.[0] ?? "";
  }, [practiceType, possibleSkills]);

  useEffect(() => {
    setPracticeName(defaultPracticeName);
  }, [defaultPracticeName]);

  const handleAddPractice = (): void => {
    const practice = practices.find(p => p.id === practiceType.id);
    if (practice?.id) {
      const practiceHours = (testType === "Routine" ? practice.routine : testType === "Difficult" ? practice.difficult : practice.challenging) ?? 0;
      const name = typeof practiceName === "string" ? practiceName : (practiceName.name ?? "");
      addPractice(practice.id, actualCellStartEndIndex, practiceHours, name, testType, setNotification);
    }
  };

  // Derive the constrained end index to avoid cascading renders
  const constrainedEndIndex = Math.min(cellStartEndIndex[1], cells.length);
  const actualCellStartEndIndex: [number, number] = [cellStartEndIndex[0], constrainedEndIndex];

  return (
    <Fragment>
      {notification}
      <Title order={3}>Practice Planner</Title>
      <Divider label="Inscribe Practice" mt="10px" />

      <Grid columns={12} justify="space-between" align="center" mb="16px">
        <Grid.Col span={{ base: 10, sm: 4, md: 3 }}>
          <Select
            label="Practice Type"
            variant="filled"
            value={practiceType.id?.toString() ?? null}
            data={practices.map(p => ({ value: p.id?.toString() ?? "", label: practiceOptionLabel(p) }))}
            onChange={v => {
              const found = practices.find(p => p.id?.toString() === v);
              if (found) setPracticeType(found);
            }}
            allowDeselect={false}
            disabled={cells.length < 1}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 3 }}>
          {possibleSkills && typeof practiceName !== "string" ? (
            <Select
              label="Name"
              variant="filled"
              value={practiceName.id?.toString() ?? null}
              data={possibleSkills.map(s => ({ value: s.id?.toString() ?? "", label: s.name ?? "" }))}
              onChange={v => {
                const found = possibleSkills.find(s => s.id?.toString() === v);
                if (found) setPracticeName(found);
              }}
              allowDeselect={false}
              disabled={cells.length < 1}
            />
          ) : <TextInput label="Name" variant="filled" defaultValue={typeof practiceName === "string" ? practiceName : (practiceName.name ?? "")} disabled />}
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 3 }}>
          <Select
            label="Test Type"
            variant="filled"
            value={testType}
            data={["Routine", "Difficult", "Challenging"]}
            onChange={v => { if (v) setTestType(v); }}
            allowDeselect={false}
            disabled={cells.length < 1}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 4, md: 2 }}>
          <Button
            type="submit"
            variant="outline"
            size="md"
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
          disabled={cells.length < 1}
          marks={marks}
        />
      </Box>

      <PracticePlannerTimetable />
      <PracticePlannerTimetableSummary />
      <PracticePlannerCells setNotification={setNotification} />
    </Fragment>
  );
}
