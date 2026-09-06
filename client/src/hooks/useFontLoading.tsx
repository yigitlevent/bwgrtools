import { useEffect, useState } from "react";


export function useFontLoading(font: string): { isFontLoaded: boolean; } {
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    if (!isFontLoaded) {
      (new FontFace("Code", `url(${font})`)).load().then(
        font => { document.fonts.add(font); setIsFontLoaded(true); },
        console.error
      );
    }
  }, [font, isFontLoaded]);

  return { isFontLoaded };
}
