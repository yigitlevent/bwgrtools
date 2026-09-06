import { Check, X } from "lucide-react";


export function StepIcon({ active, completed }: { active?: boolean; completed?: boolean; }): React.JSX.Element {
  return (
    <div style={{ display: "flex", height: 22, alignItems: "center" }}>
      {completed ? <Check size={18} color="var(--mantine-color-green-6)" style={{ marginLeft: 4 }} /> : active ? <div style={{ width: 8, height: 8, marginLeft: 8, borderRadius: "50%", backgroundColor: "var(--mantine-color-yellow-6)" }} /> : <X size={18} color="var(--mantine-color-red-6)" style={{ marginLeft: 4 }} />}
    </div>
  );
}
