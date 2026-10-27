// Tamaños de texto del sitio: uno para todo el texto, uno para todos los títulos y uno por cada título de sección.
// La vista previa compara "antes" (tamaño original) y "después" a tamaño de escritorio (1280 px) y avisa cuando
// un texto ya no cabe en su espacio (por ejemplo, los números de Impacto en su tarjeta).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BasicFormField } from '@keystatic/core';
import { ColorStyles, Head } from './color-ui';
import { loadPublished, PALETTE, type Published } from './font-fields';

const KEYS = ['text', 'headings', 'section', 'impact', 'work', 'project', 'facilitation', 'experience', 'contact', 'page', 'subtitle', 'foot'] as const;
type Key = (typeof KEYS)[number];
export type TypeScale = Record<Key, number>;
const DEFAULT = Object.fromEntries(KEYS.map((k) => [k, 1])) as TypeScale;
const MIN = 0.5, MAX = 1.6;

// px a 1280 px de ancho (los clamp() de global.css y pages.css resueltos) y ancho disponible cuando importa
type Row = { key: Key; group: string; label: string; sample: string; px: number; box?: number; display?: boolean; fit?: [string, string] };
const ROWS: Row[] = [
  { key: 'text', group: 'General', label: 'Texto general (párrafos, botones, menús, detalles)', sample: 'Soy Product Designer. Construyo sistemas de diseño y flujos para productos digitales.', px: 19 },
  { key: 'headings', group: 'General', label: 'Todos los títulos (multiplica a todos los de abajo, también el del hero)', sample: 'Diseño productos que destacan', px: 110.72, display: true },
  { key: 'section', group: 'Inicio', label: 'Títulos de sección: Impacto, Sobre mí, Cómo trabajo, Facilitación', sample: 'Impacto medible', px: 30.08, display: true },
  { key: 'impact', group: 'Inicio', label: 'Números de “Impacto medible” (dentro de su tarjeta)', sample: '+25%', px: 70.4, box: 230, display: true },
  { key: 'work', group: 'Inicio', label: 'Título “Proyectos”', sample: 'Proyectos', px: 61.76, display: true },
  { key: 'project', group: 'Inicio', label: 'Nombres de proyectos', sample: 'CONTPAQi Connection', px: 108.8, display: true },
  { key: 'facilitation', group: 'Inicio', label: 'Metodologías de “Facilitación” (Design Thinking, Serious Play…)', sample: 'Working Backwards', px: 108.8, box: 1000, display: true, fit: ['Cabe en una línea', 'Baja a dos líneas'] },
  { key: 'experience', group: 'Inicio', label: 'Título de Experiencia', sample: 'Más de diez años', px: 61.76, display: true },
  { key: 'contact', group: 'Todas las páginas', label: 'Título de contacto', sample: '¿Diseñamos algo que destaque?', px: 78.72, display: true },
  { key: 'foot', group: 'Todas las páginas', label: 'Nombre en el pie de página', sample: 'Hugo Buenrostro', px: 61.76, display: true },
  { key: 'page', group: 'Páginas internas', label: 'Títulos de página y de casos de estudio', sample: 'Proyectos', px: 96, display: true },
  { key: 'subtitle', group: 'Páginas internas', label: 'Subtítulos: grupos, tarjetas y títulos dentro de los casos', sample: 'Casos de estudio', px: 30.08, display: true },
];
const PREVIEW = 0.42;   // la vista previa se dibuja al 42 % para caber

const CSS = `
.kt-group { margin: 10px 0 0; font: 700 11px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; }
.kt-row { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 18px; align-items: center; padding: 14px 18px; border: 1px solid #e2e4e8; border-radius: 16px; background: #fff; color: #1a1d21; }
.kt-ctrl { display: grid; gap: 8px; font: 600 12px ui-sans-serif, system-ui, sans-serif; color: #3b4048; }
.kt-ctrl__top { display: flex; justify-content: space-between; gap: 8px; }
.kt-ctrl__val { font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: #1a1d21; white-space: nowrap; }
.kt-ctrl input { width: 100%; accent-color: #5a3ec8; }
.kt-reset { justify-self: start; border: 0; background: none; padding: 0; font: 500 12px ui-sans-serif, system-ui, sans-serif; color: #5b616b; text-decoration: underline; cursor: pointer; }
.kt-prev { display: grid; gap: 6px; min-width: 0; overflow: hidden; }
.kt-line { display: grid; grid-template-columns: 56px 1fr; align-items: baseline; gap: 8px; min-width: 0; }
.kt-line__tag { font: 600 10px ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.04em; text-transform: uppercase; color: #8a9099; }
.kt-box { min-width: 0; border-radius: 8px; padding: 6px 8px; overflow: hidden; }
.kt-box--fixed { box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12); }
.kt-text { margin: 0; line-height: 1; letter-spacing: -0.03em; white-space: nowrap; }
.kt-text--body { white-space: normal; letter-spacing: 0; line-height: 1.45; }
.kt-warn { justify-self: start; padding: 3px 9px; border-radius: 999px; background: #fde4e3; color: #8a1c1c; font: 700 11px ui-sans-serif, system-ui, sans-serif; }
.kt-ok { justify-self: start; padding: 3px 9px; border-radius: 999px; background: #e3f5ea; color: #0b5a2c; font: 700 11px ui-sans-serif, system-ui, sans-serif; }
`;

