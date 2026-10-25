// Colores de la sección de contacto (lava luminosa): fondo, texto y los dos tonos del halo, por modo.
// "Usar el acento" toma fondo y texto del color de acento; "Personalizado" exige WCAG AA entre texto y fondo.
import type { BasicFormField } from '@keystatic/core';
import { contrast } from './accent-field';
import { ColorStyles, HEX, Head, Swatch } from './color-ui';

type Palette = { bg: string; ink: string; rimA: string; rimB: string };
export type FinaleColor = { mode: 'accent' | 'custom'; light: Palette; dark: Palette };

const AA = 4.5;
const AAA = 7;
// valores del acento por defecto: la vista previa los usa en el modo "Usar el acento"
const ACCENT = { light: { bg: '#5a3ec8', ink: '#ffffff' }, dark: { bg: '#b9a4ff', ink: '#0d0e10' } };
const DEFAULT: FinaleColor = {
  mode: 'accent',
  light: { ...ACCENT.light, rimA: '#ff8fd6', rimB: '#8fc7ff' },
  dark: { ...ACCENT.dark, rimA: '#ff8fd6', rimB: '#8fc7ff' },
};
const MODES = { light: { name: 'Modo claro', icon: '☀' }, dark: { name: 'Modo oscuro', icon: '☾' } } as const;

// el halo se suma al fondo como "screen" (igual que el shader); así se mide cuánto se distingue
const rgb = (h: string) => h.slice(1).match(/../g)!.map((x) => parseInt(x, 16) / 255);
const hex = (c: number[]) => '#' + c.map((v) => Math.round(Math.min(1, v) * 255).toString(16).padStart(2, '0')).join('');
const screen = (bg: string, rim: string, k: number) => hex(rgb(bg).map((b, i) => 1 - (1 - b) * (1 - rgb(rim)[i] * k)));

export function validateFinale(v: FinaleColor) {
  if (v.mode !== 'custom') return v;
  for (const m of ['light', 'dark'] as const) {
    for (const k of ['bg', 'ink', 'rimA', 'rimB'] as const) {
      if (!HEX.test(v[m][k] ?? '')) throw new Error(`${MODES[m].name}: los colores deben ser hex de 6 dígitos, por ejemplo #5a3ec8.`);
    }
    const r = contrast(v[m].ink, v[m].bg);
    if (r < AA) throw new Error(`${MODES[m].name}: el texto sobre el fondo da ${r.toFixed(2)}:1 y no cumple AA (mínimo 4.5:1).`);
  }
  return v;
}

const MAX_RATIO = 12;
const pct = (r: number) => `${Math.min(100, ((r - 1) / (MAX_RATIO - 1)) * 100)}%`;

function Check({ label, ratio, info }: { label: string; ratio: number; info?: boolean }) {
  const tone = info ? '#7c4dff' : ratio >= AAA ? '#1f9d55' : ratio >= AA ? '#c58a09' : '#d33a3a';
  return (
    <li className="kc-check">
      <span className="kc-check__label">{label}</span>
      <span className="kc-check__ratio">
        {ratio.toFixed(2)}:1
        {info
          ? <span className="kc-pill kc-pill--no" style={{ textDecoration: 'none' }}>decorativo</span>
          : <>
              <span className={`kc-pill ${ratio >= AA ? 'kc-pill--ok' : 'kc-pill--no'}`}>AA</span>
              <span className={`kc-pill ${ratio >= AAA ? 'kc-pill--ok' : 'kc-pill--no'}`}>AAA</span>
            </>}
      </span>
      <span className="kc-meter" aria-hidden="true">
        <span className="kc-meter__fill" style={{ width: pct(ratio), background: tone }} />
        {!info && <span className="kc-meter__mark" style={{ left: pct(AA) }} />}
        {!info && <span className="kc-meter__mark" style={{ left: pct(AAA) }} />}
      </span>
    </li>
  );
}

