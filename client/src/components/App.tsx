import "@mantine/charts/styles.css";
import { Container, Title, Text, useMantineTheme, Group, Stack, Box, Loader, Button, Center } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
// eslint-disable-next-line import/no-unresolved
import "mantine-datatable/styles.css";
import { useEffect, useRef } from "react";
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
  const { fetchState, fetchList, fetchData, setFetchState } = useRulesetStore();
  const cursorType = useCursorStore(s => s.cursorType);
  const theme = useMantineTheme();

  const scrollRef = useRef<HTMLDivElement>(null);

  const retry = (): void => { setFetchState("fetch-full"); };

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
    <Box ref={scrollRef} style={{ height: "100svh", width: "100svw", overflowY: "auto" }}>
      <Container size="lg">
        <Stack gap={0} justify="start" style={{ height: "100svh" }}>
          <Group justify="space-between" style={{ height: "54px", minHeight: "54px" }}>
            <Title mt={8}>BWGR Tools</Title>
            <Menu />
          </Group>

          <Box style={{ height: "calc(100svh - 54px)", minHeight: "calc(100svh - 54px)" }}>
            {fetchState === "failed" ? (
              <Center style={{ height: "100%" }}>
                <Stack align="center" gap="sm">
                  <Text>Could not load ruleset data. Check your connection and try again.</Text>
                  <Button variant="outline" onClick={retry}>Retry</Button>
                </Stack>
              </Center>
            ) : null}

            {fetchState === "done" ? (
              <Routes>
                <Route path="/" element={<Navigate replace to="/diceroller" />} />
                <Route path="/diceroller" element={<DiceRoller />} />
                <Route path="/lifepaths" element={<LifepathLists scrollRef={scrollRef} />} />
                <Route path="/skills" element={<SkillLists />} />
                <Route path="/traits" element={<TraitLists />} />
                <Route path="/resources" element={<ResourcesList scrollRef={scrollRef} />} />
                <Route path="/practiceplanner" element={<PracticePlanner />} />
                <Route path="/magicwheel" element={<MagicWheel />} />
                <Route path="/magicwheelalt" element={<MagicWheelAlt />} />
                <Route path="/dowplanner" element={<DuelOfWitsPlanner />} />
                <Route path="/racplanner" element={<RangeAndCoverPlanner />} />
                <Route path="/fightplanner" element={<FightPlanner />} />
                <Route path="/characterburner" element={<CharacterBurner />} />
              </Routes>
            ) : null}

            {fetchState !== "done" && fetchState !== "failed" ? (
              <Center style={{ height: "100%" }}>
                <Loader />
              </Center>
            ) : null}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
