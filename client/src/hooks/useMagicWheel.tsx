import { useCallback, useEffect, useRef, useState } from "react";

import { RandomNumber } from "../utils/RandomNumber";


export interface BandBlock {
  index: number;
  angle: number;
  currentAmount: number;
  targetAmount: number;
  items: string[];
}

export interface MagicWheelConstants {
  canvasSize: number;
  circleRadius: number;
  circleOffset: number;
  innerCircleRadius: number;
  textOffset: number;
  rotationSpeed: number;
  ringCount: number;
}

export type OneOfWheelObjects = SpellFacets | AltSpellFacets;
export type OneOfWheelObjectKeys = keyof SpellFacets | keyof AltSpellFacets;
export type ElementCategories = "primeElements" | "lowerElements" | "higherElements";

interface UseMagicWheelProps<T extends OneOfWheelObjects> {
  spellFacets: T;
  bands: Record<keyof T, BandBlock>;
  context: CanvasRenderingContext2D | undefined;
  selectedElementCategory?: ElementCategories;
  isAvailable: (key: string) => boolean;
  setBands: React.Dispatch<React.SetStateAction<Record<keyof T, BandBlock>>>;
}

export interface UseMagicWheelReturn<T extends OneOfWheelObjects> {
  constants: MagicWheelConstants;
  isRotating: boolean;
  facetsSet: boolean;
  prayed: boolean;
  elementId: dat.SpellElementFacetId;
  impetusId: dat.SpellImpetusFacetId;
  durationId: dat.SpellDurationFacetId;
  originId: dat.SpellOriginFacetId;
  areaOfEffectId: dat.SpellAreaOfEffectFacetId;
  setTargetAmounts: (steps?: number, direction?: number) => void;
  setFacet: (facet: keyof T, value: number) => void;
  setPrayed: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
}

