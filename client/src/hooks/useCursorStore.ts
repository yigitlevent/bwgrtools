import { create } from "zustand";


export type CursorType =
  | "default"
  | "edit"
  | "grabClosed"
  | "grabOpen"
  | "invalid"
  | "loading"
  | "pointer"
  | "steps"
  | "text";

declare module "@mantine/core" {
  export interface MantineThemeOther {
    cursors: Record<CursorType, string>;
  }
}

interface CursorStore {
  cursorType: CursorType;
  setCursor: (type: CursorType) => void;
}

export const useCursorStore = create<CursorStore>(set => ({
  cursorType: "default",
  setCursor: cursorType => { set({ cursorType }); }
}));
