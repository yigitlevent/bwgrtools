import { Alert } from "@mantine/core";
import { useEffect } from "react";


export function Notification({ text, severity, onClose }: { text: string; severity: "error" | "warning" | "info" | "success"; onClose: () => void; }): React.JSX.Element {
  const color = severity === "error" ? "red" : severity === "warning" ? "yellow" : severity === "success" ? "green" : "blue";

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => { clearTimeout(timer); };
  }, [onClose]);

  return (
    <Alert
      color={color}
      variant="filled"
      withCloseButton
      onClose={onClose}
      style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 10000 }}
    >
      {text}
    </Alert>
  );
}
