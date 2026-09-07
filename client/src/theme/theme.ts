import { ActionIcon, Badge, Button, CloseButton, createTheme, Menu, NumberInput, Select, Tabs, Textarea, TextInput, UnstyledButton, Switch, Modal, Autocomplete, TreeSelect, ColorInput, SegmentedControl, MultiSelect, Checkbox } from "@mantine/core";

import type { MantineColorsTuple } from "@mantine/core";


const MainColors: MantineColorsTuple = [
  "#e1f8ff",
  "#cbedff",
  "#9ad7ff",
  "#64c1ff",
  "#3aaefe",
  "#20a2fe",
  "#099cff",
  "#0088e4",
  "#0079cd",
  "#0068b6"
];

export const DarkTheme = createTheme({
  colors: {
    MainColors
  },
  primaryColor: "MainColors",
  fontSizes: {
    xs: "0.70rem",
    sm: "0.81rem",
    md: "0.92rem",
    lg: "1.13rem",
    xl: "1.34rem"
  },
  fontFamily: "var(--app-font-family)",
  headings: {
    fontFamily: "var(--app-font-family)"
  },
  components: {
    Button: Button.extend({
      styles: (_theme, props) => ({
        root: {
          cursor: props.disabled ? "var(--cursor-invalid)" : "var(--cursor-pointer)"
        }
      })
    }),
    SegmentedControl: SegmentedControl.extend({
      styles: {
        root: { cursor: "var(--cursor-pointer)" },
        control: { cursor: "var(--cursor-pointer)" },
        input: { cursor: "var(--cursor-pointer)" },
        label: { cursor: "var(--cursor-pointer)" },
        indicator: { cursor: "var(--cursor-pointer)" },
        innerLabel: { cursor: "var(--cursor-pointer)" }
      }
    }),
    Select: Select.extend({
      styles: {
        label: { cursor: "var(--cursor-default)" },
        input: { cursor: "var(--cursor-pointer)" },
        option: { cursor: "var(--cursor-pointer)" }
      }
    }),
    MultiSelect: MultiSelect.extend({
      styles: {
        label: { cursor: "var(--cursor-default)" },
        input: { cursor: "var(--cursor-pointer)" },
        option: { cursor: "var(--cursor-pointer)" }
      }
    }),
    TreeSelect: TreeSelect.extend({
      styles: {
        label: { cursor: "var(--cursor-default)" },
        input: { cursor: "var(--cursor-text)" },
        option: { cursor: "var(--cursor-pointer)" }
      }
    }),
    Autocomplete: Autocomplete.extend({
      styles: {
        label: { cursor: "var(--cursor-default)" },
        input: { cursor: "var(--cursor-text)" },
        option: { cursor: "var(--cursor-pointer)" }
      }
    }),
    ColorInput: ColorInput.extend({
      styles: {
        dropdown: { cursor: "var(--cursor-pointer)" }
      }
    }),
    TextInput: TextInput.extend({
      styles: {
        label: { cursor: "var(--cursor-default)" },
        input: { cursor: "var(--cursor-text)" }
      }
    }),
    NumberInput: NumberInput.extend({
      styles: {
        input: { cursor: "var(--cursor-text)" }
      }
    }),
    Checkbox: Checkbox.extend({
      styles: (_theme, props) => ({
        input: {
          cursor: props.disabled ? "var(--cursor-invalid)" : "var(--cursor-pointer)"
        }
      })
    }),
    Switch: Switch.extend({
      styles: {
        root: { cursor: "var(--cursor-pointer)" },
        track: { cursor: "var(--cursor-pointer)" },
        trackLabel: { cursor: "var(--cursor-pointer)" },
        thumb: { cursor: "var(--cursor-pointer)" },
        input: { cursor: "var(--cursor-pointer)" },
        body: { cursor: "var(--cursor-pointer)" },
        labelWrapper: { cursor: "var(--cursor-pointer)" },
        label: { cursor: "var(--cursor-pointer)" },
        description: { cursor: "var(--cursor-pointer)" },
        error: { cursor: "var(--cursor-pointer)" }
      }
    }),
    Textarea: Textarea.extend({
      styles: {
        input: { cursor: "var(--cursor-text)" }
      }
    }),
    ActionIcon: ActionIcon.extend({
      styles: (_theme, props) => ({
        root: {
          cursor: props.disabled ? "var(--cursor-invalid)" : "var(--cursor-pointer)"
        }
      })
    }),
    CloseButton: CloseButton.extend({
      styles: (_theme, props) => ({
        root: {
          cursor: props.disabled ? "var(--cursor-invalid)" : "var(--cursor-pointer)"
        }
      })
    }),
    UnstyledButton: UnstyledButton.extend({
      styles: { root: { cursor: "var(--cursor-pointer)" } }
    }),
    Tabs: Tabs.extend({
      styles: { tab: { cursor: "var(--cursor-pointer)" } }
    }),
    Menu: Menu.extend({
      styles: { item: { cursor: "var(--cursor-pointer)" } }
    }),
    Badge: Badge.extend({
      styles: { root: { cursor: "inherit" } }
    }),
    Modal: Modal.extend({
      styles: { inner: { cursor: "var(--cursor-default)" } }
    })
  },
  other: {
    cursors: {
      default: "var(--cursor-default)",
      edit: "var(--cursor-edit)",
      grabClosed: "var(--cursor-grab-closed)",
      grabOpen: "var(--cursor-grab-open)",
      invalid: "var(--cursor-invalid)",
      loading: "var(--cursor-loading)",
      pointer: "var(--cursor-pointer)",
      steps: "var(--cursor-steps)",
      text: "var(--cursor-text)"
    }
  }
});