// mini lava: dos cuerpos que se tocan, con el contorno rosa y la franja azul del halo
function Stage({ p, name, icon }: { p: Palette; name: string; icon: string }) {
  const ok = (['bg', 'ink', 'rimA', 'rimB'] as const).every((k) => HEX.test(p[k]));
  const c = ok ? p : { bg: '#888888', ink: '#ffffff', rimA: '#ffffff', rimB: '#ffffff' };
  return (
    <div className="kc-stage" style={{ background: c.bg, color: c.ink, position: 'relative', overflow: 'hidden', minHeight: 230, alignContent: 'start' }}>
      <svg viewBox="0 0 320 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs><filter id={`kc-blur-${name}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter></defs>
        <g fill="none" style={{ mixBlendMode: 'screen' }}>
          <path d="M70 70c30-40 95-35 110 5 12 30 60 25 70 60 12 45-50 70-95 50-30-13-55 15-85-10-30-26-25-75 0-105z" stroke={c.rimB} strokeWidth="14" opacity="0.5" filter={`url(#kc-blur-${name})`} />
          <path d="M70 70c30-40 95-35 110 5 12 30 60 25 70 60 12 45-50 70-95 50-30-13-55 15-85-10-30-26-25-75 0-105z" stroke={c.rimA} strokeWidth="3" opacity="0.9" />
          <circle cx="268" cy="44" r="22" stroke={c.rimB} strokeWidth="10" opacity="0.45" filter={`url(#kc-blur-${name})`} />
          <circle cx="268" cy="44" r="22" stroke={c.rimA} strokeWidth="2.5" opacity="0.9" />
        </g>
      </svg>
      <span className="kc-stage__tag" style={{ position: 'relative' }}><span aria-hidden="true">{icon}</span>{name}</span>
      <p className="kc-stage__title" style={{ position: 'relative', textAlign: 'center', marginTop: 18 }}>¿Diseñamos algo que destaque?</p>
      <div className="kc-stage__row" style={{ position: 'relative', justifyContent: 'center' }}>
        <span className="kc-btn" style={{ background: c.ink, color: c.bg }}>Escríbeme</span>
        <span className="kc-btn" style={{ boxShadow: `inset 0 0 0 1px ${c.ink}`, color: c.ink }}>Usar el formulario</span>
      </div>
    </div>
  );
}

export function finaleColorField({ label }: { label: string }): BasicFormField<FinaleColor> {
  return {
    kind: 'form',
    label,
    defaultValue: () => DEFAULT,
    parse: (raw) => {
      const v = (raw ?? {}) as Partial<FinaleColor>;
      return { mode: v.mode === 'custom' ? 'custom' : 'accent', light: { ...DEFAULT.light, ...v.light }, dark: { ...DEFAULT.dark, ...v.dark } };
    },
    serialize: (value) => ({ value }),
    validate: validateFinale,
    reader: { parse: (raw) => validateFinale({ ...DEFAULT, ...(raw as Partial<FinaleColor>) }) },
    Input({ value, onChange, forceValidation }) {
      const custom = value.mode === 'custom';
      const set = (m: 'light' | 'dark', k: keyof Palette) => (v: string) => onChange({ ...value, [m]: { ...value[m], [k]: v } });
      let error = '';
      try { validateFinale(value); } catch (e) { error = (e as Error).message; }
      const allHex = (['light', 'dark'] as const).every((m) => (['bg', 'ink', 'rimA', 'rimB'] as const).every((k) => HEX.test(value[m][k])));
      return (
        <div className="kc">
          <ColorStyles />
          <Head
            title={label}
            sub="Fondo, texto y halo de la sección de contacto (pie de todas las páginas). El texto y los botones deben cumplir WCAG AA sobre el fondo para poder guardar."
            status={
              <div className="kc-seg" role="group" aria-label="Origen del fondo y el texto">
                <button type="button" aria-pressed={!custom} onClick={() => onChange({ ...value, mode: 'accent' })}>Usar el acento</button>
                <button type="button" aria-pressed={custom} onClick={() => onChange({ ...value, mode: 'custom' })}>Personalizado</button>
              </div>
            }
          />
          <div className="kc-modes">
            {(['light', 'dark'] as const).map((m) => {
              const p = custom ? value[m] : { ...value[m], ...ACCENT[m] };
              const valid = (['bg', 'ink', 'rimA', 'rimB'] as const).every((k) => HEX.test(p[k]));
              return (
                <div className="kc-mode" key={m}>
                  <Stage p={p} name={MODES[m].name} icon={MODES[m].icon} />
                  <div className="kc-controls">
                    {custom ? (
                      <div className="kc-pair">
                        <Swatch label="Fondo" value={value[m].bg} onChange={set(m, 'bg')} />
                        <Swatch label="Texto y botones" value={value[m].ink} onChange={set(m, 'ink')} />
                      </div>
                    ) : (
                      <p className="kc-sub" style={{ margin: 0 }}>Fondo y texto salen del <strong>color de acento</strong> (arriba). La vista previa muestra el morado original.</p>
                    )}
                    <div className="kc-pair">
                      <Swatch label="Contorno del halo" value={value[m].rimA} onChange={set(m, 'rimA')} />
                      <Swatch label="Brillo exterior" value={value[m].rimB} onChange={set(m, 'rimB')} />
                    </div>
                    {valid && (
                      <ul className="kc-checks">
                        {custom && <Check label="Título, texto y botones sobre el fondo" ratio={contrast(p.ink, p.bg)} />}
                        <Check label="Contorno del halo sobre el fondo" ratio={contrast(screen(p.bg, p.rimA, 0.8), p.bg)} info />
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {error && (forceValidation || allHex) && <p role="alert" className="kc-error">No se puede guardar: {error}</p>}
          <button type="button" onClick={() => onChange(DEFAULT)} style={{ justifySelf: 'start', border: 0, background: 'none', padding: 0, color: 'inherit', opacity: 0.72, font: '500 13px ui-sans-serif, system-ui, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Restaurar colores originales
          </button>
        </div>
      );
    },
  };
}
