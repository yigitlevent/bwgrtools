import { Square, SquareCheck } from "lucide-react";


interface PracticePlannerCellIconProps {
  isDayFull: "empty" | "partial" | "full";
  isCellFull: boolean;
}

export function PracticePlannerCellIcon({ isDayFull, isCellFull }: PracticePlannerCellIconProps): React.JSX.Element {
  const cellColor =
    isDayFull === "empty" ? "var(--mantine-color-green-6)" : isDayFull === "partial" ? "var(--mantine-color-yellow-6)" : "var(--mantine-color-red-6)";

  if (isCellFull) {
    return <SquareCheck size={16} color={cellColor} />;
  }
  else {
    return <Square size={16} color={cellColor} />;
  }
}

