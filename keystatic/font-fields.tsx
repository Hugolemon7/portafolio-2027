// Tipografías con vista previa antes de guardar:
// - pareja: títulos + texto juntos, en modo claro y oscuro, para probar combinaciones;
// - archivo: muestra el archivo recién subido (se lee en el navegador, todavía sin guardar).
import { useEffect, useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { fields } from '@keystatic/core';
import type { BasicFormField } from '@keystatic/core';
import { ColorStyles } from './color-ui';

// fuentes que trae el sitio (public/fonts): la vista previa las carga desde ahí
const BUILT_IN: Record<string, { url: string; weight: string }[]> = {
  'Clash Grotesk': [{ url: '/fonts/clash-grotesk-500.woff2', weight: '500' }],
  Satoshi: [
    { url: '/fonts/satoshi-400.woff2', weight: '400' },
    { url: '/fonts/satoshi-500.woff2', weight: '500' },
    { url: '/fonts/satoshi-700.woff2', weight: '700' },
  ],
};
const loaded = new Set<string>();
function loadBuiltIn(family: string) {
  const faces = BUILT_IN[family];
  if (!faces || loaded.has(family) || typeof FontFace === 'undefined') return Promise.resolve();
  loaded.add(family);
  return Promise.all(faces.map((f) => new FontFace(family, `url(${f.url})`, { weight: f.weight }).load().then((ff) => document.fonts.add(ff)))).then(() => undefined);
}

// Lo ya publicado: la portada del sitio trae en línea los @font-face de las fuentes subidas y los colores de cada modo.
// Así la vista previa usa tus archivos guardados y tus colores reales (mismo dominio que /keystatic).
type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
const PALETTE: Record<'light' | 'dark', Palette> = {
  light: { bg: '#eceef1', surface: '#e1e4e9', ink: '#1f2328', muted: '#444a53', accent: '#5a3ec8', accentInk: '#ffffff' },
  dark: { bg: '#121418', surface: '#1b1e24', ink: '#eceef2', muted: '#aeb3bd', accent: '#b9a4ff', accentInk: '#0d0e10' },
};
let published: Promise<Record<'light' | 'dark', Palette>> | null = null;
function loadPublished() {
  if (published) return published;
  published = fetch('/')
    .then((r) => r.text())
    .then((html) => {
      const faces = html.match(/@font-face\{[^}]+\}/g) ?? [];
      if (faces.length) {
        const style = document.createElement('style');
        style.dataset.kcFonts = '';
        style.textContent = faces.join('');
        document.head.append(style);
      }
      const attr = /<html[^>]*\sstyle="([^"]*)"/.exec(html)?.[1] ?? '';
      const v = (name: string) => new RegExp(`--${name}:(#[0-9a-fA-F]{6})`).exec(attr)?.[1];
      const pick = (m: 'light' | 'dark'): Palette => ({
        bg: v(`site-${m}-bg`) ?? PALETTE[m].bg, surface: v(`site-${m}-surface`) ?? PALETTE[m].surface,
        ink: v(`site-${m}-ink`) ?? PALETTE[m].ink, muted: v(`site-${m}-muted`) ?? PALETTE[m].muted,
        accent: v(`accent-${m}`) ?? PALETTE[m].accent, accentInk: v(`accent-${m}-ink`) ?? PALETTE[m].accentInk,
      });
      return { light: pick('light'), dark: pick('dark') };
    })
    .catch(() => PALETTE);
  return published;
}

