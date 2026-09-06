import { Button, Grid, Modal, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import { useCallback, useState } from "react";

import { useUserStore } from "../../../hooks/apiStores/useUserStore";
import { ValidateEmail, ValidatePassword } from "../../../utils/Validate";


export function Signup({ open, handleClose }: { open: boolean; handleClose: (open: boolean) => void; }): React.JSX.Element {
  const { fetching, signup } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [passwordRepeatError, setPasswordRepeatError] = useState<string | undefined>(undefined);

  const isFilled = [email, password, passwordRepeat].every(v => v.length > 0);
  const hasErrors = [emailError, passwordError, passwordRepeatError].some(v => v !== undefined);

  const changeValue = useCallback((type: "email" | "password" | "passwordRepeat", value: string) => {
    const sanitizedValue = value.trim();
    if (type === "email") {
      setEmail(sanitizedValue);
      if (!ValidateEmail(sanitizedValue)) setEmailError("Please enter a valid email.");
      else setEmailError(undefined);
    }
    else if (type === "password") {
      setPassword(sanitizedValue);
      if (!ValidatePassword(sanitizedValue)) setPasswordError("Password must be between 8 and 64 characters, with at least one letter and one number.");
      else setPasswordError(undefined);
    }
    else {
      setPasswordRepeat(sanitizedValue);
      if (password !== sanitizedValue) setPasswordRepeatError("Passwords don't match.");
      else setPasswordRepeatError(undefined);
    }
  }, [password]);

  const handleSignup = (): void => {
    if (email.length === 0) setEmailError("Please enter an email.");
    if (password.length === 0) setPasswordError("Please enter a password.");

    if (isFilled && !hasErrors) signup({ email, password }, handleClose);
  };

  return (
    <Modal opened={open} onClose={() => { handleClose(false); }} withCloseButton={false} zIndex={123456789}>
      <Paper p="xl" style={{ maxWidth: "400px", margin: "6px" }}>
        <Title order={3}>Sign up</Title>

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
            <PasswordInput
              label="Password Repeat"
              variant="filled"
              required
              value={passwordRepeat}
              onChange={v => { changeValue("passwordRepeat", v.target.value); }}
              error={passwordRepeatError}
            />
          </Grid.Col>

          <Grid.Col span={1}>
            <Button variant="outline" fullWidth onClick={() => { handleSignup(); }} disabled={!isFilled || hasErrors || fetching}>Sign up</Button>
          </Grid.Col>
        </Grid>
      </Paper>
    </Modal>
  );
}
