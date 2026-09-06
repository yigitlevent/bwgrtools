import { useCallback, useEffect, useState } from "react";

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
}

export type OneOfWheelObjects = SpellFacets | AltSpellFacets;
export type OneOfWheelObjectKeys = keyof SpellFacets | keyof AltSpellFacets;
export type ElementCategories = "primeElements" | "lowerElements" | "higherElements";

interface UseMagicWheelProps<T extends OneOfWheelObjects, P extends OneOfWheelObjectKeys> {
  spellFacets: T;
  bands: Record<P, BandBlock>;
  context: CanvasRenderingContext2D | undefined;
  selectedElementCategory?: ElementCategories;
  isAvailable: (key: string) => boolean;
  setBands: React.Dispatch<React.SetStateAction<Record<P, BandBlock>>>;
}

export interface UseMagicWheelReturn<T extends OneOfWheelObjects, P extends OneOfWheelObjectKeys> {
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
  setIsRotating: (rotating: boolean, resetAll: boolean, bands?: Record<P, BandBlock>, facets?: T) => void;
  setFacet: (facet: P, value: number) => void;
  setFacetsSet: React.Dispatch<React.SetStateAction<boolean>>;
  setPrayed: React.Dispatch<React.SetStateAction<boolean>>;
  reset: () => void;
}

export function useMagicWheel<T extends OneOfWheelObjects, P extends OneOfWheelObjectKeys>({ spellFacets, bands, context, selectedElementCategory, isAvailable, setBands }: UseMagicWheelProps<T, P>): UseMagicWheelReturn<T, P> {
  const [constants] = useState<MagicWheelConstants>({ canvasSize: 580, circleRadius: 32, circleOffset: 90, innerCircleRadius: 200, textOffset: 100, rotationSpeed: 0.04 });
  const [isRotating, setIsRotating] = useState(true);
  const [facetsSet, setFacetsSet] = useState(false);
  const [prayed, setPrayed] = useState(false);

  const [elementId, setElementId] = useState(0 as dat.SpellElementFacetId);
  const [impetusId, setImpetusId] = useState(0 as dat.SpellImpetusFacetId);
  const [durationId, setDurationId] = useState(0 as dat.SpellDurationFacetId);
  const [originId, setOriginId] = useState(0 as dat.SpellOriginFacetId);
  const [areaOfEffectId, setAreaOfEffectId] = useState(0 as dat.SpellAreaOfEffectFacetId);

  const setFacet = useCallback((facet: P, value?: number) => {
    const horrible = spellFacets[facet as keyof T] as (T & { id: P; })[];
    const facetIndex = horrible.findIndex(v => (v.id as unknown as number) === value);
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
          if (facet === selectedElementCategory) setElementId((hasValue ? value : 0) as dat.SpellElementFacetId);
          else if (selectedElementCategory === undefined) setElementId((hasValue ? value : 0) as dat.SpellElementFacetId);
          break;
      }
    }
  }, [selectedElementCategory, setBands, spellFacets]);

  const setTargetAmounts = useCallback((steps?: number, direction?: number) => {
    setPrayed(true);
    setIsRotating(true);

    const getRandomRotation = (): number =>
      steps && direction ? steps * direction : ((Math.random() > 0.5) ? 1 : -1) * RandomNumber(1, 6);

    const getTarget = (band: BandBlock): number => {
      const rand = getRandomRotation();
      return band.targetAmount + rand;
    };

    const revisedBands =
      Object.entries<BandBlock>(bands).reduce<Record<P, BandBlock>>((acc, [key, band]) => {
        if (!isAvailable(key)) acc[key as P] = { ...band, targetAmount: band.currentAmount };
        else acc[key as P] = { ...band, targetAmount: getTarget(band) };
        return acc;
      }, {} as Record<P, BandBlock>);

    setBands(revisedBands);
  }, [bands, isAvailable, setBands]);

  const reset = useCallback(() => {
    setAreaOfEffectId(spellFacets.areaOfEffects[0].id);
    if ("elements" in spellFacets) setElementId(spellFacets.elements[0].id);
    else if (selectedElementCategory) setElementId(spellFacets[selectedElementCategory][0].id);
    setImpetusId(spellFacets.impetus[0].id);
    setDurationId(spellFacets.duration[0].id);
    setOriginId(spellFacets.origins[0].id);
    const revisedBands =
      Object.entries<BandBlock>(bands).reduce<Record<P, BandBlock>>((acc, [key, band]) => {
        acc[key as P] = { ...band, targetAmount: 0 };
        return acc;
      }, {} as Record<P, BandBlock>);
    setBands(revisedBands);
    setFacetsSet(false);
    setPrayed(false);
    setIsRotating(true);
  }, [bands, selectedElementCategory, setBands, spellFacets]);

  const doRotation = useCallback((anim: number): void => {
    if (context) {
      for (const key in bands) {
        const band = bands[key as P];

        if (isAvailable(key)) {
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
              context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--mantine-primary-color-light");
              context.fillText(char.toLowerCase(), 0, 0);
              context.restore();
            }

            context.restore();
          });

          if (band.currentAmount.toFixed(1) === band.targetAmount.toFixed(1)) setBands(prevBands => ({ ...prevBands, [key]: { ...band, currentAmount: band.targetAmount } }));
          else if (band.currentAmount < band.targetAmount) setBands(prevBands => ({ ...prevBands, [key]: { ...band, currentAmount: band.currentAmount + constants.rotationSpeed } }));
          else if (band.currentAmount > band.targetAmount) setBands(prevBands => ({ ...prevBands, [key]: { ...band, currentAmount: band.currentAmount - constants.rotationSpeed } }));
          else setBands(prevBands => ({ ...prevBands, [key]: { ...band, currentAmount: band.targetAmount } }));
        }
      }

      if (isRotating && Object.values<BandBlock>(bands).every(band => band.currentAmount === band.targetAmount)) {
        cancelAnimationFrame(anim);
        setIsRotating(false);
      }
    }
  }, [bands, constants.canvasSize, constants.circleRadius, constants.rotationSpeed, constants.textOffset, isAvailable, isRotating, context, setBands]);

  useEffect(() => {
    let anim = 0;

    if (context && isRotating) {
      context.clearRect(0, 0, constants.canvasSize, constants.canvasSize);
      const dr = doRotation.bind(null, anim);
      anim = requestAnimationFrame(dr);
    }
  }, [bands, constants.canvasSize, constants.circleRadius, constants.rotationSpeed, constants.textOffset, isAvailable, isRotating, context, setBands, doRotation]);

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
    setIsRotating,
    setFacet,
    setFacetsSet,
    setPrayed,
    reset
  };
}
