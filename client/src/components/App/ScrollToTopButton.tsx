import { Affix, Transition, Tooltip, ActionIcon } from "@mantine/core";
import { ArrowUpIcon } from "lucide-react";
import { useState, useEffect } from "react";


interface ScrollToTopButtonProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollToTopButton({ scrollRef }: ScrollToTopButtonProps): React.JSX.Element {
  const [scrollY, setScrollY] = useState(0);

  const scrollToTop = (): void => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => {
    const el = scrollRef.current;
    if (el === null) return;
    const onScroll = (): void => { setScrollY(el.scrollTop); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); };
  }, [scrollRef]);

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="slide-up" mounted={scrollY > 0}>
        {transitionStyles => (
          <Tooltip color="gray" label="Scroll to top">
            <ActionIcon size="lg" variant="light" style={transitionStyles} onClick={scrollToTop}>
              <ArrowUpIcon />
            </ActionIcon>
          </Tooltip>
        )}
      </Transition>
    </Affix>
  );
}
