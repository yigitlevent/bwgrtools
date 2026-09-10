import { Button, Group, Title } from "@mantine/core";
import { Fragment, useState } from "react";

import { PracticePlannerCells } from "./PracticePlanner/PracticePlannerCells";
import { PracticePlannerInscribePractice } from "./PracticePlanner/PracticePlannerInscribePractice";
import { PracticePlannerInscribeTimetable } from "./PracticePlanner/PracticePlannerInscribeTimetable";
import { PracticePlannerTimetable } from "./PracticePlanner/PracticePlannerTimetable";
import { usePracticePlannerStore } from "../../../hooks/featureStores/usePracticePlannerStore";


export function PracticePlanner(): React.JSX.Element {
  const { cells } = usePracticePlannerStore();
  const [notification, setNotification] = useState<null | React.JSX.Element>(null);
  const [openModal, setOpenModal] = useState<null | "practice" | "timetable">(null);

  return (
    <Fragment>
      <Title order={3}>Practice Planner</Title>

      <Group mt={16} grow>
        <Button variant="light" onClick={() => { setOpenModal("timetable"); }}>
          Inscribe Timetable
        </Button>

        <Button variant="light" onClick={() => { setOpenModal("practice"); }} disabled={cells.length < 1}>
          Inscribe Practice
        </Button>
      </Group>

      <PracticePlannerTimetable />
      <PracticePlannerCells setNotification={setNotification} />
      <PracticePlannerInscribePractice isOpen={openModal === "practice"} close={() => { setOpenModal(null); }} setNotification={setNotification} />
      <PracticePlannerInscribeTimetable isOpen={openModal === "timetable"} close={() => { setOpenModal(null); }} setNotification={setNotification} />
      {notification}
    </Fragment>
  );
}
