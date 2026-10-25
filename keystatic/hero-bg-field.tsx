// Fondos WebGL del hero (Prisma, Aurora, Ondas cortadas): colores y posición, con vista previa en vivo en ambos modos.
// Usa el mismo motor que el sitio (src/scripts/hero-bg-core.js). El fondo que se muestra en el hero se elige arriba,
// en "Fondo del hero"; aquí se ajusta cada uno.
import { useEffect, useRef, useState } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { createHeroBg, type HeroBgKind } from '../src/scripts/hero-bg-core.js';
import { ColorStyles, HEX, Head, Swatch } from './color-ui';

type Sliced = { colors: [string, string, string]; barWidth: number; spacing: number; speed: number; frequency: number; blur: number };
export type HeroBackdrop = {
  prism: { scale: number };
  aurora: { colors: [string, string, string]; dir: 'top' | 'bottom' };
  sliced: Sliced;
};
const DEFAULT: HeroBackdrop = {
  prism: { scale: 1 },
  aurora: { colors: ['#5227ff', '#7cff67', '#5227ff'], dir: 'top' },
  sliced: { colors: ['#ffd9a8', '#ff5fa2', '#5b8cff'], barWidth: 0.25, spacing: 28, speed: 1, frequency: 1, blur: 0.6 },
};
// límites de cada control (también sanean lo que venga del archivo)
const LIMITS = { scale: [1, 10], barWidth: [0.05, 0.9], spacing: [8, 80], speed: [0.1, 3], frequency: [0.2, 4], blur: [0, 1.5] } as const;
const clamp = (v: unknown, k: keyof typeof LIMITS, d: number) => Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], Number(v) || d));
const PRESETS = {
  aurora: [['#5227ff', '#7cff67', '#5227ff'], ['#00d2ff', '#3a7bd5', '#8e2de2'], ['#ff7e5f', '#feb47b', '#ff6a88'], ['#a8ff78', '#78ffd6', '#4facfe']],
  sliced: [['#ffd9a8', '#ff5fa2', '#5b8cff'], ['#7af5ff', '#c77dff', '#4361ee'], ['#ffbe0b', '#fb5607', '#ff006e'], ['#b8f2e6', '#5e60ce', '#e0aaff']],
} as const;
const STAGE = { light: { name: 'Modo claro', icon: '☀', bg: '#eceef1', ink: '#1f2328' }, dark: { name: 'Modo oscuro', icon: '☾', bg: '#121418', ink: '#eceef2' } } as const;
const TABS: { id: HeroBgKind; label: string }[] = [{ id: 'prism', label: 'Prisma' }, { id: 'aurora', label: 'Aurora' }, { id: 'sliced', label: 'Ondas cortadas' }];

const CSS = `
.kh-live { position: relative; height: 240px; overflow: hidden; }
.kh-live canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.kh-live__copy { position: absolute; left: 18px; bottom: 16px; right: 40%; pointer-events: none; }
.kh-live__title { margin: 0; font-size: 26px; font-weight: 650; letter-spacing: -0.03em; line-height: 1; }
.kh-live__tag { position: absolute; top: 14px; left: 16px; pointer-events: none; }
.kh-live__hint { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; pointer-events: none; }
.kh-panel { display: grid; gap: 14px; padding: 16px 20px; border: 1px solid #e2e4e8; border-radius: 18px; background: #fff; color: #1a1d21; }
.kh-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.kh-presets { display: flex; flex-wrap: wrap; gap: 10px; }
.kh-preset { display: inline-flex; gap: 0; padding: 3px; border: 1px solid #dfe2e6; border-radius: 999px; background: #fff; cursor: pointer; }
.kh-preset span { width: 18px; height: 18px; border-radius: 50%; margin-left: -4px; box-shadow: 0 0 0 2px #fff; }
.kh-preset span:first-child { margin-left: 0; }
.kh-note { margin: 0; font-size: 12px; color: #5b616b; }
.kh-sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px 24px; }
.kh-range { display: grid; gap: 8px; font-size: 12px; font-weight: 600; color: #5b616b; }
.kh-range__top { display: flex; justify-content: space-between; align-items: baseline; }
.kh-range__val { font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: #1a1d21; }
.kh-range input { width: 100%; accent-color: #5a3ec8; }
`;

