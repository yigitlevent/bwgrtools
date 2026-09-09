import { Button, ActionIcon, Box, Tooltip } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef } from "react";

import type { ButtonProps } from "@mantine/core";


type AbilityButtonProps = ButtonProps & React.ComponentPropsWithoutRef<"button"> & { onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void; };

const LongPressMs = 500;

/**
 * Fires `onContextMenu` on a long press, so the decrement action (usually only reachable via
 * right-click) also works on touch devices, where there is no right-click equivalent.
 */
function useLongPress(onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void): {
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  consumeLongPress: () => boolean;
} {
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fired = useRef(false);

  const cancel = (): void => {
    clearTimeout(timeout.current);
  };

  return {
    onPointerDown: e => {
      if (e.pointerType !== "touch" || onContextMenu === undefined) return;
      fired.current = false;
      timeout.current = setTimeout(() => {
        fired.current = true;
        onContextMenu(e);
      }, LongPressMs);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    // The touch that ends a long press also fires a trailing click - consumeLongPress lets
    // onClick check (and reset) whether that click should be swallowed instead of double-firing.
    consumeLongPress: () => {
      const wasFired = fired.current;
      fired.current = false;
      return wasFired;
    }
  };
}

export function AbilityButton(props: AbilityButtonProps): React.JSX.Element {
  const { onClick, onContextMenu, ...rest } = props;
  const { consumeLongPress, ...longPress } = useLongPress(onContextMenu);

  const handle = (e: React.MouseEvent<HTMLButtonElement>, callback?: (event: React.MouseEvent<HTMLButtonElement>) => void): void => {
    e.preventDefault();
    if (callback !== undefined) callback(e);
  };

  const button = (
    <Button
      {...rest}
      {...longPress}
      size="xs"
      variant="outline"
      fz={14}
      style={{ minWidth: "30px", width: "30px", display: "inline-block", margin: "1px", padding: 0 }}
      onClick={e => { if (!consumeLongPress()) handle(e, onClick); }}
      onContextMenu={e => { handle(e, onContextMenu); }}
    />
  );

  if (onContextMenu === undefined) return button;

  return (
    <Tooltip color="gray" label="Right-click or press and hold to decrease" events={{ hover: true, focus: true, touch: true }}>
      {button}
    </Tooltip>
  );
}

export function AbilityButtonWithArrows(props: AbilityButtonProps): React.JSX.Element {
  const { onClick, onContextMenu, ...rest } = props;

  const handle = (e: React.MouseEvent<HTMLButtonElement>, callback?: (event: React.MouseEvent<HTMLButtonElement>) => void): void => {
    e.preventDefault();
    if (callback !== undefined) callback(e);
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
