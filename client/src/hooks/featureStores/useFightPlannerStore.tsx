import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type FightActionExtended = FightAction & { open: boolean; visible: boolean; };


interface FightPlannerState {
  actions: [FightActionExtended[], FightActionExtended[], FightActionExtended[]];
  selectedAction: [string, string, string];

  addAction: (actions: FightAction[], volleyIndex: number, actionName: undefined | string) => void;
  deleteAction: (volleyIndex: number, actionIndex: number) => void;
  changeSelectedAction: (actionName: string, volleyIndex: number) => void;
  toggleActionDetails: (volleyIndex: number, actionIndex: number) => void;
  toggleActionVisibility: (volleyIndex: number, actionIndex: number) => void;
}

export const useFightPlannerStore = create<FightPlannerState>()(
  devtools(
    set => ({
      actions: [[], [], []],
      selectedAction: ["No Action", "No Action", "No Action"],

      addAction: (actions: FightAction[], volleyIndex: number, actionName: undefined | string) => {
        const actionMaybe = actions.find(v => v.name === actionName);
        if (!actionMaybe) return;
        const action: FightActionExtended = { ...actionMaybe, open: false, visible: true };
        set(produce<FightPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) { return [...v, action]; }
            return v;
          }) as [FightActionExtended[], FightActionExtended[], FightActionExtended[]];
        }));
      },
      deleteAction: (volleyIndex: number, actionIndex: number) => {
        set(produce<FightPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) { return v.filter((_, ii) => ii !== actionIndex); }
            return v;
          }) as [FightActionExtended[], FightActionExtended[], FightActionExtended[]];
        }));
      },
      changeSelectedAction: (actionName: string, volleyIndex: number) => {
        set(produce<FightPlannerState>(state => {
          state.selectedAction[volleyIndex] = actionName;
        }));
      },
      toggleActionDetails: (volleyIndex: number, actionIndex: number) => {
        set(produce<FightPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) {
              return v.map((vv, ii) => {
                if (ii === actionIndex) { return { ...vv, open: !vv.open }; }
                return vv;
              });
            }
            return v;
          }) as [FightActionExtended[], FightActionExtended[], FightActionExtended[]];
        }));
      },
      toggleActionVisibility: (volleyIndex: number, actionIndex: number) => {
        set(produce<FightPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) {
              return v.map((vv, ii) => {
                if (ii === actionIndex) { return { ...vv, visible: !vv.visible }; }
                return vv;
              });
            }
            return v;
          }) as [FightActionExtended[], FightActionExtended[], FightActionExtended[]];
        }));
      }
    }),
    { name: "useFightPlannerStore" }
  )
);
