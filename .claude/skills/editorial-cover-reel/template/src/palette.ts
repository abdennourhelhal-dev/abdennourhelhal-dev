import React from 'react';
import { ELECTRIC, Palette } from './theme';

export const PaletteCtx = React.createContext<Palette>(ELECTRIC);
export const usePalette = () => React.useContext(PaletteCtx);

/** Colour tokens usable in configs: 'accent' | 'onAccent' | 'dim' | 'huge' | 'small' | any CSS colour. */
export const resolveColor = (pal: Palette, c: string | undefined, fallback: string) => {
  if (!c) return fallback;
  return (pal as Record<string, string>)[c] ?? c;
};
