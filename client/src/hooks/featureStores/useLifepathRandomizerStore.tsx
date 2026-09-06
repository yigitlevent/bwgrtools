import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Clamp } from "../../utils/Clamp";


interface LifepathRandomizerState {
  stock: dat.StockId | "Random";
  setting: dat.SettingId | "Random";
  noDuplicates: boolean;
  maxLeads: number;
  maxLifepaths: number;
  minLifepaths: number;

  changeStock: (stock: dat.StockId | "Random") => void;
  changeMaxLeads: (value: string) => void;
  changeMaxLifepaths: (value: string) => void;
  changeMinLifepaths: (value: string) => void;
  toggleNoDuplicates: () => void;
}

export const useLifepathRandomizerStore = create<LifepathRandomizerState>()(
  devtools(
    (set, get) => ({
      stock: "Random",
      setting: "Random",
      noDuplicates: true,
      maxLeads: 3,
      maxLifepaths: 6,
      minLifepaths: 5,

      changeStock: (stock: dat.StockId | "Random") => {
        set(produce<LifepathRandomizerState>(state => { state.stock = stock; }));
      },

      changeMaxLeads: (value: string) => {
        set(produce<LifepathRandomizerState>(state => {
          state.maxLeads = Clamp(value === "" ? 0 : parseInt(value), 0, 20);
        }));
      },
      changeMaxLifepaths: (value: string) => {
        set(produce<LifepathRandomizerState>(state => {
          state.maxLifepaths = Clamp(value === "" ? 0 : parseInt(value), 0, 20);
        }));
      },
      changeMinLifepaths: (value: string) => {
        set(produce<LifepathRandomizerState>(state => {
          state.minLifepaths = Clamp(value === "" ? 0 : parseInt(value), 0, get().maxLifepaths);
        }));
      },
      toggleNoDuplicates: () => {
        set(produce<LifepathRandomizerState>(state => {
          state.noDuplicates = !state.noDuplicates;
        }));
      }
    }),
    { name: "useLifepathRandomizerStore" }
  )
);
