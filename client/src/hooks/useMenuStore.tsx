import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type MenuNames = "Tools" | "Datasets";

interface MenuState {
  menu: undefined | MenuNames;
  toggleMenu: (menu?: MenuNames) => void;
}

export const useMenuStore = create<MenuState>()(
  devtools(
    set => ({
      menu: undefined,

      toggleMenu: (menu?: MenuNames) => {
        set(produce<MenuState>(state => {
          if (state.menu === menu) state.menu = undefined;
          else state.menu = menu;
        }));
      }
    }),
    { name: "useMenuStore" }
  )
);
