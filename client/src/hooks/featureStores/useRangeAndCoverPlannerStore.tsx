import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type RaCActionExtended = RaCAction & { open: boolean; visible: boolean; };


interface RangeAndCoverPlannerState {
  actions: [undefined | RaCActionExtended, undefined | RaCActionExtended, undefined | RaCActionExtended];
  selectedAction: [string, string, string];

  addAction: (actions: RaCAction[], volleyIndex: number, actionName: undefined | string) => void;
  deleteAction: (volleyIndex: number) => void;
  changeSelectedAction: (actionName: string, volleyIndex: number) => void;
  toggleActionDetails: (volleyIndex: number) => void;
  toggleActionVisibility: (volleyIndex: number) => void;
}

export const useRangeAndCoverPlannerStore = create<RangeAndCoverPlannerState>()(
  devtools(
    set => ({
      actions: [undefined, undefined, undefined],
      selectedAction: ["Charge", "Charge", "Charge"],

      addAction: (actions: RaCAction[], volleyIndex: number, actionName: undefined | string) => {
        const actionMaybe = actions.find(v => v.name === actionName);
        if (!actionMaybe) return;
        const action: RaCActionExtended = { ...actionMaybe, open: false, visible: true };
        set(produce<RangeAndCoverPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) return action;
            else return v;
          }) as [RaCActionExtended, RaCActionExtended, RaCActionExtended];
        }));
      },
      deleteAction: (volleyIndex: number) => {
        set(produce<RangeAndCoverPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) return undefined;
            else return v;
          }) as [RaCActionExtended, RaCActionExtended, RaCActionExtended];
        }));
      },
      changeSelectedAction: (actionName: string, volleyIndex: number) => {
        set(produce<RangeAndCoverPlannerState>(state => {
          state.selectedAction[volleyIndex] = actionName;
        }));
      },
      toggleActionDetails: (volleyIndex: number) => {
        set(produce<RangeAndCoverPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (v && i === volleyIndex) { return { ...v, open: !v.open }; }
            return v;
          }) as [RaCActionExtended, RaCActionExtended, RaCActionExtended];
        }));
      },
      toggleActionVisibility: (volleyIndex: number) => {
        set(produce<RangeAndCoverPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (v && i === volleyIndex) { return { ...v, visible: !v.visible }; }
            return v;
          }) as [RaCActionExtended, RaCActionExtended, RaCActionExtended];
        }));
      }
    }),
    { name: "useRangeAndCoverPlannerStore" }
  )
);
