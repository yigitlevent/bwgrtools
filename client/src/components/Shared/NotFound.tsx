import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";


export function NotFound(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <Center style={{ height: "100%" }}>
      <Stack align="center" gap="sm">
        <Title order={2}>404</Title>
        <Text>This page does not exist.</Text>
        <Button variant="outline" onClick={() => void navigate("/diceroller")}>Go home</Button>
      </Stack>
    </Center>
  );
}
