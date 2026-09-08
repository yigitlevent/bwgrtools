import { MantineProvider } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./components/App";
import { DarkTheme } from "./theme/theme";

import "./theme/cursors.css";
import "./theme/fonts.css";


const RootElement = document.getElementById("root");

if (!RootElement) {
  throw new Error("Root element not found");
}

createRoot(RootElement)
  .render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark" theme={DarkTheme}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </StrictMode>
  );