function Line({ tag, row, scale, fonts, colors, onFit }: { tag: string; row: Row; scale: number; fonts: { display: string; text: string }; colors: { bg: string; ink: string; surface: string }; onFit?: (fits: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const size = row.px * scale * PREVIEW;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !onFit || !row.box) return;
    const check = () => onFit(el.scrollWidth <= el.clientWidth + 1);
    check();
    document.fonts?.ready.then(check);
  });
  return (
    <div className="kt-line">
      <span className="kt-line__tag">{tag}</span>
      <div ref={ref} className={`kt-box${row.box ? ' kt-box--fixed' : ''}`} style={{ width: row.box ? row.box * PREVIEW : undefined, background: row.key === 'impact' ? colors.surface : colors.bg, color: colors.ink }}>
        <p className={`kt-text${row.display ? '' : ' kt-text--body'}`} style={{ fontSize: size, fontFamily: `"${row.display ? fonts.display : fonts.text}", system-ui, sans-serif`, fontWeight: row.display ? 500 : 400 }}>{row.sample}</p>
      </div>
    </div>
  );
}

function RowView({ row, value, onChange, fonts, colors }: { row: Row; value: TypeScale; onChange: (v: number) => void; fonts: { display: string; text: string }; colors: { bg: string; ink: string; surface: string } }) {
  const [fits, setFits] = useState(true);
  const own = value[row.key];
  const eff = row.key === 'text' || row.key === 'headings' ? own : own * value.headings;
  return (
    <div className="kt-row">
      <label className="kt-ctrl">
        <span className="kt-ctrl__top">{row.label}<span className="kt-ctrl__val">{Math.round(own * 100)}%</span></span>
        <input type="range" min={MIN} max={MAX} step={0.05} value={own} onChange={(e) => onChange(Number(e.target.value))} />
        <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {own !== 1 && <button type="button" className="kt-reset" onClick={() => onChange(1)}>Volver a 100%</button>}
          {row.box && (fits ? <span className="kt-ok">{row.fit?.[0] ?? 'Cabe'}</span> : <span className="kt-warn">{row.fit?.[1] ?? 'Se sale de su espacio'}</span>)}
        </span>
      </label>
      <div className="kt-prev">
        <Line tag="Antes" row={row} scale={1} fonts={fonts} colors={colors} />
        <Line tag="Después" row={row} scale={eff} fonts={fonts} colors={colors} onFit={setFits} />
      </div>
    </div>
  );
}

export function typeScaleField({ label }: { label: string }): BasicFormField<TypeScale> {
  const parse = (raw: unknown): TypeScale => {
    const v = (raw ?? {}) as Partial<TypeScale>;
    return Object.fromEntries(KEYS.map((k) => [k, Math.min(MAX, Math.max(MIN, Number(v[k]) || 1))])) as TypeScale;
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
      const fonts = { display: pub.display, text: pub.text };
      const colors = { bg: pub.colors.light.bg, ink: pub.colors.light.ink, surface: pub.colors.light.surface };
      let lastGroup = '';
      return (
        <div className="kc">
          <ColorStyles />
          <style>{CSS}</style>
          <Head
            title={label}
            sub={`Ajusta el tamaño de cada título y del texto. Cada fila compara el tamaño original (antes) con tu cambio (después), dibujados al ${Math.round(PREVIEW * 100)} % de una pantalla de escritorio (1280 px), con tus tipografías. Los que tienen un espacio fijo avisan si ya no caben.`}
            status={<button type="button" className="kt-reset" onClick={() => onChange(DEFAULT)}>Restaurar todo a 100%</button>}
          />
          {ROWS.map((row) => {
            const head = row.group !== lastGroup ? <p className="kt-group">{row.group}</p> : null;
            lastGroup = row.group;
            return (
              <div key={row.key} style={{ display: 'grid', gap: 8 }}>
                {head}
                <RowView row={row} value={value} fonts={fonts} colors={colors} onChange={(v) => onChange({ ...value, [row.key]: v })} />
              </div>
            );
          })}
        </div>
      );
    },
  };
}