const PREVIEW_CSS = `
.kf { display: grid; gap: 14px; }
.kf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; padding: 16px 20px; border: 1px solid #e2e4e8; border-radius: 18px; background: #fff; color: #1a1d21; }
.kf-field { display: grid; gap: 6px; font: 600 12px ui-sans-serif, system-ui, sans-serif; color: #5b616b; }
.kf-input, .kf-select { width: 100%; min-height: 38px; padding: 8px 12px; border: 1px solid #dfe2e6; border-radius: 10px; font: 500 14px ui-sans-serif, system-ui, sans-serif; background: #fafbfc; color: #1a1d21; }
.kf-input:focus, .kf-select:focus { outline: none; border-color: #5a3ec8; box-shadow: 0 0 0 3px rgb(90 62 200 / 0.18); }
.kf-hint { margin: 0; font: 500 12px ui-sans-serif, system-ui, sans-serif; color: #5b616b; }
.kf-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.kf-page { border-radius: 18px; overflow: hidden; border: 1px solid #e2e4e8; }
.kf-page__tag { display: flex; justify-content: space-between; padding: 10px 18px 0; font: 600 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.7; }
.kf-page__hero { padding: 18px 18px 22px; display: grid; gap: 12px; }
.kf-page__h1 { margin: 0; font-size: 40px; line-height: 0.95; letter-spacing: -0.035em; }
.kf-page__lead { margin: 0; font-size: 15px; line-height: 1.45; max-width: 40ch; }
.kf-page__row { display: flex; gap: 10px; flex-wrap: wrap; }
.kf-page__btn { display: inline-flex; align-items: center; min-height: 38px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 500; }
.kf-page__card { margin: 0 18px 18px; padding: 16px; border-radius: 14px; display: grid; gap: 6px; }
.kf-page__h2 { margin: 0; font-size: 24px; line-height: 1.05; letter-spacing: -0.03em; }
.kf-page__p { margin: 0; font-size: 14px; line-height: 1.5; }
.kf-page__meta { margin: 0; font-size: 12px; }
.kf-card { border: 1px solid #e2e4e8; border-radius: 16px; overflow: hidden; background: #fff; color: #1a1d21; }
.kf-card__head { display: flex; justify-content: space-between; gap: 8px; padding: 8px 14px; border-bottom: 1px solid #eceef1; font: 600 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; color: #5b616b; }
.kf-card__body { display: grid; gap: 10px; padding: 18px 18px 20px; }
.kf-title { margin: 0; font-size: 34px; line-height: 1; letter-spacing: -0.03em; }
.kf-text { margin: 0; font-size: 16px; line-height: 1.5; max-width: 52ch; }
.kf-glyphs { margin: 0; font-size: 14px; letter-spacing: 0.02em; color: #5b616b; }
`;

const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
const FALLBACKS = [['sans-serif', 'Sans serif'], ['serif', 'Serif'], ['monospace', 'Monoespaciada']];

export type FontPair = { display: string; text: string; displayWeight: string; displayFallback: string; textFallback: string };
export const PAIR_DEFAULT: FontPair = { display: 'Clash Grotesk', text: 'Satoshi', displayWeight: '500', displayFallback: 'sans-serif', textFallback: 'sans-serif' };

function MiniPage({ mode, pair, colors }: { mode: 'light' | 'dark'; pair: FontPair; colors: Palette }) {
  const display: CSSProperties = { fontFamily: `"${pair.display || PAIR_DEFAULT.display}", system-ui, ${pair.displayFallback}`, fontWeight: Number(pair.displayWeight) };
  const text: CSSProperties = { fontFamily: `"${pair.text || PAIR_DEFAULT.text}", system-ui, ${pair.textFallback}` };
  return (
    <div className="kf-page" style={{ background: colors.bg, color: colors.ink }}>
      <span className="kf-page__tag" style={text}><span>{mode === 'light' ? '☀ Modo claro' : '☾ Modo oscuro'}</span><span>{pair.display} + {pair.text}</span></span>
      <div className="kf-page__hero">
        <p className="kf-page__h1" style={display}>Diseño productos que destacan</p>
        <p className="kf-page__lead" style={text}>Soy Product Designer. Construyo sistemas de diseño y flujos para productos digitales, con datos y pruebas con usuarios.</p>
        <div className="kf-page__row" style={text}>
          <span className="kf-page__btn" style={{ background: colors.ink, color: colors.bg }}>Escríbeme</span>
          <span className="kf-page__btn" style={{ boxShadow: `inset 0 0 0 1px ${colors.ink}` }}>Ver proyectos</span>
        </div>
      </div>
      <div className="kf-page__card" style={{ background: colors.surface }}>
        <p className="kf-page__h2" style={{ ...display, color: colors.accent }}>+25% de retención</p>
        <p className="kf-page__p" style={text}>Rediseñé los flujos principales con datos de Hotjar y pruebas con usuarios.</p>
        <p className="kf-page__meta" style={{ ...text, color: colors.muted }}>Wiggot · 2023–24 · Aa Bb Ññ 0123456789</p>
      </div>
    </div>
  );
}

