import { MantineProvider } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./components/App";
import { ErrorBoundary } from "./components/Shared/ErrorBoundary";
import { DarkTheme } from "./theme/theme";

import "./theme/cursors.css";
import "./theme/fonts.css";


const RootElement = document.getElementById("root");

if (RootElement === null) {
  throw new Error("Root element not found");
}

createRoot(RootElement)
  .render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark" theme={DarkTheme}>
        <ErrorBoundary>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </MantineProvider>
    </StrictMode>
  );
