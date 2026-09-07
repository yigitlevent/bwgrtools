import { Button, ActionIcon, Box } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { ButtonProps } from "@mantine/core";


type AbilityButtonProps = ButtonProps & React.ComponentPropsWithoutRef<"button"> & { onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void; };

export function AbilityButton(props: AbilityButtonProps): React.JSX.Element {
  const { onClick, onContextMenu, ...rest } = props;

  const handle = (e: React.MouseEvent<HTMLButtonElement>, callback?: (event: React.MouseEvent<HTMLButtonElement>) => void): void => {
    e.preventDefault();
    if (callback) callback(e);
  };

  return (
    <Button
      {...rest}
      size="xs"
      variant="outline"
      fz={14}
      style={{ minWidth: "30px", width: "30px", display: "inline-block", margin: "1px", padding: 0 }}
      onClick={e => { handle(e, onClick); }}
      onContextMenu={e => { handle(e, onContextMenu); }}
    />
  );
}

export function AbilityButtonWithArrows(props: AbilityButtonProps): React.JSX.Element {
  const { onClick, onContextMenu, ...rest } = props;

  const handle = (e: React.MouseEvent<HTMLButtonElement>, callback?: (event: React.MouseEvent<HTMLButtonElement>) => void): void => {
    e.preventDefault();
    if (callback) callback(e);
  };

  return (
    <Box style={{ display: "inline-grid", gridTemplateColumns: "30px", gridTemplateRows: "30px auto 30px" }}>
      <ActionIcon variant="subtle" onClick={e => { handle(e, onClick); }}>
        <ChevronUp size={16} />
      </ActionIcon>

      <Button
        {...rest}
        size="xs"
        variant="outline"
        style={{ minWidth: "30px", width: "30px", display: "inline-block", marginRight: "8px", padding: 0 }}
        onClick={e => { handle(e, onClick); }}
        onContextMenu={e => { handle(e, onContextMenu); }}
      />

      <ActionIcon variant="subtle" onClick={e => { handle(e, onContextMenu); }}>
        <ChevronDown size={16} />
      </ActionIcon>
    </Box>
  );
}
