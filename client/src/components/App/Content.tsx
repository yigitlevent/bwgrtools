import { Center, Stack, Box, Button, Loader, Text } from "@mantine/core";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useRulesetStore } from "../../hooks/apiStores/useRulesetStore";
import { NotFound } from "../Shared/NotFound";
import { CharacterBurner } from "./Content/CharacterBurner";
import { DiceRoller } from "./Content/DiceRoller";
import { DuelOfWitsPlanner } from "./Content/DuelOfWitsPlanner";
import { FightPlanner } from "./Content/FightPlanner";
import { LifepathLists } from "./Content/LifepathLists";
import { MagicWheel } from "./Content/MagicWheel";
import { MagicWheelAlt } from "./Content/MagicWheelAlt";
import { PracticePlanner } from "./Content/PracticePlanner";
import { RangeAndCoverPlanner } from "./Content/RangeAndCoverPlanner";
import { ResourcesList } from "./Content/ResourcesList";
import { SkillLists } from "./Content/SkillLists";
import { TraitLists } from "./Content/TraitLists";


interface ContentProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function Content({ scrollRef }: ContentProps): React.JSX.Element {
  const { fetchState, fetchList, fetchData, setFetchState } = useRulesetStore();

  const retry = (): void => { setFetchState("fetch-full"); };

  useEffect(() => {
    if (fetchState === "fetch-full") fetchList();
  }, [fetchList, fetchState]);

  useEffect(() => {
    if (fetchState === "fetch-data") fetchData();
  }, [fetchData, fetchState]);

  return (
    <Box style={{ height: "calc(100svh - 54px)", minHeight: "calc(100svh - 54px)" }}>
      {fetchState !== "done" && fetchState !== "failed"
        ? (
          <Center style={{ height: "100%" }}>
            <Loader />
          </Center>
        )
        : null}

      {fetchState === "failed"
        ? (
          <Center style={{ height: "100%" }}>
            <Stack align="center" gap="sm">
              <Text>Could not load ruleset data. Check your connection and try again.</Text>
              <Button variant="outline" onClick={retry}>Retry</Button>
            </Stack>
          </Center>
        )
        : null}

      {fetchState === "done"
        ? (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        )
        : null}
    </Box>
  );
}
