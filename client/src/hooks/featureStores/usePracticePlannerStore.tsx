import { produce } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Notification } from "../../components/Shared/Notification";
import { Clamp } from "../../utils/Clamp";

import type { Dispatch, SetStateAction } from "react";


export interface PracticePlaced { practiceId: string; cellId: number; name: string; testType: string; hours: number; }
export interface PracticeCell { maxHours: number; remaining: number; placed: PracticePlaced[]; }

interface PracticePlannerState {
  nextId: number;
  days: number;
  hours: number;
  cells: PracticeCell[];
  marks: {
    value: number;
    label: string;
  }[];

  changeDays: (value: string, setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => void;
  changeHours: (value: string, setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => void;
  addCells: (days: number, hours: number) => void;
  deleteCell: (cellIndex: number) => void;
  changeCellHour: (cellIndex: number, change: 1 | -1, cells: PracticeCell[], setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => void;
  addPractice: (practiceId: string, startEndDay: [number, number], hours: number, name: string, testType: string, setNotification: React.Dispatch<React.SetStateAction<React.JSX.Element | null>>) => void;
  deletePractice: (cellIndex: number, practiceIndex: number) => void;
}

export const usePracticePlannerStore = create<PracticePlannerState>()(
  devtools(
    (set, get) => ({
      nextId: 0,
      days: 7,
      hours: 8,
      cells: [],
      marks: [],

      changeDays: (value: string, setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => {
        const parsed = value === "" ? 0 : parseInt(value);
        const clamped = Clamp(parsed, 1, 999);

        set(produce<PracticePlannerState>(state => {
          state.days = clamped;
        }));

        if (parsed !== clamped) {
          setNotification(<Notification text={`Number of Days must be between 1 and 999. Set to ${clamped.toString()}.`} severity="warning" onClose={() => { setNotification(null); }} />);
        }
      },

      changeHours: (value: string, setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => {
        const parsed = value === "" ? 0 : parseInt(value);
        const clamped = Clamp(parsed, 1, 24);

        set(produce<PracticePlannerState>(state => {
          state.hours = clamped;
        }));

        if (parsed !== clamped) {
          setNotification(<Notification text={`Hours per Day must be between 1 and 24. Set to ${clamped.toString()}.`} severity="warning" onClose={() => { setNotification(null); }} />);
        }
      },

      addCells: (days: number, hours: number) => {
        set(produce<PracticePlannerState>(state => {
          const newCells = [...state.cells];
          newCells.push(...[...Array<number>(days)].map(() => { return { maxHours: hours, remaining: hours, placed: [] }; }));
          state.cells = newCells;

          if (state.cells.length > 0) {
            const marks =
              Array
                .from(Array(Math.floor(state.cells.length)))
                .map((_, i) => ({ value: i + 1, label: (i + 1).toString() }));

            if (state.cells.length < 30) state.marks = marks.filter((v, i) => i === 0 || v.value % 5 === 0);
            else if (state.cells.length < 90) state.marks = marks.filter((v, i) => i === 0 || v.value % 10 === 0);
            else state.marks = marks.filter((v, i) => i === 0 || v.value % 30 === 0);
          }
        }));
      },

      deleteCell: (cellIndex: number) => {
        set(produce<PracticePlannerState>(state => {
          const newCells = state.cells;
          newCells.splice(cellIndex, 1);
          state.cells = newCells;

          if (state.cells.length > 0) {
            const marks =
              Array
                .from(Array(Math.floor(state.cells.length)))
                .map((_, i) => ({ value: i + 1, label: (i + 1).toString() }));

            if (state.cells.length < 30) state.marks = marks.filter((v, i) => i === 0 || v.value % 5 === 0);
            else if (state.cells.length < 90) state.marks = marks.filter((v, i) => i === 0 || v.value % 10 === 0);
            else state.marks = marks.filter((v, i) => i === 0 || v.value % 30 === 0);
          }
        }));
      },

      changeCellHour: (cellIndex: number, change: 1 | -1, cells: PracticeCell[], setNotification: Dispatch<SetStateAction<React.JSX.Element | null>>) => {
        if (cells[cellIndex].remaining === 0 && change === -1) {
          setNotification(<Notification text="Cannot reduce hours from day. It is used by practices." severity="error" onClose={() => { setNotification(null); }} />);
        }
        else {
          set(produce<PracticePlannerState>(state => {
            const newCells = state.cells;
            state.cells = newCells.map((v, i) => {
              if (i === cellIndex && ((v.maxHours < 24 && change > 0) || (v.maxHours > 1 && change < 0))) {
                return { ...v, maxHours: v.maxHours + change, remaining: v.remaining + change };
              }
              return v;
            });
          }));
          setNotification(null);
        }
      },

      addPractice: (practiceId: string, startEndDay: [startDay: number, endDay: number], hours: number, name: string, testType: string, setNotification: React.Dispatch<React.SetStateAction<React.JSX.Element | null>>) => {
        const { nextId, cells } = get();

        if (startEndDay[0] > startEndDay[1]) {
          setNotification(<Notification text="Start day must be before or at the same day as the end day." severity="error" onClose={() => { setNotification(null); }} />);
        }
        else if (startEndDay[0] < 1 || startEndDay[1] > cells.length) {
          setNotification(<Notification text="Start and end day must be within the timetable." severity="error" onClose={() => { setNotification(null); }} />);
        }
        else if (name === "") {
          setNotification(<Notification text="Name must not be empty." severity="error" onClose={() => { setNotification(null); }} />);
        }
        else {
          for (let i = startEndDay[0] - 1; i < startEndDay[1]; i++) {
            if (cells[i].remaining - hours < 0) {
              setNotification(<Notification text={`Cannot fit practice into the day ${(i + 1).toString()}. This practice takes ${hours.toString()} hours.`} severity="error" onClose={() => { setNotification(null); }} />);
              return;
            }
            else if (cells[i].placed.some(cell => cell.name === name)) {
              setNotification(<Notification text={`Cannot place practice to day ${(i + 1).toString()} as another practice for the same Skill, Attribute or Stat already exists.`} severity="error" onClose={() => { setNotification(null); }} />);
              return;
            }
          }

          set(produce<PracticePlannerState>(state => {
            state.nextId = nextId + 1;

            state.cells = [...state.cells].map((v, i) => {
              if (i >= startEndDay[0] - 1 && i <= startEndDay[1] - 1) {
                const practice: PracticePlaced = { practiceId, cellId: nextId, name, testType, hours };
                const placed = [...v.placed, practice];
                const remainingHours = v.remaining - hours;
                return { ...v, remaining: remainingHours, placed: placed };
              }
              return v;
            });
          }));
          setNotification(null);
        }
      },

      deletePractice: (cellIndex: number, practiceIndex: number) => {
        set(produce<PracticePlannerState>(state => {
          const newCells = state.cells;

          state.cells = newCells.map((v, i) => {
            if (i === cellIndex) {
              const placed = v.placed.filter((_, i) => i !== practiceIndex);
              const hours = v.remaining + v.placed[practiceIndex].hours;
              return { ...v, remaining: hours, placed: placed };
            }
            return v;
          });
        }));
      }
    }),
    { name: "usePracticePlannerStore" }
  )
);
