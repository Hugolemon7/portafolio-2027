// Cruces del hero: color (multicolor o uno por modo), grosor y espaciado, con vista previa en vivo.
// La vista previa usa el mismo motor que el sitio (src/scripts/plus-wave-core.js): lo que ves aquí es lo que se publica.
import { useEffect, useRef } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { createPlusField, hex } from '../src/scripts/plus-wave-core.js';
import { ColorStyles, HEX, Head, Swatch } from './color-ui';

export type PlusColor = {
  mode: 'multi' | 'single'; light: string; dark: string;
  spacing: number; weight: number; size: number; grow: number; opacity: number; radius: number;
  veil: boolean; veilOpacity: number;
};

const DEFAULT: PlusColor = {
  mode: 'multi', light: '#5a3ec8', dark: '#b9a4ff',
  spacing: 40, weight: 1, size: 1, grow: 1, opacity: 1, radius: 0.3,
  veil: false, veilOpacity: 0.8,
};
// límites de cada control (también se usan para sanear lo que venga del archivo)
const LIMITS = {
  spacing: [24, 72], weight: [0.5, 2.5], size: [0.5, 1.8], grow: [0.25, 3], opacity: [0.2, 1], radius: [0.1, 0.8], veilOpacity: [0.1, 1],
} as const;
const PRESETS = ['#5a3ec8', '#7c4dff', '#b9a4ff', '#d640a0', '#1e96d2', '#0f9d76', '#1f2328', '#eceef5'];

// fondo, tinta y paleta multicolor de cada modo (las mismas que usa el hero)
const STAGE = {
  light: { name: 'Modo claro', icon: '☀', bg: '#eceef1', ink: '#1f2328', multi: ['#5a3ec8', '#7c4dff', '#8f5bf0', '#d64096', '#1e96d2', '#1f2328'] },
  dark: { name: 'Modo oscuro', icon: '☾', bg: '#121418', ink: '#eceef5', multi: ['#b9a4ff', '#7c4dff', '#a770ff', '#c9b8ff', '#ff7ac6', '#6fd3ff', '#eceef5'] },
} as const;

const PREVIEW_CSS = `
.kc-live { position: relative; height: 230px; overflow: hidden; cursor: crosshair; }
.kc-live canvas { position: absolute; inset: 0; }
.kc-live__copy { position: absolute; left: 20px; right: 20px; bottom: 18px; pointer-events: none; }
.kc-live__title { margin: 0; font-size: 26px; font-weight: 650; letter-spacing: -0.03em; line-height: 1; }
.kc-live__lead { margin: 8px 0 0; font-size: 13px; opacity: 0.9; max-width: 34ch; }
.kc-live__tag { position: absolute; top: 14px; left: 16px; pointer-events: none; }
.kc-live__hint { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; pointer-events: none; }
.kc-range { display: grid; gap: 8px; font-size: 12px; font-weight: 600; color: #5b616b; }
.kc-range__top { display: flex; justify-content: space-between; align-items: baseline; }
.kc-range__val { font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: #1a1d21; }
.kc-range input { width: 100%; accent-color: #5a3ec8; }
.kc-sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px 24px; padding: 16px 20px; border: 1px solid #e2e4e8; border-radius: 18px; background: #fff; }
.kc-veil { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 12px 24px; padding: 14px 20px; border: 1px solid #e2e4e8; border-radius: 18px; background: #fff; color: #1a1d21; }
.kc-veil__check { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.kc-veil__check input { width: 18px; height: 18px; accent-color: #5a3ec8; }
.kc-veil__note { grid-column: 1 / -1; margin: 0; font-size: 12px; color: #5b616b; }
.kc-veil .kc-range[aria-disabled="true"] { opacity: 0.4; }
.kc-live__veil { position: absolute; inset: 0; pointer-events: none; }
`;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function LiveStage({ mode, value }: { mode: 'light' | 'dark'; value: PlusColor }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const s = STAGE[mode];
  const single = value.mode === 'single' && HEX.test(value[mode]) ? value[mode] : null;
  useEffect(() => {
    if (!canvas.current) return;
    const palette = (single ? [single] : s.multi).map((c: string) => hex(c));
    return createPlusField(canvas.current, 'hero', {
      cell: value.spacing, weight: value.weight, size: value.size, grow: value.grow, opacity: value.opacity, radius: value.radius, pulse: 3,
      idleColor: () => hex(s.ink), colors: () => palette,
    });
  }, [mode, single, value.mode, value.spacing, value.weight, value.size, value.grow, value.opacity, value.radius]);
  return (
    <div ref={host} className="kc-live" data-wave-host style={{ background: s.bg, color: s.ink }}>
      <canvas ref={canvas} aria-hidden="true" />
      {value.veil && (
        <span className="kc-live__veil" aria-hidden="true" style={{ background: `linear-gradient(to right, color-mix(in srgb, ${s.bg} ${Math.round(value.veilOpacity * 100)}%, transparent), transparent)` }} />
      )}
      <span className="kc-stage__tag kc-live__tag"><span aria-hidden="true">{s.icon}</span>{s.name}</span>
      <span className="kc-live__hint" style={{ background: mode === 'light' ? 'rgb(255 255 255 / 0.8)' : 'rgb(255 255 255 / 0.12)' }}>Pasa el cursor · clic = onda</span>
      <div className="kc-live__copy">
        <p className="kc-live__title">Diseño productos que destacan</p>
        <p className="kc-live__lead">Así se leen los textos del hero sobre los puntos en reposo.</p>
      </div>
    </div>
  );
}

