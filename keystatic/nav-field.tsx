// Barra de navegación: estilo (barra, píldora o liquid glass), tamaño del nombre, de los links y del logo,
// con vista previa sobre fondo oscuro (hero) y sobre el contenido en modo claro y oscuro.
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { ColorStyles, Head } from './color-ui';
import { loadPublished, PALETTE, type Published } from './font-fields';

export type NavBar = { style: 'bar' | 'pill' | 'glass'; nameScale: number; linkSize: number; logoHeight: number; showName: boolean };
const DEFAULT: NavBar = { style: 'bar', nameScale: 1, linkSize: 0, logoHeight: 28, showName: false };
const LIMITS = { nameScale: [0.6, 1.6], linkSize: [0, 20], logoHeight: [16, 56] } as const;
const STYLES = [
  { id: 'bar', label: 'Barra completa' },
  { id: 'pill', label: 'Píldora redondeada' },
  { id: 'glass', label: 'Liquid glass' },
] as const;
const NAME = 'Hugo Buenrostro';
const LINKS = ['Proyectos', 'Sobre mí', 'Contacto'];

const CSS = `
.kn-panel { display: grid; gap: 16px; padding: 16px 20px; border: 1px solid #e2e4e8; border-radius: 18px; background: #fff; color: #1a1d21; }
.kn-sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px 24px; }
.kn-range { display: grid; gap: 8px; font-size: 12px; font-weight: 600; color: #5b616b; }
.kn-range__top { display: flex; justify-content: space-between; align-items: baseline; }
.kn-range__val { font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: #1a1d21; }
.kn-range input { width: 100%; accent-color: #5a3ec8; }
.kn-check { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
.kn-check input { width: 18px; height: 18px; accent-color: #5a3ec8; }
.kn-note { margin: 0; font-size: 12px; color: #5b616b; }
.kn-stage { position: relative; height: 120px; overflow: hidden; border-radius: 18px; border: 1px solid #e2e4e8; }
.kn-stage__tag { position: absolute; left: 16px; bottom: 12px; font: 600 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.75; }
.kn-bar { position: absolute; display: flex; align-items: center; gap: 22px; white-space: nowrap; }
.kn-bar__mark { display: inline-flex; align-items: center; gap: 8px; margin-right: auto; white-space: nowrap; letter-spacing: -0.03em; }
.kn-bar__nav { display: flex; gap: 4px; }
.kn-bar__nav span { padding: 6px 12px; border-radius: 999px; }
.kn-bar__menu { display: inline-flex; align-items: center; min-height: 34px; padding: 0 14px; font-size: 13px; font-weight: 600; }
.kn-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
`;

type Surface = { bg: string; ink: string; dark: boolean; label: string; photo?: boolean };

function Bar({ v, s, pub, fonts }: { v: NavBar; s: Surface; pub: Published; fonts: { display: string; text: string } }) {
  const pill = v.style !== 'bar';
  const glass = v.style === 'glass';
  // mismo criterio que el sitio: sobre fondo oscuro (hero) la barra es oscura translúcida; sobre el contenido, del color del fondo
  const bg = glass
    ? (s.dark ? 'rgb(12 13 18 / 0.32)' : `color-mix(in srgb, ${s.bg} 52%, transparent)`)
    : s.photo ? 'rgb(6 7 11 / 0.42)' : s.bg;
  const ink = s.dark ? '#eceef5' : s.ink;
  const shadow = glass
    ? (s.dark ? 'inset 0 1px 0 rgb(255 255 255 / 0.22), inset 0 0 0 1px rgb(255 255 255 / 0.12), 0 10px 30px rgb(0 0 0 / 0.18)' : 'inset 0 1px 0 rgb(255 255 255 / 0.65), inset 0 0 0 1px rgb(0 0 0 / 0.08), 0 10px 30px rgb(0 0 0 / 0.1)')
    : pill ? (s.photo ? 'inset 0 0 0 1px rgb(255 255 255 / 0.08)' : '0 6px 24px rgb(0 0 0 / 0.08), inset 0 0 0 1px rgb(0 0 0 / 0.06)') : 'none';
  const style: CSSProperties = {
    ...(pill ? { left: 14, right: 14, top: 12, height: 52, padding: '0 6px 0 18px', borderRadius: 999 } : { left: 0, right: 0, top: 0, height: 64, padding: '0 18px' }),
    background: bg, color: ink, boxShadow: shadow,
    backdropFilter: glass || s.photo ? 'blur(18px) saturate(1.8)' : undefined, WebkitBackdropFilter: glass || s.photo ? 'blur(18px) saturate(1.8)' : undefined,
    fontFamily: `"${fonts.text}", system-ui, sans-serif`,
  };
  const logo = s.dark ? pub.logoDark ?? pub.logo : pub.logo;
  const showName = !logo || v.showName;
  return (
    <div className="kn-bar" style={style}>
      <span className="kn-bar__mark" style={{ fontFamily: `"${fonts.display}", system-ui, sans-serif`, fontSize: 21 * v.nameScale * 0.8 }}>
        {logo && <img src={logo} alt="" style={{ height: v.logoHeight * 0.8, width: 'auto', display: 'block' }} />}
        {showName && NAME}
      </span>
      <span className="kn-bar__nav" style={{ fontSize: (v.linkSize || 18) * 0.8 }}>
        {LINKS.map((l, i) => <span key={l} style={pill && i === 0 ? { background: 'color-mix(in srgb, currentColor 14%, transparent)' } : undefined}>{l}</span>)}
      </span>
      <span className="kn-bar__menu" style={{ background: ink, color: s.dark ? '#06070b' : s.bg, borderRadius: pill ? 999 : 12 }}>Menú</span>
    </div>
  );
}

