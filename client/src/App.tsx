import "@mantine/charts/styles.css";
import { Box, Container, Paper, Title, Text, useMantineTheme, Group } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { useMediaQuery } from "@mantine/hooks";
import "@mantine/notifications/styles.css";
// eslint-disable-next-line import/no-unresolved
import "mantine-datatable/styles.css";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Menu } from "./components/Menu/Menu";
import { CharacterBurner } from "./components/Tools/CharacterBurner/CharacterBurner";
import { DiceRoller } from "./components/Tools/DiceRoller/DiceRoller";
import { DuelOfWitsPlanner } from "./components/Tools/DuelOfWitsPlanner/DuelOfWitsPlanner";
import { FightPlanner } from "./components/Tools/FightPlanner/FightPlanner";
import { LifepathLists } from "./components/Tools/LifepathLists/LifepathLists";
import { MagicWheel } from "./components/Tools/MagicWheel/MagicWheel";
import { MagicWheelAlt } from "./components/Tools/MagicWheel/MagicWheelAlt";
import { PracticePlanner } from "./components/Tools/PracticePlanner/PracticePlanner";
import { RangeAndCoverPlanner } from "./components/Tools/RangeAndCoverPlanner/RangeAndCoverPlanner";
import { ResourcesList } from "./components/Tools/ResourcesList/ResourcesList";
import { SkillLists } from "./components/Tools/SkillLists/SkillLists";
import { TraitLists } from "./components/Tools/TraitLists/TraitLists";
import { useRulesetStore } from "./hooks/apiStores/useRulesetStore";
import { useUserStore } from "./hooks/apiStores/useUserStore";
import { useCursorStore } from "./hooks/useCursorStore";

import "./theme/overwrite.css";


export function App(): React.JSX.Element {
  const { triedAuth, auth, user } = useUserStore();
  const { fetchState, fetchList, fetchData } = useRulesetStore();
  const cursorType = useCursorStore(s => s.cursorType);
  const matches = useMediaQuery("(max-width: 48em)");
  const theme = useMantineTheme();

  useEffect(() => {
    if (!triedAuth) { auth(); }
  }, [auth, triedAuth]);

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
    <Container size="lg" style={{ height: "100svh", width: "100svw" }}>
      <Group justify="space-between" mx={20}>
        <Title order={1} mt={8}>BWGR Tools</Title>
        <Box ta="right">{user ? `welcome, ${user.email}` : null}</Box>
        <Menu bottom={matches} />
      </Group>

      <Paper px="20px" py="10px">
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
      </Paper>

      <Box mb="200px" />
    </Container>
  );
}
