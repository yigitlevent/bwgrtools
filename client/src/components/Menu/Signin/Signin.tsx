import { Button, Grid, Modal, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import { useCallback, useState } from "react";

import { useUserStore } from "../../../hooks/apiStores/useUserStore";
import { ValidateEmail } from "../../../utils/Validate";


export function Signin({ open, handleClose }: { open: boolean; handleClose: (open: boolean) => void; }): React.JSX.Element {
  const { fetching, signin } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  const isFilled = [email, password].every(v => v.length > 0);
  const hasErrors = [emailError, passwordError].some(v => v !== undefined);

  const changeValue = useCallback((type: "email" | "password", value: string): void => {
    const sanitizedValue = value.trim();
    if (type === "email") {
      setEmail(sanitizedValue);
      if (!ValidateEmail(sanitizedValue)) setEmailError("Please enter a valid email.");
      else setEmailError(undefined);
    }
    else {
      setPassword(sanitizedValue);
    }
  }, []);

  const handleSignin = (): void => {
    if (email.length === 0) setEmailError("Please enter your email.");

    if (password.length === 0) setPasswordError("Please enter your password.");
    else setPasswordError(undefined);

    if (isFilled && !hasErrors) signin({ email, password }, handleClose);
  };

  return (
    <Modal opened={open} onClose={() => { handleClose(false); }} withCloseButton={false} zIndex={123456789}>
      <Paper p="xl" style={{ maxWidth: "400px", margin: "6px" }}>
        <Title order={3}>Sign in</Title>

        <Grid gap="md" columns={1} justify="center" mt="md">
          <Grid.Col span={1}>
            <TextInput
              label="Email"
              variant="filled"
              required
              value={email}
              onChange={v => { changeValue("email", v.target.value); }}
              error={emailError}
            />
          </Grid.Col>

          <Grid.Col span={1}>
            <PasswordInput
              label="Password"
              variant="filled"
              required
              value={password}
              onChange={v => { changeValue("password", v.target.value); }}
              error={passwordError}
            />
          </Grid.Col>

          <Grid.Col span={1}>
            <Button variant="outline" fullWidth onClick={() => { handleSignin(); }} disabled={hasErrors || fetching}>Sign in</Button>
          </Grid.Col>
        </Grid>
      </Paper>
    </Modal>
  );
}
