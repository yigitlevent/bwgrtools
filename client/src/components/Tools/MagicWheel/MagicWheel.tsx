import { Button, Grid, Loader, Title } from "@mantine/core";
import { createRef, Fragment, useEffect, useState } from "react";

import { BackCanvas } from "./BackCanvas";
import { FacetControls } from "./FacetControls";
import { FrontCanvas } from "./FrontCanvas";
import codeFont from "../../../assets/fonts/SourceCodePro-SemiBold.woff";
import { useRulesetStore } from "../../../hooks/apiStores/useRulesetStore";
import { useFontLoading } from "../../../hooks/useFontLoading";
import { useMagicWheel } from "../../../hooks/useMagicWheel";

import type { BandBlock } from "../../../hooks/useMagicWheel";


export function MagicWheel(): React.JSX.Element {
  const { isFontLoaded } = useFontLoading(codeFont);

  const wrapperRef = createRef<HTMLDivElement>();
  const canvasRef = createRef<HTMLCanvasElement>();
  const [size, setSize] = useState("0px");
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  const { spellFacets } = useRulesetStore();

  const [bands, setBands] =
    useState<Record<keyof SpellFacets, BandBlock>>({
      origins: { index: 0, angle: 2 * Math.PI / spellFacets.origins.length, currentAmount: 0, targetAmount: 0, items: spellFacets.origins.map(v => v.name) },
      duration: { index: 1, angle: 2 * Math.PI / spellFacets.duration.length, currentAmount: 0, targetAmount: 0, items: spellFacets.duration.map(v => v.name) },
      impetus: { index: 2, angle: 2 * Math.PI / spellFacets.impetus.length, currentAmount: 0, targetAmount: 0, items: spellFacets.impetus.map(v => v.name) },
      elements: { index: 3, angle: 2 * Math.PI / spellFacets.elements.length, currentAmount: 0, targetAmount: 0, items: spellFacets.elements.map(v => v.name) },
      areaOfEffects: { index: 4, angle: 2 * Math.PI / spellFacets.areaOfEffects.length, currentAmount: 0, targetAmount: 0, items: spellFacets.areaOfEffects.map(v => v.name) }
    });

  const magicWheel = useMagicWheel<SpellFacets, keyof SpellFacets>({ spellFacets, bands, context, setBands, isAvailable: () => true });

  useEffect(() => {
    if (wrapperRef.current) setSize(window.getComputedStyle(wrapperRef.current).width);
  }, [wrapperRef]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) setContext(context);
  }, [canvasRef]);

  return (
    <Fragment>
      <Title order={3}>Magic Wheel</Title>

      {!magicWheel.facetsSet ? (
        <FacetControls
          magicWheel={magicWheel}
          spellFacets={spellFacets}
          setFacetsSet={magicWheel.setFacetsSet}
        />
      ) : isFontLoaded ? (
        <Grid columns={1} align="center" justify="center" mt="md">
          {magicWheel.prayed ? (
            <Button
              variant="outline"
              disabled={magicWheel.isRotating}
              onClick={() => { magicWheel.reset(); }}
              fullWidth
            >
              Try again
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={magicWheel.isRotating}
              onClick={() => { magicWheel.setTargetAmounts(); }}
              fullWidth
            >
              Pray to the Lady Luck
            </Button>
          )}

          <Grid.Col span={1}>
            <div
              ref={wrapperRef}
              style={{
                maxWidth: "100%",
                width: (size === "0px") ? "580px" : size,
                height: (size === "0px") ? "580px" : size,
                position: "relative",
                margin: "0 auto",
                zIndex: 100
              }}
            >
              <BackCanvas constants={magicWheel.constants} />

              <canvas ref={canvasRef} height={magicWheel.constants.canvasSize} width={magicWheel.constants.canvasSize} style={{ position: "absolute", left: 0, top: 0, zIndex: 102, width: "100%" }}>
                Your browser does not support canvas.
              </canvas>

              <FrontCanvas constants={magicWheel.constants} />
            </div>
          </Grid.Col>
        </Grid>
      ) : <Loader />}
    </Fragment>
  );
}
