import "@mantine/charts/styles.css";
import { Container, useMantineTheme, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
// eslint-disable-next-line import/no-unresolved
import "mantine-datatable/styles.css";
import { useEffect, useRef } from "react";

import { Content } from "./App/Content";
import { Footer } from "./App/Footer";
import { Header } from "./App/Header";
import { ScrollToTopButton } from "./App/ScrollToTopButton";
import { useCursorStore } from "../hooks/useCursorStore";

import "../theme/overwrite.css";


export function App(): React.JSX.Element {
  const cursorType = useCursorStore(s => s.cursorType);
  const theme = useMantineTheme();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.cursor = theme.other.cursors[cursorType];
    return () => { document.body.style.cursor = ""; };
  }, [cursorType, theme]);

  return (
    <Box ref={scrollRef} style={{ height: "100svh", width: "100svw", overflowY: "auto" }}>
      <Container size="lg">
        <Header />
        <Content scrollRef={scrollRef} />
        <Footer />
        <ScrollToTopButton scrollRef={scrollRef} />
      </Container>
    </Box>
  );
}
