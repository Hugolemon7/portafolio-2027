// Tipos del motor de fondos del hero (hero-bg-core.js), usado por el sitio y por la vista previa de Keystatic.
export type HeroBgKind = 'prism' | 'aurora' | 'sliced';
export function hexToRgb(h: string): [number, number, number] | null;
export function createHeroBg(
  canvas: HTMLCanvasElement,
  kind: HeroBgKind,
  opts?: { colors?: string[]; dir?: 'top' | 'bottom'; scale?: number; centered?: boolean; barWidth?: number; spacing?: number; speed?: number; frequency?: number; blur?: number; bg?: () => string; light?: () => boolean },
): () => void;