function Presets({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="kc-presets">
      {PRESETS.map((c) => (
        <button key={c} type="button" className="kc-preset" style={{ background: c }} aria-label={`Usar ${c}`} aria-pressed={value.toLowerCase() === c} onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

function Range({ label, value, min, max, step, format, onChange, disabled }: { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <label className="kc-range" aria-disabled={disabled || undefined}>
      <span className="kc-range__top">{label}<span className="kc-range__val">{format(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
const pctf = (v: number) => `${Math.round(v * 100)}%`;

export function plusColorField({ label }: { label: string }): BasicFormField<PlusColor> {
  const validate = (v: PlusColor) => {
    if (v.mode === 'single' && (!HEX.test(v.light) || !HEX.test(v.dark))) throw new Error('Los colores deben ser hex de 6 dígitos, por ejemplo #5a3ec8.');
    return v;
  };
  const parse = (raw: unknown): PlusColor => {
    const v = (raw ?? {}) as Partial<PlusColor>;
    const num = (k: keyof typeof LIMITS) => clamp(Number(v[k]) || DEFAULT[k], LIMITS[k][0], LIMITS[k][1]);
    return {
      mode: v.mode === 'single' ? 'single' : 'multi',
      light: v.light ?? DEFAULT.light,
      dark: v.dark ?? DEFAULT.dark,
      spacing: num('spacing'), weight: num('weight'), size: num('size'), grow: num('grow'), opacity: num('opacity'), radius: num('radius'),
      veil: v.veil === true,
      veilOpacity: num('veilOpacity'),
    };
  };
  return {
    kind: 'form',
    label,
    defaultValue: () => DEFAULT,
    parse,
    serialize: (value) => ({ value }),
    validate,
    reader: { parse: (raw) => validate(parse(raw)) },
    Input({ value, onChange }) {
      const single = value.mode === 'single';
      const set = <K extends keyof PlusColor>(k: K) => (v: PlusColor[K]) => onChange({ ...value, [k]: v });
      return (
        <div className="kc">
          <ColorStyles />
          <style>{PREVIEW_CSS}</style>
          <Head
            title={label}
            sub="En reposo son puntos del color del texto; al pasar el cursor o con la onda crecen a cruces. Prueba los cambios en la vista previa antes de guardar."
            status={
              <div className="kc-seg" role="group" aria-label="Modo de color">
                <button type="button" aria-pressed={!single} onClick={() => onChange({ ...value, mode: 'multi' })}>Multicolor</button>
                <button type="button" aria-pressed={single} onClick={() => onChange({ ...value, mode: 'single' })}>Un color</button>
              </div>
            }
          />
          <div className="kc-sliders">
            <Range label="Grosor de línea" value={value.weight} min={LIMITS.weight[0]} max={LIMITS.weight[1]} step={0.1} format={pctf} onChange={set('weight')} />
            <Range label="Espaciado entre cruces" value={value.spacing} min={LIMITS.spacing[0]} max={LIMITS.spacing[1]} step={2} format={(v) => `${v} px`} onChange={set('spacing')} />
            <Range label="Tamaño máximo al crecer" value={value.size} min={LIMITS.size[0]} max={LIMITS.size[1]} step={0.05} format={pctf} onChange={set('size')} />
            <Range label="Velocidad con la que crecen" value={value.grow} min={LIMITS.grow[0]} max={LIMITS.grow[1]} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={set('grow')} />
            <Range label="Área de hover (radio de influencia)" value={value.radius} min={LIMITS.radius[0]} max={LIMITS.radius[1]} step={0.05} format={pctf} onChange={set('radius')} />
            <Range label="Opacidad de las figuras" value={value.opacity} min={LIMITS.opacity[0]} max={LIMITS.opacity[1]} step={0.05} format={pctf} onChange={set('opacity')} />
          </div>
          <div className="kc-veil">
            <label className="kc-veil__check">
              <input type="checkbox" checked={value.veil} onChange={(e) => set('veil')(e.target.checked)} />
              Degradado de contraste detrás del texto
            </label>
            <Range label="Opacidad inicial (izquierda)" value={value.veilOpacity} min={LIMITS.veilOpacity[0]} max={LIMITS.veilOpacity[1]} step={0.05} format={(v) => `${pctf(v)} → 0%`} onChange={set('veilOpacity')} disabled={!value.veil} />
            <p className="kc-veil__note">Un velo del mismo color de fondo que va de este porcentaje a 0% de izquierda a derecha: atenúa las figuras detrás del titular. Se ve en la vista previa.</p>
          </div>
          <div className="kc-modes">
            {(['light', 'dark'] as const).map((m) => (
              <div className="kc-mode" key={m}>
                <LiveStage mode={m} value={value} />
                {single && (
                  <div className="kc-controls">
                    <Swatch label="Color de las cruces" value={value[m]} onChange={set(m)} />
                    <Presets value={value[m]} onChange={set(m)} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onChange(DEFAULT)} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, color: 'inherit', opacity: 0.72, font: '500 13px ui-sans-serif, system-ui, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Restaurar valores originales
          </button>
        </div>
      );
    },
  };
}