export function useMagicWheel<T extends OneOfWheelObjects>({ spellFacets, bands, context, selectedElementCategory, isAvailable, setBands }: UseMagicWheelProps<T>): UseMagicWheelReturn<T> {
  const [constants] = useState<MagicWheelConstants>({ canvasSize: 580, circleRadius: 32, circleOffset: 90, innerCircleRadius: 200, textOffset: 100, rotationSpeed: 0.04, ringCount: 6 });
  const [isRotating, setIsRotating] = useState(true);
  const [facetsSet, setFacetsSet] = useState(false);
  const [prayed, setPrayed] = useState(false);

  const [elementId, setElementId] = useState(0 as dat.SpellElementFacetId);
  const [impetusId, setImpetusId] = useState(0 as dat.SpellImpetusFacetId);
  const [durationId, setDurationId] = useState(0 as dat.SpellDurationFacetId);
  const [originId, setOriginId] = useState(0 as dat.SpellOriginFacetId);
  const [areaOfEffectId, setAreaOfEffectId] = useState(0 as dat.SpellAreaOfEffectFacetId);

  const mapBands = useCallback((getTargetAmount: (key: string, band: BandBlock) => number): Record<keyof T, BandBlock> =>
    Object.entries<BandBlock>(bands).reduce<Record<keyof T, BandBlock>>((acc, [key, band]) => {
      acc[key as keyof T] = { ...band, targetAmount: getTargetAmount(key, band) };
      return acc;
    }, {} as Record<keyof T, BandBlock>), [bands]);

  const setFacet = useCallback((facet: keyof T, value?: number) => {
    const facetOptions = spellFacets[facet] as { id: number; }[];
    const facetIndex = facetOptions.findIndex(v => v.id === value);
    const hasValue = value !== undefined;

    if (facetIndex > -1) {
      setBands(prevBands => ({ ...prevBands, [facet]: { ...prevBands[facet], targetAmount: -facetIndex } }));

      switch (facet) {
        case "areaOfEffects":
          setAreaOfEffectId((hasValue ? value : 0) as dat.SpellAreaOfEffectFacetId);
          break;
        case "duration":
          setDurationId((hasValue ? value : 0) as dat.SpellDurationFacetId);
          break;
        case "impetus":
          setImpetusId((hasValue ? value : 0) as dat.SpellImpetusFacetId);
          break;
        case "origins":
          setOriginId((hasValue ? value : 0) as dat.SpellOriginFacetId);
          break;
        case "elements":
        case "primeElements":
        case "lowerElements":
        case "higherElements":
          if (selectedElementCategory === undefined || facet === selectedElementCategory) setElementId((hasValue ? value : 0) as dat.SpellElementFacetId);
          break;
      }
    }

    setFacetsSet(true);
    setIsRotating(true);
  }, [selectedElementCategory, setBands, spellFacets]);

  const setTargetAmounts = useCallback((steps?: number, direction?: number) => {
    setPrayed(true);
    setIsRotating(true);

    const getRandomRotation = (): number =>
      steps !== undefined && direction !== undefined ? steps * direction : ((Math.random() > 0.5) ? 1 : -1) * RandomNumber(1, 6);

    const revisedBands = mapBands((key, band) => isAvailable(key) ? band.targetAmount + getRandomRotation() : band.currentAmount);

    setBands(revisedBands);
  }, [isAvailable, mapBands, setBands]);

  const reset = useCallback(() => {
    setAreaOfEffectId(spellFacets.areaOfEffects[0].id);
    if ("elements" in spellFacets) setElementId(spellFacets.elements[0].id);
    else if (selectedElementCategory !== undefined) setElementId(spellFacets[selectedElementCategory][0].id);
    setImpetusId(spellFacets.impetus[0].id);
    setDurationId(spellFacets.duration[0].id);
    setOriginId(spellFacets.origins[0].id);
    setBands(mapBands(() => 0));
    setFacetsSet(false);
    setPrayed(false);
    setIsRotating(true);
  }, [mapBands, selectedElementCategory, setBands, spellFacets]);

  const bandsRef = useRef(bands);
  useEffect(() => { bandsRef.current = bands; }, [bands]);

  useEffect(() => {
    if (context === undefined || !isRotating) return;

    let animationFrameId = 0;

    const step = (): void => {
      let allSettled = true;

      for (const key in bandsRef.current) {
        const band = bandsRef.current[key as keyof T];

        if (!isAvailable(key)) continue;

        if (Math.abs(band.currentAmount - band.targetAmount) <= constants.rotationSpeed) band.currentAmount = band.targetAmount;
        else if (band.currentAmount < band.targetAmount) band.currentAmount += constants.rotationSpeed;
        else band.currentAmount -= constants.rotationSpeed;

        if (band.currentAmount !== band.targetAmount) allSettled = false;
      }

      context.clearRect(0, 0, constants.canvasSize, constants.canvasSize);

      for (const key in bandsRef.current) {
        const band = bandsRef.current[key as keyof T];

        if (!isAvailable(key)) continue;

        const bandIndex = band.index;

        const distancePerCharacter = constants.circleRadius * (bandIndex + 1) + constants.textOffset;
        const anglePerCharacter = 8 * (1 / distancePerCharacter);

        const textStartAngles = band.items.map<[string, number]>((name, itemIndex) => {
          const initialStart = band.currentAmount * band.angle;
          const itemMargin = itemIndex * band.angle;
          const halfBack = anglePerCharacter + ((anglePerCharacter * name.length) / 2);
          return [name, (initialStart + itemMargin - halfBack)];
        });

        textStartAngles.forEach(([name, startAngle]) => {
          context.save();
          context.translate(constants.canvasSize / 2, constants.canvasSize / 2);
          context.rotate(startAngle);

          for (const [_, char] of Array.from(name).entries()) {
            context.rotate(anglePerCharacter);
            context.save();
            context.translate(0, -1 * distancePerCharacter);
            context.font = "14px 'Code'";
            context.fillStyle = "white";
            context.fillText(char.toLowerCase(), 0, 0);
            context.restore();
          }

          context.restore();
        });
      }

      if (allSettled) {
        setBands({ ...bandsRef.current });
        setIsRotating(false);
      }
      else animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => { cancelAnimationFrame(animationFrameId); };
  }, [constants.canvasSize, constants.circleRadius, constants.rotationSpeed, constants.textOffset, isAvailable, isRotating, context, setBands]);

  return {
    constants,
    isRotating,
    facetsSet,
    prayed,
    elementId,
    impetusId,
    durationId,
    originId,
    areaOfEffectId,
    setTargetAmounts,
    setFacet,
    setPrayed,
    reset
  };
}