function Live({ kind, mode, opts }: { kind: HeroBgKind; mode: 'light' | 'dark'; opts: { colors?: string[]; dir?: 'top' | 'bottom' } }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const s = STAGE[mode];
  const key = JSON.stringify(opts);
  useEffect(() => {
    if (!canvas.current) return;
    return createHeroBg(canvas.current, kind, { ...opts, bg: () => s.bg, light: () => mode === 'light' });
  }, [kind, mode, key]);
  return (
    <div className="kc-mode">
      <div className="kh-live" data-wave-host style={{ background: s.bg, color: s.ink }}>
        {/* un canvas nuevo por combinación: el anterior pierde su contexto WebGL al desmontarse */}
        <canvas key={`${kind}-${key}`} ref={canvas} aria-hidden="true" />
        <span className="kc-stage__tag kh-live__tag"><span aria-hidden="true">{s.icon}</span>{s.name}</span>
        <span className="kh-live__hint" style={{ background: mode === 'light' ? 'rgb(255 255 255 / 0.8)' : 'rgb(255 255 255 / 0.12)' }}>Mueve el cursor encima</span>
        <div className="kh-live__copy"><p className="kh-live__title">Diseño productos que destacan</p></div>
      </div>
    </div>
  );
}

function Range({ label, value, k, step, format, onChange }: { label: string; value: number; k: keyof typeof LIMITS; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <label className="kh-range">
      <span className="kh-range__top">{label}<span className="kh-range__val">{format(value)}</span></span>
      <input type="range" min={LIMITS[k][0]} max={LIMITS[k][1]} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
const pct = (v: number) => `${Math.round(v * 100)}%`;
const times = (v: number) => `${v.toFixed(v < 10 ? 1 : 0)}×`;

function ColorTrio({ colors, presets, onChange }: { colors: readonly string[]; presets: readonly (readonly string[])[]; onChange: (c: [string, string, string]) => void }) {
  const set = (i: number) => (v: string) => onChange(colors.map((c, j) => (j === i ? v : c)) as [string, string, string]);
  return (
    <>
      <div className="kh-row">
        {colors.map((c, i) => <Swatch key={i} label={`Color ${i + 1}`} value={c} onChange={set(i)} />)}
      </div>
      <div className="kh-presets">
        {presets.map((p, i) => (
          <button key={i} type="button" className="kh-preset" aria-label={`Usar combinación ${i + 1}`} onClick={() => onChange([...p] as [string, string, string])}>
            {p.map((c, j) => <span key={j} style={{ background: c }} />)}
          </button>
        ))}
      </div>
    </>
  );
}

export function heroBackdropField({ label }: { label: string }): BasicFormField<HeroBackdrop> {
  const trio = (v: unknown, d: [string, string, string]) => (Array.isArray(v) && v.length === 3 ? (v as [string, string, string]) : d);
  const parse = (raw: unknown): HeroBackdrop => {
    const v = (raw ?? {}) as Partial<HeroBackdrop>;
    const sl = (v.sliced ?? {}) as Partial<Sliced>;
    return {
      prism: { scale: clamp(v.prism?.scale, 'scale', 1) },
      aurora: { colors: trio(v.aurora?.colors, DEFAULT.aurora.colors), dir: v.aurora?.dir === 'bottom' ? 'bottom' : 'top' },
      sliced: {
        colors: trio(sl.colors, DEFAULT.sliced.colors),
        barWidth: clamp(sl.barWidth, 'barWidth', 0.25), spacing: clamp(sl.spacing, 'spacing', 28), speed: clamp(sl.speed, 'speed', 1),
        frequency: clamp(sl.frequency, 'frequency', 1), blur: sl.blur === 0 ? 0 : clamp(sl.blur, 'blur', 0.6),
      },
    };
  };
  const validate = (v: HeroBackdrop) => {
    if (![...v.aurora.colors, ...v.sliced.colors].every((c) => HEX.test(c))) throw new Error('Los colores deben ser hex de 6 dígitos, por ejemplo #5227ff.');
    return v;
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
      const [tab, setTab] = useState<HeroBgKind>('prism');
      const { colors: slicedColors, ...slicedNums } = value.sliced;
      const opts = tab === 'aurora' ? { colors: [...value.aurora.colors], dir: value.aurora.dir }
        : tab === 'sliced' ? { colors: [...slicedColors], ...slicedNums }
        : { scale: value.prism.scale };
      const setSl = <K extends keyof Sliced>(k: K) => (v: Sliced[K]) => onChange({ ...value, sliced: { ...value.sliced, [k]: v } });
      return (
        <div className="kc">
          <ColorStyles />
          <style>{CSS}</style>
          <Head
            title={label}
            sub="Ajusta y previsualiza los fondos animados. Para usarlo en el sitio, elígelo en “Fondo del hero”. Todos siguen el tema: en oscuro suman luz y en claro tiñen el fondo."
            status={
              <div className="kc-seg" role="tablist" aria-label="Fondo">
                {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-pressed={tab === t.id} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
              </div>
            }
          />
          {tab === 'prism' && (
            <div className="kh-panel">
              <div className="kh-sliders">
                <Range label="Tamaño del prisma" value={value.prism.scale} k="scale" step={0.1} format={times} onChange={(scale) => onChange({ ...value, prism: { scale } })} />
              </div>
              <p className="kh-note">Prisma de luz espectral que gira y se inclina hacia el cursor. Sus colores son fijos (espectro completo) en ambos modos.</p>
            </div>
          )}
          {tab === 'aurora' && (
            <div className="kh-panel">
              <ColorTrio colors={value.aurora.colors} presets={PRESETS.aurora} onChange={(colors) => onChange({ ...value, aurora: { ...value.aurora, colors } })} />
              <div className="kc-seg" role="group" aria-label="Posición del gradiente" style={{ justifySelf: 'start' }}>
                <button type="button" aria-pressed={value.aurora.dir === 'top'} onClick={() => onChange({ ...value, aurora: { ...value.aurora, dir: 'top' } })}>Desde arriba</button>
                <button type="button" aria-pressed={value.aurora.dir === 'bottom'} onClick={() => onChange({ ...value, aurora: { ...value.aurora, dir: 'bottom' } })}>Desde abajo</button>
              </div>
            </div>
          )}
          {tab === 'sliced' && (
            <div className="kh-panel">
              <ColorTrio colors={value.sliced.colors} presets={PRESETS.sliced} onChange={setSl('colors')} />
              <div className="kh-sliders">
                <Range label="Grosor de las líneas" value={value.sliced.barWidth} k="barWidth" step={0.01} format={pct} onChange={setSl('barWidth')} />
                <Range label="Espaciado entre líneas" value={value.sliced.spacing} k="spacing" step={1} format={(v) => `${v} px`} onChange={setSl('spacing')} />
                <Range label="Velocidad" value={value.sliced.speed} k="speed" step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={setSl('speed')} />
                <Range label="Cantidad de curvas (frecuencia)" value={value.sliced.frequency} k="frequency" step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={setSl('frequency')} />
                <Range label="Desenfoque" value={value.sliced.blur} k="blur" step={0.05} format={pct} onChange={setSl('blur')} />
              </div>
            </div>
          )}
          <div className="kc-modes">
            <Live kind={tab} mode="light" opts={opts} />
            <Live kind={tab} mode="dark" opts={opts} />
          </div>
          <button type="button" onClick={() => onChange(DEFAULT)} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, color: 'inherit', opacity: 0.72, font: '500 13px ui-sans-serif, system-ui, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Restaurar colores originales
          </button>
        </div>
      );
    },
  };
}
