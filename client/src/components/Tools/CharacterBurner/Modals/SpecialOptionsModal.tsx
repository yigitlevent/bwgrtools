import { Grid, Modal } from "@mantine/core";

import { BrutalLife } from "./SpecialOptionsModal/BrutalLife";
import { HuntingGround } from "./SpecialOptionsModal/HuntingGround";
import { SpecialAvarice } from "./SpecialOptionsModal/SpecialAvarice";
import { SpecialChildProdigy } from "./SpecialOptionsModal/SpecialChildProdigy";
import { SpecialCitadelVows } from "./SpecialOptionsModal/SpecialCitadelVows";
import { SpecialDarlingOfCourt } from "./SpecialOptionsModal/SpecialDarlingOfCourt";
import { SpecialEarToGround } from "./SpecialOptionsModal/SpecialEarToGround";
import { SpecialFamilyHeirloom } from "./SpecialOptionsModal/SpecialFamilyHeirloom";
import { SpecialFeyBlood } from "./SpecialOptionsModal/SpecialFeyBlood";
import { SpecialLessonOfOne } from "./SpecialOptionsModal/SpecialLessonOfOne";
import { SpecialLifepaths } from "./SpecialOptionsModal/SpecialLifepaths";
import { SpecialLordOfAges } from "./SpecialOptionsModal/SpecialLordOfAges";
import { SpecialMourner } from "./SpecialOptionsModal/SpecialMourner";
import { SpecialResourceGrants } from "./SpecialOptionsModal/SpecialResourceGrants";
import { SpecialSkills } from "./SpecialOptionsModal/SpecialSkills";
import { SpecialStatPenalties } from "./SpecialOptionsModal/SpecialStatPenalties";
import { SpecialTaintedLegacy } from "./SpecialOptionsModal/SpecialTaintedLegacy";


export function SpecialOptionsModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={3} gap="xs" align="center" justify="center">
        <BrutalLife />
        <HuntingGround />
        <SpecialLifepaths />
        <SpecialSkills />
        <SpecialResourceGrants />
        <SpecialAvarice />
        <SpecialStatPenalties />
        <SpecialTaintedLegacy />
        <SpecialChildProdigy />
        <SpecialCitadelVows />
        <SpecialDarlingOfCourt />
        <SpecialEarToGround />
        <SpecialFamilyHeirloom />
        <SpecialFeyBlood />
        <SpecialLessonOfOne />
        <SpecialLordOfAges />
        <SpecialMourner />
      </Grid>
    </Modal>
  );
}
