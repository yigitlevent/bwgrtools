import { Button, Grid, Loader, Title } from "@mantine/core";
import { createRef, Fragment, useEffect, useState } from "react";

import { BackCanvas } from "./BackCanvas";
import { FacetControls } from "./FacetControls";
import { FrontCanvas } from "./FrontCanvas";
import { useFontLoading } from "../../../hooks/useFontLoading";
import { useMagicWheel } from "../../../hooks/useMagicWheel";

import type { BandBlock, ElementCategories, OneOfWheelObjects } from "../../../hooks/useMagicWheel";


interface MagicWheelShellProps<T extends OneOfWheelObjects> {
  spellFacets: T;
  bands: Record<keyof T, BandBlock>;
  setBands: React.Dispatch<React.SetStateAction<Record<keyof T, BandBlock>>>;
  isAvailable: (key: string) => boolean;
  selectedElementCategory?: ElementCategories;
  setSelectedElementCategory?: React.Dispatch<React.SetStateAction<ElementCategories>>;
}

export function MagicWheelShell<T extends OneOfWheelObjects>({ spellFacets, bands, setBands, isAvailable, selectedElementCategory, setSelectedElementCategory }: MagicWheelShellProps<T>): React.JSX.Element {
  const { isFontLoaded } = useFontLoading("/fonts/SourceCodePro-SemiBold.woff");

  const wrapperRef = createRef<HTMLDivElement>();
  const canvasRef = createRef<HTMLCanvasElement>();
  const [size, setSize] = useState("0px");
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  const magicWheel = useMagicWheel<T>({ spellFacets, bands, context, selectedElementCategory, setBands, isAvailable });

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

      <FacetControls
        magicWheel={magicWheel}
        spellFacets={spellFacets}
        selectedElementCategory={selectedElementCategory}
        setSelectedElementCategory={setSelectedElementCategory}
      />

      {isFontLoaded ? (
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

              <canvas
                ref={canvasRef}
                height={magicWheel.constants.canvasSize}
                width={magicWheel.constants.canvasSize}
                style={{ position: "absolute", left: 0, top: 0, zIndex: 102, width: "100%" }}
              >
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
