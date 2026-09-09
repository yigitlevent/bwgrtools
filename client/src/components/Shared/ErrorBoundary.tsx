import { Alert, Button, Center, Stack, Text } from "@mantine/core";
import { Component } from "react";

import type { ErrorInfo, ReactNode } from "react";


interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors anywhere below it (e.g. the ruleset store's getX lookups throwing on
 * an id that no longer resolves) so the app shows a recoverable message instead of going blank.
 * Must be a class component - React only supports error boundaries via getDerivedStateFromError.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  private readonly reload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.error === null) return this.props.children;

    return (
      <Center style={{ height: "100svh" }}>
        <Stack align="center" gap="sm" maw={480}>
          <Alert color="red" title="Something went wrong" w="100%">
            <Text size="sm">
              An unexpected error occurred and this page cannot continue. If you were burning a character, your
              progress up to a few seconds ago has been autosaved in this browser.
            </Text>
          </Alert>

          <Button variant="outline" onClick={this.reload}>Reload</Button>
        </Stack>
      </Center>
    );
  }
}
