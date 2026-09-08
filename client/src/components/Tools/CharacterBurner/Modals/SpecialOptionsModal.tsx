import { Grid, Modal } from "@mantine/core";

import { BrutalLife } from "./SpecialOptionsModal/BrutalLife";
import { HuntingGround } from "./SpecialOptionsModal/HuntingGround";
import { SpecialLifepaths } from "./SpecialOptionsModal/SpecialLifepaths";
import { SpecialResourceGrants } from "./SpecialOptionsModal/SpecialResourceGrants";
import { SpecialSkills } from "./SpecialOptionsModal/SpecialSkills";


export function SpecialOptionsModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={3} gap="xs" align="center" justify="center">
        <BrutalLife />
        <HuntingGround />
        <SpecialLifepaths />
        <SpecialSkills />
        <SpecialResourceGrants />
      </Grid>
    </Modal>
  );
}
