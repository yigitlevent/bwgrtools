import "@mantine/charts/styles.css";
import { Container, Title, Text, useMantineTheme, Group, Stack, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
// eslint-disable-next-line import/no-unresolved
import "mantine-datatable/styles.css";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Menu } from "./Menu/Menu";
import { CharacterBurner } from "./Tools/CharacterBurner/CharacterBurner";
import { DiceRoller } from "./Tools/DiceRoller/DiceRoller";
import { DuelOfWitsPlanner } from "./Tools/DuelOfWitsPlanner/DuelOfWitsPlanner";
import { FightPlanner } from "./Tools/FightPlanner/FightPlanner";
import { LifepathLists } from "./Tools/LifepathLists/LifepathLists";
import { MagicWheel } from "./Tools/MagicWheel/MagicWheel";
import { MagicWheelAlt } from "./Tools/MagicWheel/MagicWheelAlt";
import { PracticePlanner } from "./Tools/PracticePlanner/PracticePlanner";
import { RangeAndCoverPlanner } from "./Tools/RangeAndCoverPlanner/RangeAndCoverPlanner";
import { ResourcesList } from "./Tools/ResourcesList/ResourcesList";
import { SkillLists } from "./Tools/SkillLists/SkillLists";
import { TraitLists } from "./Tools/TraitLists/TraitLists";
import { useRulesetStore } from "../hooks/apiStores/useRulesetStore";
import { useCursorStore } from "../hooks/useCursorStore";

import "../theme/overwrite.css";


export function App(): React.JSX.Element {
  const { fetchState, fetchList, fetchData } = useRulesetStore();
  const cursorType = useCursorStore(s => s.cursorType);
  const theme = useMantineTheme();

  useEffect(() => {
    if (fetchState === "fetch-full") fetchList();
  }, [fetchList, fetchState]);

  useEffect(() => {
    if (fetchState === "fetch-data") fetchData();
  }, [fetchData, fetchState]);

  useEffect(() => {
    document.body.style.cursor = theme.other.cursors[cursorType];
    return () => { document.body.style.cursor = ""; };
  }, [cursorType, theme]);

  return (
    <Box h="100svh" w="100svw">
      <Container size="lg">
        <Stack style={{ height: "100%" }} justify="start">
          <Group justify="space-between">
            <Title mt={8}>BWGR Tools</Title>
            <Menu />
          </Group>

          {fetchState === "failed" ? <Text>Data fetching failed.</Text> : null}

          {fetchState === "done" ? (
            <Routes>
              <Route path="/" element={<Navigate replace to="/diceroller" />} />
              <Route path="/diceroller" element={<DiceRoller />} />
              <Route path="/lifepaths" element={<LifepathLists />} />
              <Route path="/skills" element={<SkillLists />} />
              <Route path="/traits" element={<TraitLists />} />
              <Route path="/resources" element={<ResourcesList />} />
              <Route path="/practiceplanner" element={<PracticePlanner />} />
              <Route path="/magicwheel" element={<MagicWheel />} />
              <Route path="/magicwheelalt" element={<MagicWheelAlt />} />
              <Route path="/dowplanner" element={<DuelOfWitsPlanner />} />
              <Route path="/racplanner" element={<RangeAndCoverPlanner />} />
              <Route path="/fightplanner" element={<FightPlanner />} />
              <Route path="/characterburner" element={<CharacterBurner />} />
            </Routes>
          ) : <Text>Loading</Text>}
        </Stack>
      </Container>
    </Box>
  );
}
