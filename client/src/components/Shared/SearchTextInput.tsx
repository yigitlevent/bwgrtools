import { Loader, Popover, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

import { MinSearchTextLength } from "../../hooks/useSearch";

import type { TextInputProps } from "@mantine/core";


const HintDismissMs = 2500;

/**
 * The Search box shared by the list/lookup tools. Shows the minimum-character hint as a
 * self-dismissing popover rather than a description line, since a description reserves/frees
 * layout space as it appears and disappears, shifting the rest of the form underneath it.
 */
export function SearchTextInput({ value, onChange, isPending, ...rest }: Omit<TextInputProps, "label" | "rightSection" | "value" | "onChange"> & { value: string; onChange: (value: string) => void; isPending: boolean; }): React.JSX.Element {
  const [showHint, setShowHint] = useState(false);

  const isShort = value.length > 0 && value.length < MinSearchTextLength;

  useEffect(() => {
    if (!isShort) {
      setShowHint(false);
      return;
    }

    setShowHint(true);
    const timeout = setTimeout(() => { setShowHint(false); }, HintDismissMs);
    return () => { clearTimeout(timeout); };
  }, [isShort, value]);

  return (
    <Popover opened={showHint} position="bottom-start" withArrow>
      <Popover.Target>
        <TextInput
          {...rest}
          label="Search"
          value={value}
          onChange={e => { onChange(e.target.value); }}
          rightSection={isPending ? <Loader size="xs" /> : undefined}
        />
      </Popover.Target>

      <Popover.Dropdown>
        {`Type at least ${MinSearchTextLength.toString()} characters`}
      </Popover.Dropdown>
    </Popover>
  );
}