/** Títulos + texto juntos, con vista previa combinada en modo claro y oscuro. */
export function fontPairField({ label }: { label: string }): BasicFormField<FontPair> {
  const parse = (raw: unknown): FontPair => ({ ...PAIR_DEFAULT, ...((raw ?? {}) as Partial<FontPair>) });
  return {
    kind: 'form',
    label,
    defaultValue: () => PAIR_DEFAULT,
    parse,
    serialize: (value) => ({ value }),
    validate: (value) => value,
    reader: { parse },
    Input({ value, onChange }) {
      const id = useId();
      const [colors, setColors] = useState(PALETTE);
      const [, force] = useState(0);
      const set = (k: keyof FontPair) => (v: string) => onChange({ ...value, [k]: v });
      useEffect(() => { loadPublished().then((c) => { setColors(c); force((n) => n + 1); }); }, []);
      useEffect(() => { Promise.all([loadBuiltIn(value.display.trim()), loadBuiltIn(value.text.trim())]).then(() => force((n) => n + 1)); }, [value.display, value.text]);
      return (
        <div className="kc kf">
          <ColorStyles />
          <style>{PREVIEW_CSS}</style>
          <div className="kc-head">
            <div>
              <p className="kc-title">{label}</p>
              <p className="kc-sub">Escribe el nombre de cada familia y prueba la combinación en los dos modos antes de guardar. Funcionan las fuentes incluidas (Clash Grotesk, Satoshi), las del sistema (p. ej. Georgia) y las que ya subiste y publicaste. Para una fuente nueva, súbela abajo: cada archivo muestra su propia vista previa.</p>
            </div>
          </div>
          <div className="kf-grid">
            <label className="kf-field" htmlFor={`${id}-d`}>Títulos
              <input id={`${id}-d`} className="kf-input" value={value.display} onChange={(e) => set('display')(e.target.value)} spellCheck={false} />
            </label>
            <label className="kf-field" htmlFor={`${id}-t`}>Texto
              <input id={`${id}-t`} className="kf-input" value={value.text} onChange={(e) => set('text')(e.target.value)} spellCheck={false} />
            </label>
            <label className="kf-field">Peso de los títulos
              <select className="kf-select" value={value.displayWeight} onChange={(e) => set('displayWeight')(e.target.value)}>
                {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <label className="kf-field">Respaldo de títulos mientras carga
              <select className="kf-select" value={value.displayFallback} onChange={(e) => set('displayFallback')(e.target.value)}>
                {FALLBACKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="kf-field">Respaldo de texto mientras carga
              <select className="kf-select" value={value.textFallback} onChange={(e) => set('textFallback')(e.target.value)}>
                {FALLBACKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          <div className="kf-modes">
            <MiniPage mode="light" pair={value} colors={colors.light} />
            <MiniPage mode="dark" pair={value} colors={colors.dark} />
          </div>
          <button type="button" onClick={() => onChange(PAIR_DEFAULT)} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, color: 'inherit', opacity: 0.72, font: '500 13px ui-sans-serif, system-ui, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Restaurar Clash Grotesk + Satoshi
          </button>
        </div>
      );
    },
  };
}

function Sample({ family, label, note }: { family: string; label: string; note?: string }) {
  return (
    <div className="kf-card">
      <div className="kf-card__head"><span>{label}</span>{note && <span style={{ textTransform: 'none', letterSpacing: 0 }}>{note}</span>}</div>
      <div className="kf-card__body" style={{ fontFamily: family }}>
        <p className="kf-title">Diseño productos que destacan</p>
        <p className="kf-text">Soy Product Designer. Construyo sistemas de diseño y flujos para productos digitales, con datos y pruebas con usuarios.</p>
        <p className="kf-glyphs">Aa Bb Cc Ññ Éé · 0123456789 · ¿? ¡! & @ → %</p>
      </div>
    </div>
  );
}

/** Archivo de fuente con vista previa del archivo subido, antes de guardar. */
export function fontFileField(opts: { label: string; directory: string; publicPath: string }) {
  const base = fields.file(opts);
  return {
    ...base,
    Input(props: Parameters<typeof base.Input>[0]) {
      const v = props.value as { data: Uint8Array; extension: string; filename: string } | null;
      const [family, setFamily] = useState<string | null>(null);
      const [error, setError] = useState('');
      useEffect(() => {
        setFamily(null); setError('');
        if (!v?.data || typeof FontFace === 'undefined') return;
        const name = `kc-upload-${Math.random().toString(36).slice(2)}`;
        const buf = v.data.slice().buffer;
        new FontFace(name, buf).load()
          .then((ff) => { document.fonts.add(ff); setFamily(name); })
          .catch(() => setError('No se pudo leer este archivo como fuente. Usa .woff2, .woff, .ttf u .otf.'));
      }, [v?.data]);
      return (
        <div className="kc kf">
          <ColorStyles />
          <style>{PREVIEW_CSS}</style>
          <base.Input {...props} />
          {family && <Sample family={`"${family}", system-ui`} label="Vista previa de este archivo" note={v?.filename} />}
          {error && <p className="kc-error" style={{ margin: 0 }}>{error}</p>}
        </div>
      );
    },
  };
}
