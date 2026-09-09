import { Button, Group, Title } from "@mantine/core";
import { Fragment, useState } from "react";

import { PracticePlannerCells } from "./PracticePlannerCells";
import { PracticePlannerInscribePractice } from "./PracticePlannerInscribePractice";
import { PracticePlannerInscribeTimetable } from "./PracticePlannerInscribeTimetable";
import { PracticePlannerTimetable } from "./PracticePlannerTimetable";


export function PracticePlanner(): React.JSX.Element {
  const [notification, setNotification] = useState<null | React.JSX.Element>(null);
  const [openModal, setOpenModal] = useState<null | "practice" | "timetable">(null);

  return (
    <Fragment>
      <Title order={3}>Practice Planner</Title>

      <Group mt={16}>
        <Button variant="light" fullWidth onClick={() => { setOpenModal("timetable"); }}>
          Inscribe Timetable
        </Button>

        <Button variant="light" fullWidth onClick={() => { setOpenModal("practice"); }}>
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
