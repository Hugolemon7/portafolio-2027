// Tipos del motor del campo de "+" (plus-wave-core.js), usado por el sitio y por la vista previa de Keystatic.
export type RGB = [number, number, number];
export type PlusFieldOptions = Partial<{
  cell: number; weight: number; size: number; grow: number; opacity: number; radius: number; pulse: number; burstSpeed: number; intro: boolean; dots: boolean;
  idleColor: () => RGB | null; colors: () => (RGB | null)[];
}>;
export const SPEEDS: Record<'slow' | 'normal' | 'fast', number>;
export function hex(h: string): RGB | null;
export function createPlusField(canvas: HTMLCanvasElement, preset?: 'hero' | 'card', overrides?: PlusFieldOptions): () => void;
