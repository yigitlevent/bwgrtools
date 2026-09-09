import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


export type DoWActionExtended = DoWAction & { open: boolean; visible: boolean; };

interface DuelOfWitsPlannerState {
  actions: [undefined | DoWActionExtended, undefined | DoWActionExtended, undefined | DoWActionExtended];
  selectedAction: [string, string, string];

  addAction: (actions: DoWAction[], volleyIndex: number, actionName: undefined | string) => void;
  deleteAction: (volleyIndex: number) => void;
  changeSelectedAction: (actionName: string, volleyIndex: number) => void;
  toggleActionDetails: (volleyIndex: number) => void;
  toggleActionVisibility: (volleyIndex: number) => void;
}

export const useDuelOfWitsPlannerStore = create<DuelOfWitsPlannerState>()(
  devtools(
    set => ({
      actions: [undefined, undefined, undefined],
      selectedAction: ["Avoid the Topic", "Avoid the Topic", "Avoid the Topic"],

      addAction: (actions: DoWAction[], volleyIndex: number, actionName: undefined | string) => {
        const actionMaybe = actions.find(v => v.name === actionName);
        if (actionMaybe === undefined) return;
        const action: DoWActionExtended = { ...actionMaybe, open: false, visible: true };
        set(produce<DuelOfWitsPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) return action;
            else return v;
          }) as [DoWActionExtended, DoWActionExtended, DoWActionExtended];
        }));
      },
      deleteAction: (volleyIndex: number) => {
        set(produce<DuelOfWitsPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (i === volleyIndex) return undefined;
            else return v;
          }) as [DoWActionExtended, DoWActionExtended, DoWActionExtended];
        }));
      },
      changeSelectedAction: (actionName: string, volleyIndex: number) => {
        set(produce<DuelOfWitsPlannerState>(state => {
          state.selectedAction[volleyIndex] = actionName;
        }));
      },
      toggleActionDetails: (volleyIndex: number) => {
        set(produce<DuelOfWitsPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (v !== undefined && i === volleyIndex) { return { ...v, open: !v.open }; }
            return v;
          }) as [DoWActionExtended, DoWActionExtended, DoWActionExtended];
        }));
      },
      toggleActionVisibility: (volleyIndex: number) => {
        set(produce<DuelOfWitsPlannerState>(state => {
          const newActions = state.actions;
          state.actions = newActions.map((v, i) => {
            if (v !== undefined && i === volleyIndex) { return { ...v, visible: !v.visible }; }
            return v;
          }) as [DoWActionExtended, DoWActionExtended, DoWActionExtended];
        }));
      }
    }),
    { name: "useDuelOfWitsPlannerStore" }
  )
);
