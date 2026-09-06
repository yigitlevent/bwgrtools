import { Box, Container, Paper, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

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
import { useUserStore } from "../hooks/apiStores/useUserStore";


export function MainBox(): React.JSX.Element {
  const { user } = useUserStore();
  const { fetchState, fetchList, fetchData } = useRulesetStore();
  const matches = useMediaQuery("(max-width: 48em)");

  useEffect(() => {
    if (fetchState === "fetch-full") fetchList();
  }, [fetchList, fetchState]);

  useEffect(() => {
    if (fetchState === "fetch-data") fetchData();
  }, [fetchData, fetchState]);

  return (
    <Container size="lg" my="10px" style={{ height: "100svh", width: "100svw" }}>
      <Title order={1}>BWGR Tools</Title>
      <Box ta="right">{user ? `welcome, ${user.email}` : null}</Box>
      <Menu bottom={matches} />

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