function Stage({ v, s, pub, fonts }: { v: NavBar; s: Surface; pub: Published; fonts: { display: string; text: string } }) {
  // fondo con formas de color para que se note el desenfoque del vidrio
  const art = s.photo
    ? `radial-gradient(40% 70% at 25% 30%, #7c4dff 0, transparent 70%), radial-gradient(35% 60% at 70% 20%, #1e96d2 0, transparent 70%), radial-gradient(30% 60% at 55% 80%, #ff7ac6 0, transparent 70%), ${s.bg}`
    : `linear-gradient(transparent 58px, color-mix(in srgb, ${s.ink} 6%, transparent) 58px 62px, transparent 62px), repeating-linear-gradient(90deg, color-mix(in srgb, ${s.ink} 7%, transparent) 0 120px, transparent 120px 170px), ${s.bg}`;
  return (
    <div className="kn-stage" style={{ background: art, color: s.dark ? '#eceef5' : s.ink }}>
      <Bar v={v} s={s} pub={pub} fonts={fonts} />
      <span className="kn-stage__tag">{s.label}</span>
    </div>
  );
}

function Range({ label, value, k, step, format, onChange }: { label: string; value: number; k: keyof typeof LIMITS; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <label className="kn-range">
      <span className="kn-range__top">{label}<span className="kn-range__val">{format(value)}</span></span>
      <input type="range" min={LIMITS[k][0]} max={LIMITS[k][1]} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function navBarField({ label }: { label: string }): BasicFormField<NavBar> {
  const clamp = (v: unknown, k: keyof typeof LIMITS, d: number) => Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], v === 0 ? 0 : Number(v) || d));
  const parse = (raw: unknown): NavBar => {
    const v = (raw ?? {}) as Partial<NavBar>;
    return {
      style: v.style === 'pill' || v.style === 'glass' ? v.style : 'bar',
      nameScale: clamp(v.nameScale, 'nameScale', 1), linkSize: clamp(v.linkSize, 'linkSize', 0), logoHeight: clamp(v.logoHeight, 'logoHeight', 28),
      showName: v.showName === true,
    };
  };
  return {
    kind: 'form',
    label,
    defaultValue: () => DEFAULT,
    parse,
    serialize: (value) => ({ value }),
    validate: (value) => value,
    reader: { parse },
    Input({ value, onChange }) {
      const [pub, setPub] = useState<Published>({ colors: PALETTE, uploaded: [], display: 'Clash Grotesk', text: 'Satoshi', logo: null, logoDark: null });
      useEffect(() => { loadPublished().then(setPub); }, []);
      const set = <K extends keyof NavBar>(k: K) => (v: NavBar[K]) => onChange({ ...value, [k]: v });
      const fonts = { display: pub.display, text: pub.text };
      const surfaces: Surface[] = [
        { label: 'Sobre el hero (fondo oscuro)', bg: '#121418', ink: '#eceef2', dark: true, photo: true },
        { label: 'Sobre el contenido · modo claro', bg: pub.colors.light.bg, ink: pub.colors.light.ink, dark: false },
        { label: 'Sobre el contenido · modo oscuro', bg: pub.colors.dark.bg, ink: pub.colors.dark.ink, dark: true },
      ];
      return (
        <div className="kc">
          <ColorStyles />
          <style>{CSS}</style>
          <Head
            title={label}
            sub="Elige el estilo y los tamaños, y revísalos sobre el hero y sobre el contenido en ambos modos antes de guardar. El logo se sube abajo."
            status={
              <div className="kc-seg" role="group" aria-label="Estilo de la barra">
                {STYLES.map((s) => <button key={s.id} type="button" aria-pressed={value.style === s.id} onClick={() => set('style')(s.id)}>{s.label}</button>)}
              </div>
            }
          />
          <div className="kn-panel">
            <div className="kn-sliders">
              <Range label="Tamaño del nombre" value={value.nameScale} k="nameScale" step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={set('nameScale')} />
              <Range label="Tamaño de los links" value={value.linkSize} k="linkSize" step={1} format={(v) => (v ? `${v} px` : 'Igual que el texto')} onChange={(v) => set('linkSize')(v > 0 && v < 11 ? 11 : v)} />
              <Range label="Alto del logo" value={value.logoHeight} k="logoHeight" step={1} format={(v) => `${v} px`} onChange={set('logoHeight')} />
            </div>
            <label className="kn-check">
              <input type="checkbox" checked={value.showName} onChange={(e) => set('showName')(e.target.checked)} />
              Mostrar el nombre junto al logo
            </label>
            <p className="kn-note">Sin logo se muestra el nombre. Con logo, el nombre se oculta salvo que actives la casilla. El logo que ves aquí es el último guardado; uno nuevo aparece después de guardar.</p>
          </div>
          <div className="kn-grid">
            {surfaces.map((s) => <Stage key={s.label} v={value} s={s} pub={pub} fonts={fonts} />)}
          </div>
        </div>
      );
    },
  };
}
