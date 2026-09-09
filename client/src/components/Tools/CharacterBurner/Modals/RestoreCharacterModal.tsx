import { Alert, Button, Grid, Modal, Text } from "@mantine/core";

import { ClearPersistedCharacter } from "../../../../hooks/featureStores/CharacterBurnerStores/characterBurnerAutosave";
import { HydrateCharacterBurner } from "../../../../hooks/featureStores/CharacterBurnerStores/characterBurnerSnapshot";


export function RestoreCharacterModal({ payload, mismatch, close }: { payload: CharacterBurnerAutosavePayload; mismatch: boolean; close: () => void; }): React.JSX.Element {
  const discard = (): void => {
    ClearPersistedCharacter();
    close();
  };

  const resume = (): void => {
    HydrateCharacterBurner(payload.snapshot);
    close();
  };

  return (
    <Modal opened onClose={discard} size="600px" withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false}>
      <Grid columns={1} gap="md">
        <Grid.Col span={1}>
          {mismatch ? (
            <Alert color="yellow">
              You have an autosaved character from a different ruleset selection. It can no longer be restored.
            </Alert>
          ) : (
            <Alert color="yellow">
              You have an in-progress character saved in this browser from
              {" "}
              {new Date(payload.savedAt).toLocaleString()}
              .
            </Alert>
          )}
        </Grid.Col>

        {mismatch ? null : (
          <Grid.Col span={1}>
            <Text size="sm">Resume it, or start fresh and discard the saved copy.</Text>
          </Grid.Col>
        )}

        <Grid.Col span={1}>
          {mismatch ? (
            <Button variant="outline" size="md" onClick={discard} fullWidth>Discard</Button>
          ) : (
            <Grid columns={2} gap="md">
              <Grid.Col span={1}>
                <Button variant="outline" size="md" onClick={discard} fullWidth>Start Fresh</Button>
              </Grid.Col>

              <Grid.Col span={1}>
                <Button size="md" onClick={resume} fullWidth>Resume</Button>
              </Grid.Col>
            </Grid>
          )}
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
