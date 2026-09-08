import { Alert, Button, FileInput, Grid, Modal, Text } from "@mantine/core";
import { useState } from "react";

import { HydrateCharacterBurner } from "../../../../hooks/featureStores/CharacterBurnerStores/characterBurnerSnapshot";


const RequiredSnapshotKeys: (keyof CharacterBurnerExportSnapshot)[] = ["basics", "lifepaths", "stats", "skills", "traits", "attributes", "resources", "misc"];

function IsCharacterBurnerExportSnapshot(value: unknown): value is CharacterBurnerExportSnapshot {
  if (typeof value !== "object" || value === null) return false;
  return RequiredSnapshotKeys.every(key => key in value);
}

export function ImportCharacterModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chooseFile = (newFile: File | null): void => {
    setFile(newFile);
    setError(null);
  };

  const importCharacter = (): void => {
    if (!file) return;

    file.text()
      .then(text => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        }
        catch {
          setError("That file isn't valid JSON.");
          return;
        }

        if (!IsCharacterBurnerExportSnapshot(parsed)) {
          setError("That file doesn't look like a character export - it's missing expected data.");
          return;
        }

        HydrateCharacterBurner(parsed);
        setFile(null);
        setError(null);
        close();
      })
      .catch(() => { setError("Could not read that file."); });
  };

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="600px">
      <Grid columns={1} gap="md">
        <Grid.Col span={1}>
          <Alert color="yellow">Importing a character replaces everything currently in the burner. This cannot be undone.</Alert>
        </Grid.Col>

        <Grid.Col span={1}>
          <FileInput label="Character file" placeholder="Choose a .json file" accept="application/json" value={file} onChange={chooseFile} clearable />
        </Grid.Col>

        {error ? (
          <Grid.Col span={1}>
            <Text c="red" size="sm">{error}</Text>
          </Grid.Col>
        ) : null}

        <Grid.Col span={1}>
          <Button variant="outline" size="md" onClick={importCharacter} disabled={!file} fullWidth>Import</Button>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
