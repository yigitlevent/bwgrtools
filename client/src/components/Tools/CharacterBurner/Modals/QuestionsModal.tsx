import { Checkbox, Grid, Modal, Text } from "@mantine/core";

import { useCharacterBurnerSpecialStore } from "../../../../hooks/featureStores/CharacterBurnerStores/useCharacterBurnerSpecial";


export function QuestionsModal({ isOpen, close }: { isOpen: boolean; close: () => void; }): React.JSX.Element {
  const { questions, switchQuestion, hasQuestionTrue } = useCharacterBurnerSpecialStore();

  return (
    <Modal opened={isOpen} onClose={() => { close(); }} size="800px">
      <Grid columns={1} gap="md" align="center">
        {questions
          .map((v, i) => {
            return (
              <Grid.Col key={i} span={1}>
                <Checkbox checked={hasQuestionTrue(v.id)} onChange={() => { switchQuestion(v.id); }} style={{ display: "inline-block" }} />

                <Text style={{ display: "inline", margin: "0 0 0 8px" }}>
                  {v.question}
                </Text>
              </Grid.Col>
            );
          })}
      </Grid>
    </Modal>
  );
}
