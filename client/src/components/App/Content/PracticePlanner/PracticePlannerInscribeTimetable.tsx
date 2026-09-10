import { Button, Group, Modal, TextInput } from "@mantine/core";

import { usePracticePlannerStore } from "../../../../hooks/featureStores/usePracticePlannerStore";


interface PracticePlannerInscribeTimetableProps {
  isOpen: boolean;
  close: () => void;
  setNotification: React.Dispatch<React.SetStateAction<React.JSX.Element | null>>;
}

export function PracticePlannerInscribeTimetable({ isOpen, close, setNotification }: PracticePlannerInscribeTimetableProps): React.JSX.Element {
  const { days, hours, changeDays, changeHours, addCells } = usePracticePlannerStore();

  return (
    <Modal opened={isOpen} onClose={close} size="auto" title="Inscribe Timetable">
      <Group justify="center" gap="md" my="16px" wrap="nowrap">
        <TextInput
          label="Number of Days"
          inputMode="numeric"
          pattern="[0-9]*"
          value={days}
          onChange={e => { changeDays(e.target.value, setNotification); }}
          variant="filled"
        />

        <TextInput
          label="Hours per Day"
          inputMode="numeric"
          pattern="[0-9]*"
          value={hours}
          onChange={e => { changeHours(e.target.value, setNotification); }}
          variant="filled"
        />

        <Button variant="outline" onClick={() => { addCells(days, hours); }} style={{ alignSelf: "end" }}>Add Days</Button>
      </Group>
    </Modal>
  );
}
